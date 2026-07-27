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

  const targetRow = allRows.find((r) => r.token.toUpperCase() === normalizedTarget && r.level === targetLevel);
  if (!targetRow) return null;

  const targetDuration = targetRow.duration_min || 1;
  const targetRunsPerDay = (24 * 60) / targetDuration;
  const targetOutputAmountPerDay = targetRow.output_amount * targetRunsPerDay;

  const path: string[] = [];
  const visited = new Set<string>();

  function buildPath(token: string) {
    if (visited.has(token)) return;
    visited.add(token);

    const r = allRows.find((row) => row.token.toUpperCase() === token);
    if (!r) {
      path.push(token);
      return;
    }

    if (r.input_token_1) buildPath(r.input_token_1.toUpperCase());
    if (r.input_token_2) buildPath(r.input_token_2.toUpperCase());

    path.push(token);
  }
  buildPath(normalizedTarget);

  const demand: Record<string, number> = {
    [normalizedTarget]: targetOutputAmountPerDay,
  };

  const stepRuns: Record<string, number> = {};
  const rawMaterialsNeeded: Record<string, number> = {};

  for (let i = path.length - 1; i >= 0; i--) {
    const token = path[i];
    const isBaseResource = ['EARTH', 'WATER', 'FIRE'].includes(token);

    if (isBaseResource) {
      rawMaterialsNeeded[token] = (rawMaterialsNeeded[token] || 0) + (demand[token] || 0);
      continue;
    }

    const neededQty = demand[token] || 0;
    if (neededQty <= 0) continue;

    const levelToUse = token === normalizedTarget ? targetLevel : 18;
    const row =
      allRows.find((r) => r.token.toUpperCase() === token && r.level === levelToUse) ||
      allRows.find((r) => r.token.toUpperCase() === token && r.level === 1);

    if (!row) continue;

    const runsNeeded = neededQty / row.output_amount;
    stepRuns[token] = runsNeeded;

    const masteryDiscountPercent = getMasteryInputReductionPercent(row.token, proficiencies);

    if (row.input_token_1) {
      const input1 = row.input_token_1.toUpperCase();
      const rawInputAmt = row.input_amount_1 * runsNeeded;
      const inputAmt = rawInputAmt * (1 - masteryDiscountPercent / 100);
      demand[input1] = (demand[input1] || 0) + inputAmt;
    }

    if (row.input_token_2) {
      const input2 = row.input_token_2.toUpperCase();
      const rawInputAmt = row.input_amount_2 * runsNeeded;
      const inputAmt = rawInputAmt * (1 - masteryDiscountPercent / 100);
      demand[input2] = (demand[input2] || 0) + inputAmt;
    }
  }

  const steps: ChainStep[] = [];
  let cumulativeProfitDay = 0;

  for (let i = 0; i < path.length; i++) {
    const token = path[i];
    if (['EARTH', 'WATER', 'FIRE'].includes(token)) continue;

    const levelToUse = token === normalizedTarget ? targetLevel : 18;
    const row =
      allRows.find((r) => r.token.toUpperCase() === token && r.level === levelToUse) ||
      allRows.find((r) => r.token.toUpperCase() === token && r.level === 1);

    if (!row) continue;

    const runsPerDay = stepRuns[token] || 0;
    const outputAmountPerDay = row.output_amount * runsPerDay;

    const masteryDiscountPercent = getMasteryInputReductionPercent(row.token, proficiencies);

    const input1Token = row.input_token_1 ? row.input_token_1.toUpperCase() : '';
    const input1AmtPerDay = row.input_amount_1 * runsPerDay * (1 - masteryDiscountPercent / 100);

    const input2Token = row.input_token_2 ? row.input_token_2.toUpperCase() : '';
    const input2AmtPerDay = row.input_amount_2 * runsPerDay * (1 - masteryDiscountPercent / 100);

    const outputPrice = (basePriceMap[token] || 0) * 0.95;
    const input1Price = basePriceMap[input1Token] || 0;
    const input2Price = basePriceMap[input2Token] || 0;

    let inputCostPerDay = 0;
    if (mode === 'market_buy') {
      inputCostPerDay = input1AmtPerDay * input1Price + input2AmtPerDay * input2Price;
    } else {
      const cost1 = ['EARTH', 'WATER', 'FIRE'].includes(input1Token) ? 0 : input1AmtPerDay * input1Price;
      const cost2 = ['EARTH', 'WATER', 'FIRE'].includes(input2Token) ? 0 : input2AmtPerDay * input2Price;
      inputCostPerDay = cost1 + cost2;
    }

    const outputValuePerDay = outputAmountPerDay * outputPrice;
    const netProfitPerDay = outputValuePerDay - inputCostPerDay;

    cumulativeProfitDay += netProfitPerDay;

    const baseRawCostDay = Object.entries(rawMaterialsNeeded).reduce((acc, [rawTok, amt]) => {
      return acc + amt * (basePriceMap[rawTok] || 0.00394) * 0.95;
    }, 0);

    const valueMultiplier = baseRawCostDay > 0 ? (cumulativeProfitDay / baseRawCostDay) * 100 : 100;

    steps.push({
      stepIndex: steps.length + 1,
      token,
      factoryLevel: row.level,
      durationMin: row.duration_min,
      cyclesPerDay: runsPerDay,
      outputAmountPerCycle: outputAmountPerDay,
      input1Token,
      input1AmountPerCycle: input1AmtPerDay,
      input2Token,
      input2AmountPerCycle: input2AmtPerDay,
      rawBaseUnitsRequired: { ...rawMaterialsNeeded },
      masteryDiscountPercent,
      unitPrice: basePriceMap[token] || 0,
      outputValuePerCycle: outputValuePerDay,
      inputCostPerCycle: inputCostPerDay,
      netProfitPerCycle: netProfitPerDay,
      netProfitPerDay,
      cumulativeProfitPerDay: cumulativeProfitDay,
      valueMultiplier,
    });
  }

  const rawOpportunityCostDay = Object.entries(rawMaterialsNeeded).reduce((acc, [rawTok, amt]) => {
    return acc + amt * (basePriceMap[rawTok] || 0.00394) * 0.95;
  }, 0);

  const finalStep = steps[steps.length - 1];
  const finalOutputValueDay = finalStep ? finalStep.outputValuePerCycle : 0;
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
