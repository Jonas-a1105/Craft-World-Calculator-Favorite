import { FactoryDataRow } from './factoryData';
import { getMasteryInputReductionPercent, ProficiencyItem } from './masteryModifiers';

export type ChainStep = {
  stepIndex: number;
  token: string;
  factoryLevel: number;
  durationMin: number;
  cyclesPerDay: number;
  outputAmountPerCycle: number;
  input1Token: string;
  input1AmountPerCycle: number;
  input2Token: string;
  input2AmountPerCycle: number;
  rawBaseUnitsRequired: Record<string, number>;
  masteryDiscountPercent: number;
  unitPrice: number;
  outputValuePerCycle: number;
  inputCostPerCycle: number;
  netProfitPerCycle: number;
  netProfitPerDay: number;
  cumulativeProfitPerDay: number;
  valueMultiplier: number;
};

export type ValueChainAnalysis = {
  targetToken: string;
  targetLevel: number;
  steps: ChainStep[];
  rawMaterialsNeeded: Record<string, number>;
  rawOpportunityCostDay: number;
  finalOutputValueDay: number;
  netProfitDay: number;
  totalMultiplier: number;
};

export function computeValueChain(
  targetToken: string,
  targetLevel: number,
  allRows: FactoryDataRow[],
  prices: Record<string, number>,
  proficiencies: ProficiencyItem[] = [],
  mode: 'self_crafted' | 'market_buy' = 'self_crafted'
): ValueChainAnalysis | null {
  const normalizedTarget = targetToken.toUpperCase();
  const basePriceMap: Record<string, number> = {
    COIN: 1,
    EARTH: 0.00394,
    WATER: 0.00394,
    FIRE: 0.00394,
    ...prices,
  };

  // Build ordered chain path from target down to base raw resources
  const path: string[] = [];
  const visited = new Set<string>();

  function buildPath(token: string) {
    if (visited.has(token)) return;
    visited.add(token);

    const row = allRows.find((r) => r.token.toUpperCase() === token && r.level === 1);
    if (!row) {
      path.push(token);
      return;
    }

    if (row.input_token_1) buildPath(row.input_token_1.toUpperCase());
    if (row.input_token_2) buildPath(row.input_token_2.toUpperCase());

    path.push(token);
  }

  buildPath(normalizedTarget);

  if (path.length === 0) return null;

  // Track raw base material accumulation
  const rawMaterialsNeeded: Record<string, number> = {};
  const steps: ChainStep[] = [];
  let cumulativeProfitDay = 0;

  for (let i = 0; i < path.length; i++) {
    const token = path[i];
    const isBaseResource = ['EARTH', 'WATER', 'FIRE'].includes(token);

    if (isBaseResource) {
      continue;
    }

    const row =
      allRows.find((r) => r.token.toUpperCase() === token && r.level === targetLevel) ||
      allRows.find((r) => r.token.toUpperCase() === token && r.level === 1);

    if (!row) continue;

    const masteryDiscountPercent = getMasteryInputReductionPercent(row.token, proficiencies);
    const durationMin = row.duration_min || 1;
    const cyclesPerDay = (24 * 60) / durationMin;

    const input1Token = row.input_token_1 ? row.input_token_1.toUpperCase() : '';
    const rawInput1Amt = row.input_amount_1 || 0;
    const input1Amt = rawInput1Amt * (1 - masteryDiscountPercent / 100);

    const input2Token = row.input_token_2 ? row.input_token_2.toUpperCase() : '';
    const rawInput2Amt = row.input_amount_2 || 0;
    const input2Amt = rawInput2Amt * (1 - masteryDiscountPercent / 100);

    const outputAmt = row.output_amount || 1;
    const outputPrice = (basePriceMap[token] || 0) * 0.95; // 5% exchange fee deducted

    const input1Price = basePriceMap[input1Token] || 0;
    const input2Price = basePriceMap[input2Token] || 0;

    let inputCostPerCycle = 0;
    if (mode === 'market_buy') {
      inputCostPerCycle = input1Amt * input1Price + input2Amt * input2Price;
    } else {
      // In self_crafted mode, raw base resources (EARTH/WATER/FIRE) are harvested at 0 purchase cost
      const cost1 = ['EARTH', 'WATER', 'FIRE'].includes(input1Token) ? 0 : input1Amt * input1Price;
      const cost2 = ['EARTH', 'WATER', 'FIRE'].includes(input2Token) ? 0 : input2Amt * input2Price;
      inputCostPerCycle = cost1 + cost2;
    }

    const outputValuePerCycle = outputAmt * outputPrice;
    const netProfitPerCycle = outputValuePerCycle - inputCostPerCycle;
    const netProfitPerDay = netProfitPerCycle * cyclesPerDay;

    // Track raw base resources required per day
    if (['EARTH', 'WATER', 'FIRE'].includes(input1Token)) {
      rawMaterialsNeeded[input1Token] = (rawMaterialsNeeded[input1Token] || 0) + input1Amt * cyclesPerDay;
    }
    if (['EARTH', 'WATER', 'FIRE'].includes(input2Token)) {
      rawMaterialsNeeded[input2Token] = (rawMaterialsNeeded[input2Token] || 0) + input2Amt * cyclesPerDay;
    }

    cumulativeProfitDay += netProfitPerDay;

    const baseRawCostDay = Object.entries(rawMaterialsNeeded).reduce((acc, [rawTok, amt]) => {
      return acc + amt * (basePriceMap[rawTok] || 0.00394) * 0.95;
    }, 0);

    const valueMultiplier = baseRawCostDay > 0 ? (cumulativeProfitDay / baseRawCostDay) * 100 : 100;

    steps.push({
      stepIndex: steps.length + 1,
      token,
      factoryLevel: row.level,
      durationMin,
      cyclesPerDay,
      outputAmountPerCycle: outputAmt,
      input1Token,
      input1AmountPerCycle: input1Amt,
      input2Token,
      input2AmountPerCycle: input2Amt,
      rawBaseUnitsRequired: { ...rawMaterialsNeeded },
      masteryDiscountPercent,
      unitPrice: basePriceMap[token] || 0,
      outputValuePerCycle,
      inputCostPerCycle,
      netProfitPerCycle,
      netProfitPerDay,
      cumulativeProfitPerDay: cumulativeProfitDay,
      valueMultiplier,
    });
  }

  const rawOpportunityCostDay = Object.entries(rawMaterialsNeeded).reduce((acc, [rawTok, amt]) => {
    return acc + amt * (basePriceMap[rawTok] || 0.00394) * 0.95;
  }, 0);

  const finalStep = steps[steps.length - 1];
  const finalOutputValueDay = finalStep ? finalStep.outputValuePerCycle * finalStep.cyclesPerDay : 0;
  const netProfitDay = cumulativeProfitDay;
  const totalMultiplier = rawOpportunityCostDay > 0 ? ((finalOutputValueDay - rawOpportunityCostDay) / rawOpportunityCostDay) * 100 : 0;

  return {
    targetToken: normalizedTarget,
    targetLevel,
    steps,
    rawMaterialsNeeded,
    rawOpportunityCostDay,
    finalOutputValueDay,
    netProfitDay,
    totalMultiplier,
  };
}
