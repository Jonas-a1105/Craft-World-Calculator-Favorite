import { useEffect } from 'react';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { applyWorkshopSpeedToDuration } from '../services/workshopModifiers';
import { getCraftworldHome } from '../services/api';
import { formatFactoryName } from '../utils/formatters';
import { sendFactoryNotification } from '../utils/notifications';

interface ExtractableFactoryRun {
  key: string;
  token: string;
  outputToken: string;
  outputAmount: number;
  level: number;
  startedAt: string;
  pausedAt?: string | null;
  runtimeMinutes: number;
}

export function extractActiveRuns(home: any, factoryRows: FactoryDataRow[], nowMs = Date.now()): ExtractableFactoryRun[] {
  if (!home?.craftWorld) return [];
  const runs: ExtractableFactoryRun[] = [];
  const landPlots = home.craftWorld.landPlots || [];
  const mines = home.craftWorld.mines || [];

  landPlots.forEach((plot: any, plotIdx: number) => {
    (plot.areas || []).forEach((area: any, areaIdx: number) => {
      (area.factories || []).forEach((facObj: any, facIdx: number) => {
        const fac = facObj?.factory || facObj;
        const crafting = facObj?.crafting || fac?.crafting;
        const startedAt = crafting?.startedAt || fac?.startedAt;

        if (startedAt) {
          const definition = fac.definition || facObj.definition || {};
          const tokenId = definition.id || fac.definitionId || fac.id || 'FACTORY';
          const rawLevel =
            typeof crafting?.currentRunLevel === 'number'
              ? crafting.currentRunLevel
              : typeof fac.level === 'number'
                ? fac.level
                : 0;

          const displayLevel = rawLevel + 1;

          const levelData =
            definition.levels?.[rawLevel] ||
            definition.levels?.[rawLevel - 1] ||
            definition.levels?.[0];
          const baseMs = levelData?.millisecondsPerCompletion
            ? levelData.millisecondsPerCompletion
            : (factoryRows.find((r) => r.token === tokenId && r.level === displayLevel)
                ?.duration_min || 60) * 60000;

          // 1. Gather ONLY CURRENTLY ACTIVE Speed Boosters
          const allBoosters: any[] = [
            ...(plot.booster ? [plot.booster] : []),
            ...(area.booster ? [area.booster] : []),
            ...(facObj.boosters || []),
            ...(facObj.consumableBoosters || []),
            ...(home?.purchases?.isNoAdsActive ? [{ boostValue: 0.5 }] : []),
          ];

          let boostMultiplier = 1.0;
          allBoosters.forEach((b: any) => {
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
          });

          // 2. Extract Worker / Time Reduction Factor directly from Craft World API
          let reductionFactor = 1.0;
          if (
            typeof crafting?.currentTimeReduction === 'number' &&
            crafting.currentTimeReduction > 0 &&
            crafting.currentTimeReduction < 1
          ) {
            reductionFactor = crafting.currentTimeReduction;
          } else if (
            Array.isArray(facObj.workerBoostIntervals) &&
            facObj.workerBoostIntervals.length > 0
          ) {
            const totalWorkerBoost = facObj.workerBoostIntervals.reduce(
              (sum: number, w: any) => sum + (w.boostValue || 0),
              0,
            );
            if (totalWorkerBoost > 0 && totalWorkerBoost < 1) {
              reductionFactor = 1.0 - totalWorkerBoost;
            }
          }

          // 3. Workshop speed bonus from player's workshop
          const workshopList = home?.craft?.workshop || [];
          const effectiveMs = baseMs * boostMultiplier * reductionFactor;
          let effectiveMin = effectiveMs / 60000;
          if (workshopList.length > 0) {
            effectiveMin = applyWorkshopSpeedToDuration(effectiveMin, tokenId, workshopList);
          }

          const matchedRow = factoryRows.find((r) => r.token === tokenId && r.level === displayLevel);
          const outputToken = matchedRow?.output_token || tokenId;
          const outputAmount = matchedRow?.output_amount || 1;

          const uniqueKey = `plot_${plot.id || plot.name || plotIdx}_area_${areaIdx}_fac_${facIdx}_${tokenId}`;

          runs.push({
            key: uniqueKey,
            token: tokenId,
            outputToken,
            outputAmount,
            level: displayLevel,
            startedAt,
            pausedAt: crafting?.pausedAt || fac?.pausedAt || null,
            runtimeMinutes: effectiveMin,
          });
        }
      });
    });
  });

  return runs;
}

export function useFactoryNotifications(language: string) {
  useEffect(() => {
    const isEnabled = localStorage.getItem('craftworld.notificationsEnabled') === 'true';
    if (!isEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let active = true;
    let factoryRows: FactoryDataRow[] = [];
    let homeData: any = null;

    const loadData = () => {
      Promise.all([loadFactoryData().catch(() => []), getCraftworldHome().catch(() => null)]).then(
        ([rows, home]) => {
          if (!active) return;
          factoryRows = rows;
          homeData = home;
        },
      );
    };

    loadData();

    // Re-fetch Craft World home data periodically in the background (every 30 seconds)
    const syncInterval = setInterval(() => {
      if (active) loadData();
    }, 30000);

    // Track already notified runs (runKey -> startedAt) to prevent duplicate alerts
    const notifiedMap: Record<string, string> = (() => {
      try {
        return JSON.parse(localStorage.getItem('craftworld.notifiedTimers') || '{}');
      } catch {
        return {};
      }
    })();

    const interval = setInterval(() => {
      if (!homeData || factoryRows.length === 0) return;

      const activeRuns = extractActiveRuns(homeData, factoryRows, Date.now());

      for (const run of activeRuns) {
        const key = run.key;
        const startedAt = run.startedAt;
        if (!startedAt) continue;

        // Skip if already notified for this cycle
        if (notifiedMap[key] === startedAt) continue;

        // Skip if paused
        if (run.pausedAt) continue;

        const runtimeSeconds = run.runtimeMinutes * 60;
        const startedMs = new Date(startedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
        const remainingSeconds = runtimeSeconds - elapsedSeconds;

        if (remainingSeconds <= 0) {
          const resourceName = formatFactoryName(run.outputToken || run.token, language);

          const title =
            language === 'es'
              ? `¡Fábrica de ${resourceName} Completada! 🔔`
              : `Factory ${resourceName} Completed! 🔔`;

          const body =
            language === 'es'
              ? `La producción de ${resourceName} (Nv. ${run.level}) ha terminado y está lista.`
              : `Production of ${resourceName} (Lv. ${run.level}) has finished and is ready.`;

          sendFactoryNotification(title, body, `/favicon.svg`);

          // Mark as notified and persist to prevent repeating notification for the same run
          notifiedMap[key] = startedAt;
          localStorage.setItem('craftworld.notifiedTimers', JSON.stringify(notifiedMap));
        }
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(syncInterval);
      clearInterval(interval);
    };
  }, [language]);
}

export default useFactoryNotifications;
