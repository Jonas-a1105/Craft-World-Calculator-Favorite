import type { UpgradeRecommendation, AdvisorFilterMode } from '../types';

export function filterAndSortRecommendations(
  recommendations: UpgradeRecommendation[],
  searchTerm: string,
  filterMode: AdvisorFilterMode,
): UpgradeRecommendation[] {
  let result = recommendations;

  if (searchTerm && searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    result = result.filter(
      (rec) =>
        rec.row.token.toLowerCase().includes(q) ||
        rec.reason.toLowerCase().includes(q) ||
        Boolean(rec.nextRow?.upgrade_token && rec.nextRow.upgrade_token.toLowerCase().includes(q)),
    );
  }

  if (filterMode === 'fast_roi') {
    result = result.filter((rec) => rec.paybackDays !== null && rec.paybackDays <= 3);
  } else if (filterMode === 'best_profit') {
    result = [...result].sort((a, b) => b.addedProfitPerDay - a.addedProfitPerDay);
  }

  return result;
}
