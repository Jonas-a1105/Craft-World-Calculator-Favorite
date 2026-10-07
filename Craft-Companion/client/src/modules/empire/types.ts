export interface BuildingSummaryItem {
  count: number;
  maxLevel: number;
  levels: number[];
}

export interface PlotFactorySummary {
  factories: string[];
  counts: Record<string, number>;
}

export interface EmpireOverviewStats {
  totalPlots: number;
  totalFactories: number;
  totalWorkers: number;
  dynosOrEggsText: string;
}
