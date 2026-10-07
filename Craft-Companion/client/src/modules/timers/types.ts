export interface ActiveRun {
  title: string;
  plotName?: string;
  token: string;
  outputToken: string;
  outputAmount: number;
  level: number;
  startedAt: string;
  pausedAt?: string | null;
  runtimeMinutes: number;
  isProducing: boolean;
}

export interface RunTimerMetrics {
  runtimeSec: number;
  elapsedSec: number;
  cycleElapsed: number;
  completedCycles: number;
  remSec: number;
  formattedTime: string;
  isFinished: boolean;
  percent: number;
  clampedPercent: number;
  strokeDashoffset: number;
}
