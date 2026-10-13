import type { FactoryDataRow } from '../../../services/factoryData';
import type { RoninPoolsDataset } from '../../../services/roninPoolsService';
import { getResourceCategory } from './accountAggregator';
import {
  getMasteryInputFactorByLevel,
  getMasteryInputReductionPercent,
  applyMasteryInputReduction,
  type ProficiencyItem,
} from '../../../services/masteryModifiers';
import {
  buildRecipeTree,
  flattenRecipeToBaseResources,
} from '../../../services/craftworldCalculations';
import {
  getBuyCostMultiplier,
  getSellRevenueMultiplier,
} from '../../../services/gameConfig';
import { DEFAULT_MARKET_PRICES, FALLBACK_RESOURCE_PRICE } from '../../../services/priceService';
import { DEFAULT_COIN_DATA } from '../../../services/coin/coinTypes';
import { marginPercentOnRevenue } from '../../../services/financial/pricingService';
import type {
  FactoryRowConfig,
  FactoryTableRow,
  GlobalProfitabilitySettings,
  ProfitabilitySummaryTotals,
  TableCategory,
  TableSortField,
  SortDirection,
} from '../types';

export function calculatePriceChanges(
  symbol: string,
  currentPrice: number,
  poolsDataset?: RoninPoolsDataset | null,
): { change1h: number; change24h: number } {
  if (!poolsDataset?.resources) {
    return { change1h: 0, change24h: 0 };
  }

  const pool = poolsDataset.resources[symbol.toUpperCase()];
  const history = pool?.price1d?.history;

  if (!history || history.length < 2) {
    return { change1h: 0, change24h: 0 };
  }

  const latestPrice = currentPrice > 0 ? currentPrice : history[history.length - 1].price;
  const p24h = history[0].price;
  const p1h = history.length >= 2 ? history[history.length - 2].price : latestPrice;

  const change1h = p1h > 0 ? ((latestPrice - p1h) / p1h) * 100 : 0;
  const change24h = p24h > 0 ? ((latestPrice - p24h) / p24h) * 100 : 0;

  return {
    change1h: Number.isFinite(change1h) ? change1h : 0,
    change24h: Number.isFinite(change24h) ? change24h : 0,
  };
}

export function computeFactoryTableRow({
  token,
  config,
  accountBaseline,
  prices,
  tokenRows,
  allRows,
  settings,
  poolsDataset,
  coinUsdPrice,
}: {
  token: string;
  config: FactoryRowConfig;
  accountBaseline: FactoryRowConfig;
  prices: Record<string, number>;
  tokenRows: FactoryDataRow[];
  allRows: FactoryDataRow[];
  settings: GlobalProfitabilitySettings;
  poolsDataset?: RoninPoolsDataset | null;
  coinUsdPrice: number;
}): FactoryTableRow {
  const norm = token.toUpperCase().trim();
  const sortedRows = [...tokenRows].sort((a, b) => a.level - b.level);
  const maxLevel = sortedRows.length > 0 ? sortedRows[sortedRows.length - 1].level : 50;
  const activeLevel = Math.max(1, Math.min(config.level, maxLevel));
  const activeRow = sortedRows.find((r) => r.level === activeLevel) || sortedRows[0] || {
    token: norm,
    level: activeLevel,
    duration_min: 60,
    output_token: norm,
    output_amount: 1,
    input_token_1: '',
    input_amount_1: 0,
    input_token_2: '',
    input_amount_2: 0,
    upgrade_token: '',
    upgrade_amount: 0,
    power_cost: 0,
  };

  // Prices
  const rawPriceCoin = typeof prices[norm] === 'number' && prices[norm] > 0
    ? prices[norm]
    : (DEFAULT_MARKET_PRICES[norm] ?? FALLBACK_RESOURCE_PRICE);
  const priceCoin = rawPriceCoin;
  const priceUsd = priceCoin * (coinUsdPrice > 0 ? coinUsdPrice : DEFAULT_COIN_DATA.priceUsd);

  const { change1h, change24h } = calculatePriceChanges(norm, priceCoin, poolsDataset);

  // CORRECCIÓN BUG-007: Separar claramente boost manual (config) y automático (settings)
  // Si el usuario tiene config.boost='x2' se aplica 2x. Si settings.adBoost2x es true, también 2x.
  // Ambos no se multiplican (máximo 2x, no 4x).
  // Speed calculations: Duration & Runs per hour
  // Física oficial: workshop y workers REDUCEN el tiempo (×(1−p)), no lo dividen
  // (÷(1+p)). El booster ×2 sí es multiplicador de velocidad (duración /2).
  const baseDurationMin = Math.max(0.001, activeRow.duration_min);
  const workshopFactor = config.workshopPercent > 0 ? 1 - config.workshopPercent / 100 : 1;
  const workerFactor = config.workerPercent > 0 ? 1 - config.workerPercent / 100 : 1;
  const boostMult = config.boost === 'x2' || settings.adBoost2x ? 2 : 1;

  // Final adjusted cycle duration in minutes
  const adjustedDurationMin = (baseDurationMin * workshopFactor * workerFactor) / boostMult;
  const runsPerHour = adjustedDurationMin > 0 ? 60 / adjustedDurationMin : 0;

  // Slippage multipliers
  const buySlippageMult = settings.buySlippage ? 1.01 : 1.0;
  const sellSlippageMult = settings.sellSlippage ? 0.99 : 1.0;

  // Mastery reduction
  const dummyProficiency: ProficiencyItem[] = [
    { token: norm, symbol: norm, claimedLevel: config.masteryLevel },
  ];
  const masteryReductionPercent = getMasteryInputReductionPercent(norm, dummyProficiency);

  // Inputs cost calculation
  let singleCycleInputCost = 0;

  if (settings.inputSupplyMode === 'self_crafted') {
    const tree = buildRecipeTree(allRows, norm, 1, activeLevel);
    // Maestría aplicada UNA vez por nodo (factor oficial inputDiscountFactor):
    // la maestría del producto que se craftea en cada nodo descuenta SUS insumos.
    const baseReqs = flattenRecipeToBaseResources(tree, {}, () =>
      getMasteryInputFactorByLevel(config.masteryLevel),
    );
    if (!baseReqs || Object.keys(baseReqs).length === 0 || tree?.circular || tree?.missingRecipe) {
      console.warn('Advertencia: Datos de receta inválidos o circulares para', norm, '- usando precios directos');
    }
    Object.entries(baseReqs).forEach(([tok, amt]) => {
      if (tok !== norm) {
        // Materiales base autoporducidos: coste de oportunidad a precio de
        // mercado (no pagan tax porque no pasan por el exchange).
        const p = (prices[tok] ?? DEFAULT_MARKET_PRICES[tok] ?? FALLBACK_RESOURCE_PRICE) * buySlippageMult;
        singleCycleInputCost += amt * activeRow.output_amount * p;
      }
    });
  } else {
    // Market input supply: comprar en el exchange paga el 2,5% de trade input tax.
    const buyMult = buySlippageMult * getBuyCostMultiplier();
    if (activeRow.input_token_1 && activeRow.input_amount_1 > 0) {
      const sym1 = activeRow.input_token_1.toUpperCase();
      const adj1 = applyMasteryInputReduction(activeRow.input_amount_1, norm, dummyProficiency);
      const p1 = (prices[sym1] ?? DEFAULT_MARKET_PRICES[sym1] ?? FALLBACK_RESOURCE_PRICE) * buyMult;
      singleCycleInputCost += adj1 * p1;
    }
    if (activeRow.input_token_2 && activeRow.input_amount_2 > 0) {
      const sym2 = activeRow.input_token_2.toUpperCase();
      const adj2 = applyMasteryInputReduction(activeRow.input_amount_2, norm, dummyProficiency);
      const p2 = (prices[sym2] ?? DEFAULT_MARKET_PRICES[sym2] ?? FALLBACK_RESOURCE_PRICE) * buyMult;
      singleCycleInputCost += adj2 * p2;
    }
  }

  // Revenue & output: vender en el exchange cobra el trade input tax (2,5%).
  const outputPrice = priceCoin * sellSlippageMult * getSellRevenueMultiplier();
  const singleCycleRevenue = activeRow.output_amount * outputPrice;
  const singleCycleProfit = singleCycleRevenue - singleCycleInputCost;

  // Power metrics
  const singlePowerKwPerHour = (activeRow.power_cost || 0) * runsPerHour;
  const count = Math.max(0, config.count);

  const powerKwPerHour = count > 0 ? singlePowerKwPerHour * count : 0;
  const powerCostCoinPerHour =
    settings.powerPriceCoin > 0 ? (powerKwPerHour / 100000) * settings.powerPriceCoin : 0;

  // Output and Profit metrics
  const outputPerHour = count > 0 ? activeRow.output_amount * runsPerHour * count : 0;
  const grossRevenuePerHour = count > 0 ? singleCycleRevenue * runsPerHour * count : 0;
  const inputCostPerHour = count > 0 ? singleCycleInputCost * runsPerHour * count : 0;

  const profitPerHour =
    count > 0 ? singleCycleProfit * runsPerHour * count - powerCostCoinPerHour : 0;
  const profitPerDay = profitPerHour * 24;

  const marginPercent = marginPercentOnRevenue(grossRevenuePerHour, inputCostPerHour);

  const isOwned = accountBaseline.count > 0;
  const isModified =
    config.count !== accountBaseline.count ||
    config.level !== accountBaseline.level ||
    config.masteryLevel !== accountBaseline.masteryLevel ||
    config.workerPercent !== accountBaseline.workerPercent ||
    config.workshopPercent !== accountBaseline.workshopPercent ||
    config.boost !== accountBaseline.boost;

  return {
    token: norm,
    name: norm.charAt(0) + norm.slice(1).toLowerCase(),
    category: getResourceCategory(norm),
    priceCoin,
    priceUsd,
    change1h,
    change24h,

    count: config.count,
    level: activeLevel,
    maxLevel,
    masteryLevel: config.masteryLevel,
    masteryReductionPercent,
    workerPercent: config.workerPercent,
    workshopPercent: config.workshopPercent,
    boost: config.boost,

    accountCount: accountBaseline.count,
    accountLevel: accountBaseline.level,
    accountMasteryLevel: accountBaseline.masteryLevel,
    accountWorkerPercent: accountBaseline.workerPercent,
    accountWorkshopPercent: accountBaseline.workshopPercent,
    accountBoost: accountBaseline.boost,
    isOwned,
    isModified,

    powerKwPerHour,
    powerCostCoinPerHour,
    profitPerHour,
    profitPerDay,
    runsPerHour,
    outputPerHour,
    grossRevenuePerHour,
    inputCostPerHour,
    marginPercent,

    activeRow,
    allRows: sortedRows,
  };
}

export function calculateSummaryTotals(
  rows: FactoryTableRow[],
  coinUsdPrice: number,
  coin1hChange: number,
  coin24hChange: number,
): ProfitabilitySummaryTotals {
  let totalProfitPerHour = 0;
  let totalPowerKwPerHour = 0;
  let totalPowerCostPerHour = 0;
  let totalActiveFactories = 0;
  let totalActiveTokens = 0;

  rows.forEach((row) => {
    if (row.count > 0) {
      totalProfitPerHour += row.profitPerHour;
      totalPowerKwPerHour += row.powerKwPerHour;
      totalPowerCostPerHour += row.powerCostCoinPerHour;
      totalActiveFactories += row.count;
      totalActiveTokens += 1;
    }
  });

  return {
    totalProfitPerHour,
    totalProfitPerDay: totalProfitPerHour * 24,
    totalPowerKwPerHour,
    totalPowerCostPerHour,
    totalActiveFactories,
    totalActiveTokens,
    coinUsdPrice,
    coin1hChange,
    coin24hChange,
  };
}

export function filterAndSortTableRows({
  rows,
  search,
  category,
  favorites,
  sortBy,
  sortDirection,
}: {
  rows: FactoryTableRow[];
  search: string;
  category: TableCategory;
  favorites: string[];
  sortBy: TableSortField;
  sortDirection: SortDirection;
}): FactoryTableRow[] {
  const query = search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    const matchesSearch =
      !query ||
      row.token.toLowerCase().includes(query) ||
      row.name.toLowerCase().includes(query) ||
      row.category.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (category === 'all') return true;
    if (category === 'favorites') return favorites.includes(row.token.toUpperCase());
    if (category === 'active') return row.count > 0;
    return row.category === category;
  });

  return filtered.sort((a, b) => {
    // When not sorting strictly by a field, keep favorites at top if in 'all' view
    let cmp = 0;
    switch (sortBy) {
      case 'resource':
        cmp = a.token.localeCompare(b.token);
        break;
      case 'price':
        cmp = a.priceCoin - b.priceCoin;
        break;
      case 'change1h':
        cmp = a.change1h - b.change1h;
        break;
      case 'change24h':
        cmp = a.change24h - b.change24h;
        break;
      case 'count':
        cmp = a.count - b.count;
        break;
      case 'level':
        cmp = a.level - b.level;
        break;
      case 'mastery':
        cmp = a.masteryLevel - b.masteryLevel;
        break;
      case 'power':
        cmp = a.powerKwPerHour - b.powerKwPerHour;
        break;
      case 'profit':
      default:
        cmp = a.profitPerHour - b.profitPerHour;
        break;
    }

    return sortDirection === 'desc' ? -cmp : cmp;
  });
}
