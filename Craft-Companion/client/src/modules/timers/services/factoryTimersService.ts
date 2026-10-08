import type { FactoryDataRow } from '../../../services/factoryData';
import { applyWorkshopSpeedToDuration } from '../../../services/workshopModifiers';
import { formatFactoryName } from '../../../utils/formatters';
import type { ActiveRun, RunTimerMetrics } from '../types';
import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
  CraftworldFactoryBooster,
} from '../../../types';

export function calculateBoosterMultiplier(
  boosters: CraftworldFactoryBooster[],
  isNoAdsActive = false,
  nowMs = Date.now(),
): number {
  let boostMultiplier = 1.0;
  if (isNoAdsActive) {
    boostMultiplier *= 0.5;
  }

  for (const b of boosters) {
    if (!b) continue;
    const startOk = !b.startTime || new Date(b.startTime).getTime() <= nowMs;
    const endOk = !b.endTime || new Date(b.endTime).getTime() >= nowMs;
    if (
      startOk &&
      endOk &&
      typeof b.boostValue === 'number' &&
      b.boostValue > 0 &&
      b.boostValue <= 1
    ) {
      boostMultiplier *= b.boostValue;
    }
  }

  return boostMultiplier;
}

export function calculateWorkerReductionFactor(
  craftingReduction?: number | null,
  workerBoostIntervals?: Array<{ boostValue?: number }> | null,
): number {
  if (
    typeof craftingReduction === 'number' &&
    craftingReduction > 0 &&
    craftingReduction < 1
  ) {
    return craftingReduction;
  }

  if (Array.isArray(workerBoostIntervals) && workerBoostIntervals.length > 0) {
    const totalWorkerBoost = workerBoostIntervals.reduce(
      (sum: number, w: { boostValue?: number }) => sum + (w?.boostValue || 0),
      0,
    );
    if (totalWorkerBoost > 0 && totalWorkerBoost < 1) {
      return 1.0 - totalWorkerBoost;
    }
  }

  return 1.0;
}

export function formatRemainingTime(remSec: number): string {
  if (remSec <= 0) return '0m 0s';
  const hrs = Math.floor(remSec / 3600);
  const mins = Math.floor((remSec % 3600) / 60);
  const secs = remSec % 60;
  return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
}

export function calculateRunTimerMetrics(
  run: ActiveRun,
  nowSyncedMs: number,
  donutCircumference = 2 * Math.PI * 20.1,
): RunTimerMetrics {
  const runtimeSec = Math.max(1, Math.round(run.runtimeMinutes * 60));
  const startedMs = new Date(run.startedAt).getTime();
  const elapsedSec = Math.max(0, Math.floor((nowSyncedMs - startedMs) / 1000));

  const cycleElapsed = runtimeSec > 0 ? elapsedSec % runtimeSec : 0;
  const completedCycles = runtimeSec > 0 ? Math.floor(elapsedSec / runtimeSec) : 0;
  const remSec = run.isProducing
    ? runtimeSec - cycleElapsed
    : Math.max(0, runtimeSec - elapsedSec);

  const formattedTime = formatRemainingTime(remSec);
  const isFinished = !run.isProducing && remSec <= 0;

  const currentPercent = run.isProducing
    ? Math.min(100, Math.max(0, (cycleElapsed / runtimeSec) * 100))
    : isFinished
      ? 100
      : Math.min(100, Math.max(0, (elapsedSec / runtimeSec) * 100));

  const clampedPercent = isFinished ? 100 : currentPercent;
  const strokeDashoffset = donutCircumference - (clampedPercent / 100) * donutCircumference;

  return {
    runtimeSec,
    elapsedSec,
    cycleElapsed,
    completedCycles,
    remSec,
    formattedTime,
    isFinished,
    percent: currentPercent,
    clampedPercent,
    strokeDashoffset,
  };
}

export function extractActiveRuns(
  homeData: CraftworldHomePayload | null | undefined,
  factoryRows: FactoryDataRow[],
  language: string,
  nowMs = Date.now(),
): ActiveRun[] {
  const landPlots = homeData?.craftWorld?.landPlots || [];
  const activeRuns: ActiveRun[] = [];

  landPlots.forEach((plot: CraftworldLandPlot) => {
    (plot.areas || []).forEach((area: CraftworldLandArea) => {
      (area.factories || []).forEach((facObj: CraftworldFactoryInstance) => {
        const fac = facObj?.factory || facObj;
        const crafting = facObj?.crafting || fac?.crafting;
        const startedAt = crafting?.startedAt || fac?.startedAt;

        if (startedAt) {
          const definition = fac.definition || facObj.definition || {};
          const tokenId = definition.id || fac.definitionId || fac.id || 'FACTORY';
          const rawLevel =
            typeof crafting?.currentRunLevel === 'number' && crafting.currentRunLevel > 0
              ? crafting.currentRunLevel
              : typeof fac.level === 'number' && fac.level > 0
                ? fac.level
                : 1;

          const displayLevel = rawLevel;
          const levelIndex = Math.max(0, displayLevel - 1);

          const levelData =
            definition.levels?.[levelIndex] ||
            definition.levels?.[0];
          const baseMs = levelData?.millisecondsPerCompletion
            ? levelData.millisecondsPerCompletion
            : (factoryRows.find((r) => r.token === tokenId && r.level === displayLevel)
                ?.duration_min || 60) * 60000;

          const allBoosters: CraftworldFactoryBooster[] = [
            ...(plot.booster ? [plot.booster] : []),
            ...(area.booster ? [area.booster] : []),
            ...(facObj.boosters || []),
            ...(facObj.consumableBoosters || []),
          ];

          const boostMultiplier = calculateBoosterMultiplier(
            allBoosters,
            Boolean(homeData?.purchases?.isNoAdsActive),
            nowMs,
          );

          const reductionFactor = calculateWorkerReductionFactor(
            crafting?.currentTimeReduction,
            facObj.workerBoostIntervals,
          );

          const workshopList = homeData?.craft?.workshop || [];
          const effectiveMs = baseMs * boostMultiplier * reductionFactor;
          let effectiveMin = effectiveMs / 60000;
          if (workshopList.length > 0) {
            effectiveMin = applyWorkshopSpeedToDuration(effectiveMin, tokenId, workshopList);
          }

          const matchedRow = factoryRows.find(
            (r) => r.token === tokenId && r.level === displayLevel,
          );
          const outputToken = matchedRow?.output_token || tokenId;
          const outputAmount = matchedRow?.output_amount || 1;

          const resolvedFactoryName =
            definition.displayName ||
            definition.name ||
            (tokenId && tokenId !== 'FACTORY' ? formatFactoryName(tokenId, language) : null) ||
            formatFactoryName(outputToken, language) ||
            plot.name ||
            tokenId;

          const isPaused = Boolean(crafting?.pausedAt || fac?.pausedAt);
          const isStopped = Boolean(
            crafting?.stoppedAt || fac?.stoppedAt || crafting?.isStopped || fac?.isStopped,
          );
          const isProducing = !isPaused && !isStopped;

          activeRuns.push({
            title: resolvedFactoryName,
            plotName: plot.name || '',
            token: tokenId,
            outputToken,
            outputAmount,
            level: displayLevel,
            startedAt,
            pausedAt: crafting?.pausedAt || fac?.pausedAt || null,
            runtimeMinutes: effectiveMin,
            isProducing,
          });
        }
      });
    });
  });

  return activeRuns;
}
