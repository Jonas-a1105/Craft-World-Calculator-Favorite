export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M' | 'MAX';

export interface ActivityTrade {
  id: string;
  inSymbol: string;
  inAmount: string;
  outSymbol: string;
  outAmount: string;
  unitPrice: string;
  success: boolean;
}

export interface ChartPoint {
  x: number;
  y: number;
  val: number;
  timeFormatted: string;
}

export interface ChartSeriesData {
  points: ChartPoint[];
  polylinePoints: string;
  areaPoints: string;
  changeAbs: number;
  changePercent: number;
  isUp: boolean;
}

export interface UseResourceDetailReturn {
  symbol: string;
  loading: boolean;
  activeTimeframe: Timeframe;
  setActiveTimeframe: (tf: Timeframe) => void;
  isPressing: boolean;
  setIsPressing: (pressing: boolean) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (idx: number | null) => void;
  activePoint: ChartPoint | null;
  displayPrice: number;
  displayDiff: number;
  displayPct: number;
  displayIsUp: boolean;
  points: ChartPoint[];
  polylinePoints: string;
  areaPoints: string;
  activityTrades: ActivityTrade[];
  timeframeLabel: string;
  onGoBack: () => void;
  language: 'es' | 'en';
}
