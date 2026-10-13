import { useEffect } from 'react';
import type { FactoryDataRow } from '../services/factoryData';
import { formatFactoryName } from '../utils/formatters';
import { sendFactoryNotification } from '../utils/notifications';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../services/queries/useCraftworldQueries';
import {
  resolveFactoryRunTiming,
  collectFactoryBoosters,
  resolveRunWindow,
} from '../modules/timers/services/factoryTimersService';
import { getFactoryDisplayLevel } from '../services/craftworldCalculations';

import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
} from '../types';

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

export function extractActiveRuns(
  home: CraftworldHomePayload | null | undefined,
  factoryRows: FactoryDataRow[],
  nowMs = Date.now(),
): ExtractableFactoryRun[] {
  if (!home?.craftWorld) return [];
  const runs: ExtractableFactoryRun[] = [];
  const landPlots = home.craftWorld.landPlots || [];

  landPlots.forEach((plot: CraftworldLandPlot, plotIdx: number) => {
    (plot.areas || []).forEach((area: CraftworldLandArea, areaIdx: number) => {
      (area.factories || []).forEach((facObj: CraftworldFactoryInstance, facIdx: number) => {
        const fac = facObj?.factory || facObj;
        const crafting = facObj?.crafting || fac?.crafting;
        const startedAt = crafting?.startedAt || fac?.startedAt;

        if (startedAt) {
          const definition = fac.definition || facObj.definition || {};
          const tokenId = definition.id || fac.definitionId || fac.id || 'FACTORY';
          // El payload numera 0..N; la UI del juego muestra nivel+1
          // (ej.: payload 13 → "Nivel 14" en el cliente oficial).
          const payloadLevel =
            typeof crafting?.currentRunLevel === 'number' && Number.isFinite(crafting.currentRunLevel)
              ? Math.max(0, Math.floor(crafting.currentRunLevel))
              : typeof fac.level === 'number' && Number.isFinite(fac.level)
                ? Math.max(0, Math.floor(fac.level))
                : 1;
          const rawLevel = Math.max(1, payloadLevel);

          const timing = resolveFactoryRunTiming({
            tokenId,
            rawLevel,
            definition,
            crafting,
            workerBoostIntervals: facObj.workerBoostIntervals,
            boosters: collectFactoryBoosters(plot, area, facObj),
            isNoAdsActive: Boolean(home?.purchases?.isNoAdsActive),
            workshop: home?.craft?.workshop || [],
            proficiencies: home?.craft?.proficiencies || [],
            factoryRows,
            nowMs,
          });
          const displayLevel = getFactoryDisplayLevel(payloadLevel); // convención juego: +1
          const effectiveMin = timing.effectiveMinutes;

          const matchedRow = factoryRows.find((r) => r.token === tokenId && r.level === timing.level);
          const outputToken = matchedRow?.output_token || tokenId;
          const outputAmount = matchedRow?.output_amount || 1;

          // Misma ventana de run que la pantalla de timers: el inicio efectivo se
          // desplaza por los ciclos apilados sin reclamar; si el ciclo en curso
          // lleva más de 2 min pasado su fin, la fábrica está parada (no notificar).
          const window_ = resolveRunWindow({
            startedAt,
            unclaimedUnits: crafting?.unclaimedUnitsBeforeCurrentRun,
            outputPerCycle: outputAmount,
            runtimeMinutes: effectiveMin,
            pausedAt: crafting?.pausedAt || fac?.pausedAt || null,
            nowMs,
          });
          const shiftedMs = new Date(window_.effectiveStartedAt).getTime();
          const cycleMs = effectiveMin * 60000;
          const isPhantom = Number.isFinite(shiftedMs) && cycleMs > 0 && nowMs - shiftedMs > cycleMs + 120000;
          if (isPhantom) return;

          const uniqueKey = `plot_${plot.id || plot.name || plotIdx}_area_${areaIdx}_fac_${facIdx}_${tokenId}`;

          runs.push({
            key: uniqueKey,
            token: tokenId,
            outputToken,
            outputAmount,
            level: displayLevel,
            startedAt: window_.effectiveStartedAt,
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
  const { data: homeData } = useCraftworldHomeQuery();
  const { data: factoryRows = [] } = useFactoryDataQuery();

  // Desfase del reloj local frente al servidor del juego (los timestamps del
  // payload son del servidor). Sin este ajuste, todos los restantes se desplazan.
  const serverOffsetMs = (() => {
    const serverTimeMs = homeData?.serverTime
      ? new Date(homeData.serverTime).getTime()
      : undefined;
    return typeof serverTimeMs === 'number' && Number.isFinite(serverTimeMs)
      ? serverTimeMs - Date.now()
      : 0;
  })();

  useEffect(() => {
    // El interruptor maestro (Settings) habilita la escucha. El permiso del
    // navegador solo afecta al canal push: sonido y toast in-app no lo necesitan.
    const isEnabled = localStorage.getItem('craftworld.notificationsEnabled') === 'true';
    if (!isEnabled) return;
    if (!homeData || factoryRows.length === 0) return;

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

      const syncedNow = Date.now() + serverOffsetMs;
      const activeRuns = extractActiveRuns(homeData, factoryRows, syncedNow);

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
              ? `¡Fábrica de ${resourceName} Completada!`
              : `Factory ${resourceName} Completed!`;

          const body =
            language === 'es'
              ? `La producción de ${resourceName} (Nv. ${run.level}) ha terminado y está lista.`
              : `Production of ${resourceName} (Lv. ${run.level}) has finished and is ready.`;

          sendFactoryNotification(title, body, `/favicon.svg`, {
            factoryToken: run.token,
          });

          // Mark as notified and persist to prevent repeating notification for the same run
          notifiedMap[key] = startedAt;
          localStorage.setItem('craftworld.notifiedTimers', JSON.stringify(notifiedMap));
        }
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [homeData, factoryRows, language]);
}

export default useFactoryNotifications;
