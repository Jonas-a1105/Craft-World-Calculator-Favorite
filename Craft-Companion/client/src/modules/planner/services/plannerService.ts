import type { RecipeNode } from '../../../services/craftworldCalculations';
import { formatNumber } from '../../../utils/formatters';
import type {
  CraftingStep,
  PlannerKpiStats,
  MaterialFilter,
  MaterialEntry,
} from '../types';

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
  baseRequirements: Record<string, number>,
  userResources: Record<string, number>,
  prices: Record<string, number>,
): PlannerKpiStats {
  const entries = Object.entries(baseRequirements);
  const totalTypes = entries.length;
  let readyTypes = 0;
  let totalMissingItems = 0;
  let totalMissingCost = 0;

  entries.forEach(([symbol, requiredQty]) => {
    const inStock = userResources[symbol] || 0;
    const missing = Math.max(0, requiredQty - inStock);
    if (missing === 0) {
      readyTypes += 1;
    } else {
      totalMissingItems += missing;
      const price = prices[symbol] || 0;
      totalMissingCost += missing * price;
    }
  });

  const completionPercent =
    totalTypes > 0 ? Math.round((readyTypes / totalTypes) * 100) : 100;

  return {
    totalTypes,
    readyTypes,
    missingTypes: totalTypes - readyTypes,
    totalMissingItems,
    totalMissingCost,
    completionPercent,
    canCraftInstantly: readyTypes === totalTypes && totalTypes > 0,
  };
}

export function buildMaterialEntries(
  baseRequirements: Record<string, number>,
  userResources: Record<string, number>,
  prices: Record<string, number>,
  filter: MaterialFilter,
): MaterialEntry[] {
  return Object.entries(baseRequirements)
    .map(([symbol, requiredQty]) => {
      const currentStock = userResources[symbol] || 0;
      const missing = Math.max(0, requiredQty - currentStock);
      const percentCovered =
        requiredQty > 0
          ? Math.min(100, Math.round((currentStock / requiredQty) * 100))
          : 100;
      const unitPrice = prices[symbol] || 0;
      const costOfMissing = missing * unitPrice;

      return {
        symbol,
        requiredQty,
        currentStock,
        missing,
        percentCovered,
        unitPrice,
        costOfMissing,
      };
    })
    .filter((entry) => {
      if (filter === 'missing') return entry.missing > 0;
      if (filter === 'ready') return entry.missing === 0;
      return true;
    });
}

export function buildMissingClipboardText(
  baseRequirements: Record<string, number>,
  userResources: Record<string, number>,
  targetToken: string,
  targetAmount: number,
): string {
  const missingLines = Object.entries(baseRequirements)
    .map(([symbol, requiredQty]) => {
      const inStock = userResources[symbol] || 0;
      const missing = Math.max(0, requiredQty - inStock);
      if (missing <= 0) return null;
      return `• ${symbol}: ${formatNumber(missing)} faltantes (Requerido: ${formatNumber(requiredQty)}, En Stock: ${formatNumber(inStock)})`;
    })
    .filter(Boolean);

  if (missingLines.length === 0) {
    return `Craft World Planner: ¡Tienes todos los recursos para fabricar ${targetAmount}x ${targetToken}!`;
  }

  return (
    `Craft World Planner - Faltantes para ${targetAmount}x ${targetToken}:\n` +
    missingLines.join('\n')
  );
}
