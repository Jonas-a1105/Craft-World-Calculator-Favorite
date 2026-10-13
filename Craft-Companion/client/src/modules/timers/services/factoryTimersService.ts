import type { FactoryDataRow } from '../../../services/factoryData';
import { getFactoryDisplayLevel } from '../../../services/craftworldCalculations';
import { applyWorkshopSpeedToDuration, type WorkshopItem } from '../../../services/workshopModifiers';
import { getMasteryInputFactor, type ProficiencyItem } from '../../../services/masteryModifiers';
import { formatFactoryName } from '../../../utils/formatters';
import type { ActiveRun, RunTimerMetrics } from '../types';
import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
  CraftworldFactoryBooster,
} from '../../../types';

export interface FactoryRunTimingInput {
  tokenId: string;
  /** currentRunLevel o factory.level de /me/craft-world (1-based). */
  rawLevel?: number | null;
  /** Definición del payload: SUS valores level ya llevan workshop aplicado en la
   *  duración y maestría en los insumos (confirmado por el dev 2026-10-12). */
  definition?: { levels?: Array<{ millisecondsPerCompletion?: number }> } | null;
  crafting?: { currentTimeReduction?: number } | null;
  workerBoostIntervals?: Array<{ boostValue?: number }> | null;
  boosters?: CraftworldFactoryBooster[];
  isNoAdsActive?: boolean;
  workshop?: WorkshopItem[];
  /** Proficiencies del jugador: la maestría también multiplica la DURACIÓN del
   *  ciclo por inputDiscountFactor (evidencia en vivo 2026-10-13: STEEL L11
   *  292,6 min × 0,5 boost × 0,95 maestría10 = 138,99 min ⇒ juego marca 2h11m). */
  proficiencies?: ProficiencyItem[];
  factoryRows: FactoryDataRow[];
  nowMs: number;
}

/**
 * Resuelve la duración efectiva de un run sin dobles conteos:
 * - Definición personalizada (payload /me/craft-world): ya incluye workshop →
 *   solo faltan boosters y workers.
 * - Fallback estático (rows del config oficial): ahí el workshop SÍ hay que
 *   aplicarlo (tabla oficial ×(1−bonus)).
 */
export function resolveFactoryRunTiming({
  tokenId,
  rawLevel,
  definition,
  crafting,
  workerBoostIntervals,
  boosters = [],
  isNoAdsActive = false,
  workshop = [],
  proficiencies = [],
  factoryRows,
  nowMs,
}: FactoryRunTimingInput): {
  level: number;
  effectiveMinutes: number;
  source: 'definition' | 'static';
} {
  const level =
    typeof rawLevel === 'number' && Number.isFinite(rawLevel) && rawLevel > 0
      ? Math.floor(rawLevel)
      : 1;
  const levelIndex = level - 1;

  const personalizedMs =
    definition?.levels?.[levelIndex]?.millisecondsPerCompletion ??
    definition?.levels?.[0]?.millisecondsPerCompletion;
  const hasPersonalized = typeof personalizedMs === 'number' && personalizedMs > 0;

  let baseMs: number;
  let source: 'definition' | 'static';
  if (hasPersonalized) {
    baseMs = personalizedMs;
    source = 'definition';
  } else {
    const staticMin =
      factoryRows.find((r) => r.token === tokenId && r.level === level)?.duration_min || 60;
    baseMs = applyWorkshopSpeedToDuration(staticMin, tokenId, workshop) * 60000;
    source = 'static';
  }

  const boostMultiplier = calculateBoosterMultiplier(boosters, nowMs);
  const reductionFactor = calculateWorkerReductionFactor(
    crafting?.currentTimeReduction,
    workerBoostIntervals,
  );
  // La maestría del producto también acelera el ciclo (× inputDiscountFactor).
  const masteryFactor = getMasteryInputFactor(tokenId, proficiencies);

  return {
    level,
    effectiveMinutes: (baseMs * boostMultiplier * reductionFactor * masteryFactor) / 60000,
    source,
  };
}

/** Recoge los boosters activos de una instancia SIN duplicar: el API refleja el
 *  mismo booster de temporada a nivel parcela y dentro de cada fábrica (mismo
 *  boostValue/startTime/endTime). Contarlo dos veces convertía ×0,5 en ×0,25
 *  y todos los timers corrían al doble de velocidad (verificado 2026-10-13 con
 *  payload en vivo). */
export function collectFactoryBoosters(
  plot: CraftworldLandPlot,
  area: CraftworldLandArea,
  facObj: CraftworldFactoryInstance,
): CraftworldFactoryBooster[] {
  const raw = [
    ...(plot.booster ? [plot.booster] : []),
    ...(area.booster ? [area.booster] : []),
    ...(facObj.boosters || []),
    ...(facObj.consumableBoosters || []),
  ];
  const seen = new Set<string>();
  return raw.filter((b) => {
    if (!b) return false;
    const sig = `${b.boostValue}|${b.startTime || ''}|${b.endTime || ''}`;
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
}

/**
 * Estado real del run a partir del payload:
 * el juego apila ciclos sin reclamar (`unclaimedUnitsBeforeCurrentRun`), así que
 * el ciclo en curso termina en startedAt + (unclaimed+1) × duración. Con esa
 * ventana: si ya pasó, la fábrica está parada/completada (no sigue "produciendo"
 * en bucle para siempre). Devuelve el startedAt desplazado al ciclo actual para
 * que los cálculos elapsed/restante encajen con la cuenta atrás del juego.
 */
export function resolveRunWindow({
  startedAt,
  unclaimedUnits,
  outputPerCycle = 1,
  runtimeMinutes,
  pausedAt,
  nowMs,
}: {
  startedAt: string;
  unclaimedUnits?: number | null;
  outputPerCycle?: number;
  runtimeMinutes: number;
  pausedAt?: string | null;
  nowMs: number;
}): { effectiveStartedAt: string; isProducing: boolean } {
  const startedMs = new Date(startedAt).getTime();
  const cycleMs = runtimeMinutes * 60000;
  // unclaimed cuenta UNIDADES; convierto a ciclos completados con el output/ciclo
  const perCycle = Number.isFinite(outputPerCycle) && outputPerCycle > 0 ? outputPerCycle : 1;
  const stackedCycles =
    typeof unclaimedUnits === 'number' && Number.isFinite(unclaimedUnits) && unclaimedUnits > 0
      ? Math.floor(unclaimedUnits / perCycle)
      : 0;

  if (!Number.isFinite(startedMs) || !Number.isFinite(cycleMs) || cycleMs <= 0) {
    return { effectiveStartedAt: startedAt, isProducing: !pausedAt };
  }

  const shiftedStartMs = startedMs + stackedCycles * cycleMs;
  const currentCycleEndsMs = shiftedStartMs + cycleMs;
  const producing = !pausedAt && nowMs < currentCycleEndsMs;

  return {
    effectiveStartedAt: new Date(shiftedStartMs).toISOString(),
    isProducing: producing,
  };
}

export function calculateBoosterMultiplier(
  boosters: CraftworldFactoryBooster[],
  nowMs = Date.now(),
): number {
  // NOTA: el paquete No-Ads NO acelera la producción (verificado 2026-10-13 con
  // la partida real: STEEL L11 muestra >2 h en juego; aplicarlo como ×0,5
  // permanente dejaba el timer en 1h13m). Solo elimina anuncios.
  let boostMultiplier = 1.0;

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

/** Boosters únicos y vigentes de toda la cuenta (para modos "proyectados"). */
export function collectUniqueActiveBoosters(
  homeData: CraftworldHomePayload | null | undefined,
  nowMs = Date.now(),
): CraftworldFactoryBooster[] {
  const seen = new Set<string>();
  const out: CraftworldFactoryBooster[] = [];
  for (const plot of homeData?.craftWorld?.landPlots || []) {
    const candidates = [
      ...(plot.booster ? [plot.booster] : []),
      ...(plot.areas || []).flatMap((a) => (a.booster ? [a.booster] : [])),
    ];
    for (const b of candidates) {
      if (!b) continue;
      const sig = `${b.boostValue}|${b.startTime || ''}|${b.endTime || ''}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      const startOk = !b.startTime || new Date(b.startTime).getTime() <= nowMs;
      const endOk = !b.endTime || new Date(b.endTime).getTime() >= nowMs;
      if (startOk && endOk) out.push(b);
    }
  }
  return out;
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
          // Preservar 0: las recién colocadas reportan currentRunLevel/level 0 y
          // el juego las muestra como "Nivel 1" (convención display = nivel+1).
          const payloadLevel =
            typeof crafting?.currentRunLevel === 'number' && Number.isFinite(crafting.currentRunLevel)
              ? Math.max(0, Math.floor(crafting.currentRunLevel))
              : typeof fac.level === 'number' && Number.isFinite(fac.level)
                ? Math.max(0, Math.floor(fac.level))
                : 1;
          const rawLevel = Math.max(1, payloadLevel); // índice: levels[level−1]

          const timing = resolveFactoryRunTiming({
            tokenId,
            rawLevel,
            definition,
            crafting,
            workerBoostIntervals: facObj.workerBoostIntervals,
            boosters: collectFactoryBoosters(plot, area, facObj),
            isNoAdsActive: Boolean(homeData?.purchases?.isNoAdsActive),
            workshop: homeData?.craft?.workshop || [],
            proficiencies: homeData?.craft?.proficiencies || [],
            factoryRows,
            nowMs,
          });
          const displayLevel = getFactoryDisplayLevel(payloadLevel); // convención juego: +1
          const effectiveMin = timing.effectiveMinutes;

          const matchedRow = factoryRows.find(
            (r) => r.token === tokenId && r.level === timing.level,
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

          // La cuenta atrás del juego corre sobre el ciclo EN CURSO: el juego
          // apila unidades sin reclamar, así que el inicio efectivo se desplaza
          // unclaimedCycles × duración. Si ese ciclo ya pasó, la fábrica está
          // terminada/parada — no "produciendo" en bucle para siempre.
          const window_ = isStopped
            ? { effectiveStartedAt: startedAt, isProducing: false }
            : resolveRunWindow({
                startedAt,
                unclaimedUnits: crafting?.unclaimedUnitsBeforeCurrentRun,
                outputPerCycle: outputAmount,
                runtimeMinutes: effectiveMin,
                pausedAt: isPaused ? crafting?.pausedAt || fac?.pausedAt : null,
                nowMs,
              });

          activeRuns.push({
            title: resolvedFactoryName,
            plotName: plot.name || '',
            token: tokenId,
            outputToken,
            outputAmount,
            level: displayLevel,
            startedAt: window_.effectiveStartedAt,
            pausedAt: crafting?.pausedAt || fac?.pausedAt || null,
            runtimeMinutes: effectiveMin,
            isProducing: window_.isProducing && !isStopped,
          });
        }
      });
    });
  });

  return activeRuns;
}
