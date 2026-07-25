import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { calculateCycleTimerStatus } from '../services/craftworldCalculations';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { FactoryIcon, ResourceIcon } from '../components/GameIcon';

function formatNumber(value: unknown, digits = 1) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function FactoryTimers() {
  const { language } = useTranslation();
  const [homeData, setHomeData] = useState<any>(null);
  const [factoryRows, setFactoryRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [showRawInspector, setShowRawInspector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  );

  useEffect(() => {
    Promise.all([getCraftworldHome().catch(() => null), loadFactoryData().catch(() => [])])
      .then(([home, rows]) => {
        setHomeData(home);
        setFactoryRows(rows);
      })
      .finally(() => setLoading(false));

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestNotif = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
        if (perm === 'granted') {
          localStorage.setItem('craftworld.notificationsEnabled', 'true');
        }
      });
    }
  };

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const landPlots = homeData?.craftWorld?.landPlots || [];
  const mines = homeData?.craftWorld?.mines || [];

  const activeRuns: Array<{
    title: string;
    token: string;
    level: number;
    startedAt: string;
    pausedAt?: string | null;
    runtimeMinutes: number;
  }> = [];

  const nowMs = Date.now();

  landPlots.forEach((plot: any) => {
    (plot.areas || []).forEach((area: any) => {
      (area.factories || []).forEach((facObj: any) => {
        const fac = facObj?.factory || facObj;
        const crafting = facObj?.crafting || fac?.crafting;
        const startedAt = crafting?.startedAt || fac?.startedAt;

        // Process only factories with an active crafting start time
        if (startedAt) {
          const definition = fac.definition || facObj.definition || {};
          const tokenId = definition.id || fac.definitionId || fac.id || 'FACTORY';
          const rawLevel =
            typeof crafting?.currentRunLevel === 'number'
              ? crafting.currentRunLevel
              : typeof fac.level === 'number'
                ? fac.level
                : 0;

          // Display level in Craft World UI is 1-indexed (rawLevel 9 = Nv. 10 / ⭐ 10)
          const displayLevel = rawLevel + 1;

          // Find exact millisecondsPerCompletion from API level definition array (index = rawLevel)
          const levelData =
            definition.levels?.[rawLevel] ||
            definition.levels?.[rawLevel - 1] ||
            definition.levels?.[0];
          const baseMs = levelData?.millisecondsPerCompletion
            ? levelData.millisecondsPerCompletion
            : (factoryRows.find((r) => r.token === tokenId && r.level === displayLevel)
                ?.duration_min || 60) * 60000;

          // 1. Gather ONLY CURRENTLY ACTIVE Speed Boosters (checking startTime <= now && endTime >= now)
          const allBoosters: any[] = [
            ...(plot.booster ? [plot.booster] : []),
            ...(area.booster ? [area.booster] : []),
            ...(facObj.boosters || []),
            ...(facObj.consumableBoosters || []),
            ...(homeData?.purchases?.isNoAdsActive ? [{ boostValue: 0.5 }] : []),
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

          // 2. Extract Worker Speed Reduction Factor
          let reductionFactor = 1.0;
          if (
            Array.isArray(facObj.workerBoostIntervals) &&
            facObj.workerBoostIntervals.length > 0
          ) {
            const totalWorkerBoost = facObj.workerBoostIntervals.reduce(
              (sum: number, w: any) => sum + (w.boostValue || 0),
              0,
            );
            if (totalWorkerBoost > 0 && totalWorkerBoost < 1) {
              reductionFactor = totalWorkerBoost;
            }
          } else if (
            typeof crafting?.currentTimeReduction === 'number' &&
            crafting.currentTimeReduction > 0 &&
            crafting.currentTimeReduction < 1
          ) {
            reductionFactor = crafting.currentTimeReduction;
          }

          // 3. Calculate final effective runtime in minutes
          const effectiveMs = baseMs * boostMultiplier * reductionFactor;
          const effectiveMin = effectiveMs / 60000;

          activeRuns.push({
            title: plot.name || definition.displayName || tokenId,
            token: tokenId,
            level: displayLevel,
            startedAt,
            pausedAt: crafting?.pausedAt || fac?.pausedAt || null,
            runtimeMinutes: effectiveMin,
          });
        }
      });
    });
  });

  mines.forEach((mine: any) => {
    const startedAt = mine.startedAt || mine.crafting?.startedAt;
    if (startedAt) {
      const rawLevel = typeof mine.level === 'number' ? mine.level : 0;
      const displayLevel = rawLevel + 1;
      const levelData =
        mine.definition?.levels?.[rawLevel] || mine.definition?.levels?.[rawLevel - 1];
      const baseMin = levelData?.millisecondsPerCompletion
        ? levelData.millisecondsPerCompletion / 60000
        : 120;

      let boostMultiplier = 1.0;
      (mine.consumableBoosters || []).forEach((b: any) => {
        const startOk = !b.startTime || new Date(b.startTime).getTime() <= nowMs;
        const endOk = !b.endTime || new Date(b.endTime).getTime() >= nowMs;
        if (startOk && endOk && typeof b.boostValue === 'number' && b.boostValue > 0) {
          boostMultiplier *= b.boostValue;
        }
      });

      activeRuns.push({
        title: mine.definition?.displayName || mine.definition?.id || 'Mine',
        token: mine.definition?.id || 'Stone',
        level: displayLevel,
        startedAt,
        pausedAt: mine.pausedAt || null,
        runtimeMinutes: baseMin * boostMultiplier,
      });
    }
  });

  // Calculate server time offset to eliminate local OS clock/timezone disparity
  const serverTimeMs = homeData?.serverTime
    ? new Date(homeData.serverTime).getTime()
    : homeData?.lastSyncedAt
      ? new Date(homeData.lastSyncedAt).getTime()
      : Date.now();
  const serverOffset = serverTimeMs - Date.now();

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Temporizadores de Fábricas' : 'Factory Timers'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Monitorea el tiempo restante y progreso de tus producciones en tiempo real.'
              : 'Monitor remaining time and live progress of your active runs.'}
          </p>
        </div>

        {/* Notifications & Control Ribbon */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h4 className="font-extrabold text-white text-sm">
                  {language === 'es'
                    ? 'Notificaciones y Datos en Vivo'
                    : 'Live Desktop Alerts & Data'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'es'
                    ? 'Sincronizado con el servidor de Craft World.'
                    : 'Synced with Craft World server.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawInspector(!showRawInspector)}
                className="retroBtn text-xs"
              >
                🔍 {showRawInspector ? 'Ocultar JSON API' : 'Inspeccionar API JSON'}
              </button>

              {notifPermission === 'granted' ? (
                <span className="bg-emerald-950 text-emerald-300 text-xs px-3 py-1.5 rounded font-extrabold">
                  ✓ {language === 'es' ? 'Alertas Activas' : 'Alerts Active'}
                </span>
              ) : (
                <button onClick={requestNotif} className="retroBtn text-xs">
                  ⚡ {language === 'es' ? 'Activar Alertas' : 'Enable Alerts'}
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* RAW JSON API INSPECTOR */}
        {showRawInspector && (
          <Card title="🔍 Inspección Directa de Datos API Craft World (/me/craft-world)">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-slate-300">
                  A continuación se muestra el JSON exacto recibido directamente desde los
                  servidores de Craft World para tus parcelas y fábricas:
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(landPlots, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="retroBtn text-xs px-3 py-1.5 shrink-0"
                >
                  {copied ? '✓ ¡Copiado!' : '📋 Copiar JSON'}
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] text-emerald-400 font-mono max-h-96">
                {JSON.stringify(landPlots, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        {/* Active Timers Grid */}
        <Card
          title={
            language === 'es'
              ? `⏱️ Producciones Activas (${activeRuns.length})`
              : `⏱️ Active Runs (${activeRuns.length})`
          }
        >
          {activeRuns.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRuns.map((run, idx) => {
                const nowSynced = new Date(now + serverOffset);
                const status = calculateCycleTimerStatus({
                  runtimeMinutes: run.runtimeMinutes,
                  startedAt: run.startedAt,
                  pausedAt: run.pausedAt,
                  now: nowSynced,
                });

                const remSec = status.remainingSeconds;
                const hrs = Math.floor(remSec / 3600);
                const mins = Math.floor((remSec % 3600) / 60);
                const secs = remSec % 60;
                const formattedTime = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
                const isFinished = status.remainingSeconds <= 0;

                return (
                  <div key={idx} className="resource-item-badge p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FactoryIcon symbol={run.token} size={36} />
                        <div>
                          <h4 className="font-extrabold text-white text-sm">{run.title}</h4>
                          <span className="text-xs text-slate-400">
                            {run.token} • Nv. {run.level}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded ${isFinished ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'}`}
                      >
                        {isFinished
                          ? language === 'es'
                            ? '¡LISTO PARA RECLAMAR!'
                            : 'READY TO CLAIM!'
                          : formattedTime}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, status.progressPercent))}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                        <span>
                          {language === 'es' ? 'Progreso' : 'Progress'}:{' '}
                          {formatNumber(status.progressPercent, 1)}%
                        </span>
                        <span>
                          {isFinished
                            ? language === 'es'
                              ? 'Completado'
                              : 'Completed'
                            : language === 'es'
                              ? 'En Producción'
                              : 'In Production'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ResourceIcon symbol="Hammer" size={48} className="mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-300">
                {language === 'es'
                  ? 'No hay producciones activas en este momento.'
                  : 'No active production runs right now.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'es'
                  ? 'Inicia producciones en el juego para ver los temporizadores en vivo.'
                  : 'Start factory runs in game to see live timers here.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
