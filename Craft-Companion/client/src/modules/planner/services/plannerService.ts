import type { FactoryDataRow } from '../../../services/factoryData';
import type { RecipeNode } from '../../../services/craftworldCalculations';
import { formatNumber } from '../../../utils/formatters';
import type {
  CraftingStep,
  PlannerKpiStats,
  MaterialFilter,
  MaterialEntry,
  DirectInputRequirement,
  TacticalStepAction,
} from '../types';

export const RAW_ELEMENTS = new Set([
  'EARTH',
  'WATER',
  'FIRE',
  'DUST',
  'LUMBER',
]);

function normalizeSymbol(sym?: string): string {
  return (sym || '').trim().toUpperCase();
}

export function getFactoryRow(
  rows: FactoryDataRow[],
  token: string,
): FactoryDataRow | undefined {
  const norm = normalizeSymbol(token);
  const candidates = rows.filter(
    (r) =>
      normalizeSymbol(r.output_token) === norm ||
      normalizeSymbol(r.token) === norm,
  );
  if (!candidates.length) return undefined;
  return [...candidates].sort((a, b) => a.level - b.level)[0];
}

export function extractBlueprintEntries(
  rows: FactoryDataRow[],
  targetToken: string,
  targetAmount: number,
  userResources: Record<string, number> = {},
  prices: Record<string, number> = {},
  filter: MaterialFilter = 'all',
  powerPricePer100k = 0,
): MaterialEntry[] {
  const normalizedTarget = normalizeSymbol(targetToken);
  const nodeMap = new Map<
    string,
    {
      symbol: string;
      requiredQty: number;
      row?: FactoryDataRow;
      depth: number;
      isTarget: boolean;
    }
  >();

  function walk(token: string, amount: number, depth = 0) {
    const norm = normalizeSymbol(token);
    if (!norm) return;

    const row = getFactoryRow(rows, norm);
    const existing = nodeMap.get(norm) || {
      symbol: norm,
      requiredQty: 0,
      row,
      depth: 0,
      isTarget: norm === normalizedTarget,
    };

    existing.requiredQty += amount;
    existing.depth = Math.max(existing.depth, depth);
    nodeMap.set(norm, existing);

    if (!row || row.output_amount <= 0 || RAW_ELEMENTS.has(norm)) {
      return;
    }

    const scale = amount / row.output_amount;
    if (row.input_token_1) {
      walk(row.input_token_1, row.input_amount_1 * scale, depth + 1);
    }
    if (row.input_token_2) {
      walk(row.input_token_2, row.input_amount_2 * scale, depth + 1);
    }
  }

  walk(normalizedTarget, Math.max(1, targetAmount), 0);

  // Sort: base resources first (highest depth), then intermediate products, up to target (depth 0)
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => {
    if (b.depth !== a.depth) return b.depth - a.depth;
    return a.symbol.localeCompare(b.symbol);
  });

  const allEntries: MaterialEntry[] = sortedNodes.map((item, idx) => {
    const sym = item.symbol;
    const row = item.row;
    const currentStock = userResources[sym] || 0;
    const missing = Math.max(0, item.requiredQty - currentStock);
    const percentCovered =
      item.requiredQty > 0
        ? Math.min(100, Math.round((currentStock / item.requiredQty) * 100))
        : 100;
    const unitPrice = prices[sym] || 0;
    const costOfMissing = missing * unitPrice;

    const isRaw = RAW_ELEMENTS.has(sym) || !row;
    const isCraftable = Boolean(row && row.output_amount > 0 && !RAW_ELEMENTS.has(sym));

    let craftCostPerUnit = 0;
    const directInputs: DirectInputRequirement[] = [];
    let inputSymbol: string | undefined = undefined;
    let inputRequiredQty = 0;
    let inputUnitPrice = 0;
    let inputSellRevenue = 0;

    if (isCraftable && row && row.output_amount > 0) {
      if (row.input_token_1) {
        const inpToken = normalizeSymbol(row.input_token_1);
        const amtPerUnit = row.input_amount_1 / row.output_amount;
        const inpPrice = prices[inpToken] || 0;
        craftCostPerUnit += amtPerUnit * inpPrice;
        const totalInpAmt = amtPerUnit * item.requiredQty;
        directInputs.push({
          token: inpToken,
          amountPerUnit: amtPerUnit,
          totalAmount: totalInpAmt,
          unitPrice: inpPrice,
        });

        inputSymbol = inpToken;
        inputRequiredQty += totalInpAmt;
        inputUnitPrice = inpPrice;
        inputSellRevenue += totalInpAmt * inpPrice;
      }
      if (row.input_token_2) {
        const inpToken = normalizeSymbol(row.input_token_2);
        const amtPerUnit = row.input_amount_2 / row.output_amount;
        const inpPrice = prices[inpToken] || 0;
        craftCostPerUnit += amtPerUnit * inpPrice;
        const totalInpAmt = amtPerUnit * item.requiredQty;
        directInputs.push({
          token: inpToken,
          amountPerUnit: amtPerUnit,
          totalAmount: totalInpAmt,
          unitPrice: inpPrice,
        });

        if (!inputSymbol) inputSymbol = inpToken;
        inputRequiredQty += totalInpAmt;
        inputSellRevenue += totalInpAmt * inpPrice;
      }
      if (row.power_cost && powerPricePer100k > 0) {
        const powerPerUnit = row.power_cost / row.output_amount;
        craftCostPerUnit += powerPerUnit * (powerPricePer100k / 100_000);
      }
    }

    // Chain Arbitrage: Vender Insumo vs Comprar Producto
    const targetBuyCost = item.requiredQty * unitPrice;
    let tacticalAction: TacticalStepAction = 'base_harvest';
    let arbitrageDelta = 0;
    let arbitrageBenefitPercent = 0;

    if (isRaw) {
      tacticalAction = 'base_harvest';
    } else if (isCraftable) {
      arbitrageDelta = inputSellRevenue - targetBuyCost;
      if (arbitrageDelta > 0.0001 && targetBuyCost > 0) {
        tacticalAction = 'sell_input_buy_next';
        arbitrageBenefitPercent = (arbitrageDelta / targetBuyCost) * 100;
      } else {
        tacticalAction = 'convert_in_factory';
        arbitrageBenefitPercent =
          inputSellRevenue > 0
            ? (Math.abs(arbitrageDelta) / inputSellRevenue) * 100
            : 0;
      }
    }

    const isCraftCheaper = tacticalAction === 'convert_in_factory';
    const recommendedAction: 'buy' | 'craft' = isCraftable
      ? isCraftCheaper
        ? 'craft'
        : 'buy'
      : 'buy';

    const savingsPerUnit = isCraftable ? Math.abs(unitPrice - craftCostPerUnit) : 0;
    const baseline = isCraftCheaper ? craftCostPerUnit : unitPrice;
    const savingsPercent =
      baseline > 0 && isCraftable
        ? Math.min(100, (savingsPerUnit / baseline) * 100)
        : 0;

    return {
      symbol: sym,
      stageIndex: idx + 1,
      depth: item.depth,
      isTarget: item.isTarget,
      isRawElement: isRaw,
      isCraftable,
      factoryName: row ? row.token : undefined,
      requiredQty: item.requiredQty,
      currentStock,
      missing,
      percentCovered,
      unitPrice,
      costOfMissing,
      craftCostPerUnit,
      totalCraftCost: craftCostPerUnit * item.requiredQty,
      recommendedAction,
      savingsPerUnit,
      savingsPercent,
      isCraftCheaper,
      directInputs,
      tacticalAction,
      inputSymbol,
      inputRequiredQty,
      inputUnitPrice,
      inputSellRevenue,
      targetBuyCost,
      arbitrageDelta,
      arbitrageBenefitPercent,
    };
  });

  return allEntries.filter((entry) => {
    if (filter === 'sell_buy') return entry.tacticalAction === 'sell_input_buy_next';
    if (filter === 'convert') return entry.tacticalAction === 'convert_in_factory';
    if (filter === 'craft') return entry.recommendedAction === 'craft';
    if (filter === 'buy') return entry.recommendedAction === 'buy';
    if (filter === 'missing') return entry.missing > 0;
    if (filter === 'ready') return entry.missing === 0;
    return true;
  });
}

export function extractCraftingSteps(
  node: RecipeNode,
  steps: CraftingStep[] = [],
): CraftingStep[] {
  if (!node.row) return steps;

  // Process children first so dependencies are presented bottom-up
  node.children.forEach((child) => extractCraftingSteps(child, steps));

  const cycles = Math.ceil(node.amount / node.row.output_amount);
  const inputs: { token: string; amount: number }[] = [];
  if (node.row.input_token_1) {
    inputs.push({
      token: node.row.input_token_1,
      amount: node.row.input_amount_1 * cycles,
    });
  }
  if (node.row.input_token_2) {
    inputs.push({
      token: node.row.input_token_2,
      amount: node.row.input_amount_2 * cycles,
    });
  }

  const existing = steps.find(
    (s) => s.outputToken === node.token && s.factoryName === node.row?.token,
  );
  if (existing) {
    existing.outputAmount += node.amount;
    existing.cyclesNeeded += cycles;
    existing.totalTimeMin = existing.cyclesNeeded * existing.factoryDurationMin;
  } else {
    steps.push({
      outputToken: node.token,
      outputAmount: node.amount,
      factoryName: node.row.token,
      factoryDurationMin: node.row.duration_min,
      cyclesNeeded: cycles,
      totalTimeMin: cycles * node.row.duration_min,
      inputs,
    });
  }
  return steps;
}

export function computeKpiStats(
  source: Record<string, number> | MaterialEntry[],
  userResources: Record<string, number> = {},
  prices: Record<string, number> = {},
  targetToken?: string,
  targetAmount: number = 1,
): PlannerKpiStats {
  let entries: Array<{
    symbol: string;
    requiredQty: number;
    currentStock: number;
    missing: number;
    price: number;
    tacticalAction?: TacticalStepAction;
    arbitrageDelta?: number;
  }> = [];

  if (Array.isArray(source)) {
    entries = source.map((e) => ({
      symbol: e.symbol,
      requiredQty: e.requiredQty,
      currentStock: e.currentStock,
      missing: e.missing,
      price: e.unitPrice,
      tacticalAction: e.tacticalAction,
      arbitrageDelta: e.arbitrageDelta,
    }));
  } else {
    entries = Object.entries(source).map(([sym, req]) => {
      const inStock = userResources[sym] || 0;
      const missing = Math.max(0, req - inStock);
      const price = prices[sym] || 0;
      return {
        symbol: sym,
        requiredQty: req,
        currentStock: inStock,
        missing,
        price,
      };
    });
  }

  const totalTypes = entries.length;
  let readyTypes = 0;
  let totalMissingItems = 0;
  let totalMissingCost = 0;
  let sellBuyStepsCount = 0;
  let convertStepsCount = 0;
  let totalArbitrageProfit = 0;

  entries.forEach((entry) => {
    if (entry.missing === 0) {
      readyTypes += 1;
    } else {
      totalMissingItems += entry.missing;
      totalMissingCost += entry.missing * entry.price;
    }

    if (entry.tacticalAction === 'sell_input_buy_next') {
      sellBuyStepsCount += 1;
      if (entry.arbitrageDelta && entry.arbitrageDelta > 0) {
        totalArbitrageProfit += entry.arbitrageDelta;
      }
    } else if (entry.tacticalAction === 'convert_in_factory') {
      convertStepsCount += 1;
    }
  });

  const completionPercent =
    totalTypes > 0 ? Math.round((readyTypes / totalTypes) * 100) : 100;

  const targetUnitPrice = targetToken ? prices[targetToken.toUpperCase()] || 0 : 0;
  const marketBuyTotalCost = targetUnitPrice * targetAmount;
  const savingsVsMarket =
    marketBuyTotalCost > 0 ? marketBuyTotalCost - totalMissingCost : 0;
  const savingsPercent =
    marketBuyTotalCost > 0 ? (savingsVsMarket / marketBuyTotalCost) * 100 : 0;
  const isCraftingCheaper =
    marketBuyTotalCost > 0 && totalMissingCost < marketBuyTotalCost;

  return {
    totalTypes,
    readyTypes,
    missingTypes: totalTypes - readyTypes,
    totalMissingItems,
    totalMissingCost,
    completionPercent,
    canCraftInstantly: readyTypes === totalTypes && totalTypes > 0,
    targetUnitPrice,
    marketBuyTotalCost,
    savingsVsMarket,
    savingsPercent,
    isCraftingCheaper,
    sellBuyStepsCount,
    convertStepsCount,
    totalArbitrageProfit,
  };
}

export function buildMaterialEntries(
  baseRequirements: Record<string, number>,
  userResources: Record<string, number>,
  prices: Record<string, number>,
  filter: MaterialFilter,
): MaterialEntry[] {
  const entries = Object.entries(baseRequirements).map(([symbol, requiredQty], idx) => {
    const currentStock = userResources[symbol] || 0;
    const missing = Math.max(0, requiredQty - currentStock);
    const percentCovered =
      requiredQty > 0
        ? Math.min(100, Math.round((currentStock / requiredQty) * 100))
        : 100;
    const unitPrice = prices[symbol] || 0;
    const costOfMissing = missing * unitPrice;
    const isRawElement = RAW_ELEMENTS.has(symbol.toUpperCase());
    const recommendedAction: 'buy' | 'craft' = isRawElement ? 'buy' : 'craft';

    return {
      symbol,
      stageIndex: idx + 1,
      depth: isRawElement ? 5 : 1,
      isTarget: false,
      isRawElement,
      isCraftable: !isRawElement,
      requiredQty,
      currentStock,
      missing,
      percentCovered,
      unitPrice,
      costOfMissing,
      craftCostPerUnit: 0,
      totalCraftCost: 0,
      recommendedAction,
      savingsPerUnit: 0,
      savingsPercent: 0,
      isCraftCheaper: !isRawElement,
      directInputs: [],
      tacticalAction: (isRawElement
        ? 'base_harvest'
        : 'convert_in_factory') as TacticalStepAction,
      arbitrageDelta: 0,
      arbitrageBenefitPercent: 0,
    };
  });

  return entries.filter((entry) => {
    if (filter === 'sell_buy') return entry.tacticalAction === 'sell_input_buy_next';
    if (filter === 'convert') return entry.tacticalAction === 'convert_in_factory';
    if (filter === 'craft') return entry.recommendedAction === 'craft';
    if (filter === 'buy') return entry.recommendedAction === 'buy';
    if (filter === 'missing') return entry.missing > 0;
    if (filter === 'ready') return entry.missing === 0;
    return true;
  });
}

export function buildMissingClipboardText(
  source: Record<string, number> | MaterialEntry[],
  userResources: Record<string, number>,
  targetToken: string,
  targetAmount: number,
): string {
  let missingLines: string[] = [];

  if (Array.isArray(source)) {
    missingLines = source
      .filter((e) => e.missing > 0)
      .map(
        (e) =>
          `• [Etapa ${e.stageIndex}] ${e.symbol}: ${formatNumber(e.missing)} faltantes (Requerido: ${formatNumber(e.requiredQty)}, En Almacén: ${formatNumber(e.currentStock)}) - Táctica: ${
            e.tacticalAction === 'sell_input_buy_next'
              ? `Vender ${e.inputSymbol} y comprar ${e.symbol}`
              : e.tacticalAction === 'convert_in_factory'
                ? `Convertir en fábrica`
                : `Comprar/Extraer`
          }`,
      );
  } else {
    missingLines = Object.entries(source)
      .map(([symbol, requiredQty]) => {
        const inStock = userResources[symbol] || 0;
        const missing = Math.max(0, requiredQty - inStock);
        if (missing <= 0) return null;
        return `• ${symbol}: ${formatNumber(missing)} faltantes (Requerido: ${formatNumber(requiredQty)}, En Stock: ${formatNumber(inStock)})`;
      })
      .filter(Boolean) as string[];
  }

  if (missingLines.length === 0) {
    return `Craft World Planner: ¡Tienes todos los recursos para fabricar ${targetAmount}x ${targetToken}!`;
  }

  return (
    `Craft World Planner - Plano de Faltantes para ${targetAmount}x ${targetToken}:\n` +
    missingLines.join('\n')
  );
}
