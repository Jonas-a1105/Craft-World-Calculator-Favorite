import type { FactoryDataRow } from '../../../services/craftworldCalculations';
import type { ArbitrageIngredient, TradingOpportunity } from '../types';

export interface ArbitrageAnalysisResult {
  symbol: string;
  name: string;
  costToCraftCoin: number;
  marketSellPriceCoin: number;
  netRevenueCoin: number; // after 5% marketplace commission
  netProfitCoin: number;
  marginPercent: number;
  ingredients: ArbitrageIngredient[];
  cycleTimeMinutes: number;
  isProfitable: boolean;
}

const MARKETPLACE_TAX_RATE = 0.05; // 5% fee on selling

/**
 * Calculates industrial crafting arbitrage for a given factory row and price map
 */
export function calculateCraftArbitrage(
  factoryRow: FactoryDataRow,
  priceMap: Record<string, number>,
): ArbitrageAnalysisResult | null {
  const outputSymbol = factoryRow.output_token?.toUpperCase();
  if (!outputSymbol || (factoryRow.output_amount || 0) <= 0) {
    return null;
  }

  const outputMarketPrice = priceMap[outputSymbol] || 0;
  if (outputMarketPrice <= 0) {
    return null;
  }

  const ingredients: ArbitrageIngredient[] = [];
  let totalInputCostCoin = 0;

  // Input 1
  if (factoryRow.input_token_1 && (factoryRow.input_amount_1 || 0) > 0) {
    const sym1 = factoryRow.input_token_1.toUpperCase();
    const p1 = priceMap[sym1] || 0;
    const cost1 = factoryRow.input_amount_1 * p1;
    totalInputCostCoin += cost1;
    ingredients.push({
      symbol: factoryRow.input_token_1,
      qtyNeeded: factoryRow.input_amount_1,
      marketPriceCoin: p1,
      totalCostCoin: cost1,
    });
  }

  // Input 2
  if (factoryRow.input_token_2 && (factoryRow.input_amount_2 || 0) > 0) {
    const sym2 = factoryRow.input_token_2.toUpperCase();
    const p2 = priceMap[sym2] || 0;
    const cost2 = factoryRow.input_amount_2 * p2;
    totalInputCostCoin += cost2;
    ingredients.push({
      symbol: factoryRow.input_token_2,
      qtyNeeded: factoryRow.input_amount_2,
      marketPriceCoin: p2,
      totalCostCoin: cost2,
    });
  }

  // If missing input prices, we cannot reliably compute arbitrage
  if (ingredients.length === 0 || totalInputCostCoin <= 0) {
    return null;
  }

  const grossRevenueCoin = (factoryRow.output_amount || 1) * outputMarketPrice;
  const netRevenueCoin = grossRevenueCoin * (1 - MARKETPLACE_TAX_RATE);
  const netProfitCoin = netRevenueCoin - totalInputCostCoin;
  const marginPercent = totalInputCostCoin > 0 ? (netProfitCoin / totalInputCostCoin) * 100 : 0;

  return {
    symbol: factoryRow.output_token,
    name: factoryRow.output_token,
    costToCraftCoin: Number(totalInputCostCoin.toFixed(2)),
    marketSellPriceCoin: Number(outputMarketPrice.toFixed(2)),
    netRevenueCoin: Number(netRevenueCoin.toFixed(2)),
    netProfitCoin: Number(netProfitCoin.toFixed(2)),
    marginPercent: Number(marginPercent.toFixed(1)),
    ingredients,
    cycleTimeMinutes: factoryRow.duration_min || 10,
    isProfitable: netProfitCoin > 0,
  };
}

/**
 * Scans a list of factory recipes and extracts all profitable craft arbitrage opportunities
 */
export function scanCraftArbitrageOpportunities(
  factoryRows: FactoryDataRow[],
  priceMap: Record<string, number>,
  minMarginPercent = 15,
): TradingOpportunity[] {
  const seenOutputs = new Set<string>();
  const opportunities: TradingOpportunity[] = [];

  for (const row of factoryRows) {
    const sym = row.output_token?.toUpperCase();
    if (!sym || seenOutputs.has(sym)) continue;

    const analysis = calculateCraftArbitrage(row, priceMap);
    if (!analysis || analysis.marginPercent < minMarginPercent) continue;

    seenOutputs.add(sym);

    // Score from 0 to 100 based on margin %
    const score = Math.min(99, Math.max(50, Math.round(50 + analysis.marginPercent * 1.1)));
    const tier = score >= 85 ? 'S' : score >= 70 ? 'A' : 'B';

    opportunities.push({
      id: `arbitrage-${sym}-${Date.now()}`,
      symbol: analysis.symbol,
      name: analysis.name,
      type: 'CRAFT_ARBITRAGE',
      score,
      tier,
      currentPrice: analysis.costToCraftCoin,
      referencePrice: analysis.marketSellPriceCoin,
      priceDeltaPercent: analysis.marginPercent,
      potentialMarginPercent: analysis.marginPercent,
      potentialProfitCoin: analysis.netProfitCoin,
      ingredients: analysis.ingredients,
      cycleTimeMinutes: analysis.cycleTimeMinutes,
      reason: `Fabricar ${analysis.symbol} cuesta ${analysis.costToCraftCoin.toLocaleString()} COIN en insumos y se vende neto a ${analysis.netRevenueCoin.toLocaleString()} COIN.`,
      actionRecommendation: `Comprar insumos en el mercado y producir ${analysis.symbol} (+${analysis.marginPercent}% margen neto).`,
      timestamp: Date.now(),
    });
  }

  return opportunities.sort((a, b) => b.potentialMarginPercent - a.potentialMarginPercent);
}
