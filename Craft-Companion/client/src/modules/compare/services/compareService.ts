import type { FactoryCycleResult } from '../../../services/craftworldCalculations';
import type { ComparisonVerdict, ComparisonWinner } from '../types';

export function calculateComparisonVerdict(
  cycle1: FactoryCycleResult | null,
  cycle2: FactoryCycleResult | null,
  isSameFactory: boolean,
): ComparisonVerdict | null {
  if (!cycle1 || !cycle2) return null;

  const profitDiffDay = cycle1.profitPerDay - cycle2.profitPerDay;
  const profitWinner: ComparisonWinner =
    profitDiffDay > 0 ? 'A' : profitDiffDay < 0 ? 'B' : 'TIE';
  const profitDiffAbs = Math.abs(profitDiffDay);
  const baseProfit = Math.min(
    Math.abs(cycle1.profitPerDay),
    Math.abs(cycle2.profitPerDay),
  );
  const profitPercent =
    baseProfit > 0 ? Math.round((profitDiffAbs / baseProfit) * 100) : 0;

  const outputDiffDay = cycle1.outputPerDay - cycle2.outputPerDay;
  const outputWinner: ComparisonWinner =
    outputDiffDay > 0 ? 'A' : outputDiffDay < 0 ? 'B' : 'TIE';

  const xpDiffDay = cycle1.xpPerDay - cycle2.xpPerDay;
  const xpWinner: ComparisonWinner =
    xpDiffDay > 0 ? 'A' : xpDiffDay < 0 ? 'B' : 'TIE';

  const timeDiff = cycle1.runtimeMinutes - cycle2.runtimeMinutes;
  const timeWinner: ComparisonWinner =
    timeDiff < 0 ? 'A' : timeDiff > 0 ? 'B' : 'TIE'; // faster cycle is better

  return {
    profitWinner,
    profitDiffDay,
    profitDiffAbs,
    profitPercent,
    outputWinner,
    outputDiffDay: Math.abs(outputDiffDay),
    xpWinner,
    xpDiffDay: Math.abs(xpDiffDay),
    timeWinner,
    isSameFactory,
  };
}
