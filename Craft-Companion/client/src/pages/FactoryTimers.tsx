import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { calculateCycleTimerStatus } from '../services/craftworldCalculations';
import { applyWorkshopSpeedToDuration } from '../services/workshopModifiers';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { FactoryIcon, ResourceIcon } from '../components/GameIcon';
import { Button, Badge } from '../components/ui';
import { formatNumber, formatFactoryName } from '../utils/formatters';
import { sendFactoryNotification, playNotificationSound } from '../utils/notifications';

export default function FactoryTimers() {
  const { language } = useTranslation();
  const [homeData, setHomeData] = useState<any>(null);
  const [factoryRows, setFactoryRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [serverOffset, setServerOffset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default',
  );

  useEffect(() => {
    let mounted = true;

    const fetchData = () => {
      Promise.all([getCraftworldHome().catch(() => null), loadFactoryData().catch(() => [])])
        .then(([home, rows]) => {
          if (!mounted) return;
          if (home) {
            setHomeData(home);
            const serverTimeMs = home?.serverTime
              ? new Date(home.serverTime).getTime()
              : home?.lastSyncedAt
                ? new Date(home.lastSyncedAt).getTime()
                : Date.now();
            setServerOffset(serverTimeMs - Date.now());
          }
          if (rows && rows.length > 0) setFactoryRows(rows);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    };

    fetchData();

    // 1. Ticker cada 1 segundo exacto para actualizar la UI en vivo (tiempo, aro donut, porcentajes)
    const tickInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // 2. Polling cada 30 segundos en segundo plano para sincronizar nuevos estados con Craft World
    const syncInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const requestNotif = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
        if (perm === 'granted') {
          localStorage.setItem('craftworld.notificationsEnabled', 'true');
          sendFactoryNotification(
            language === 'es' ? '¡Notificaciones activadas!' : 'Notifications enabled!',
            language === 'es'
              ? 'Recibirás una alerta sonora cuando tus fábricas completen su ciclo.'
              : 'You will receive an alert when your factory cycles finish.',
            '/favicon.svg'
          );
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
    plotName?: string;
    token: string;
    outputToken: string;
    outputAmount: number;
    level: number;
    startedAt: string;
    pausedAt?: string | null;
    runtimeMinutes: number;
    isProducing: boolean;
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

          // 2. Extract Worker / Time Reduction Factor directly from Craft World API
          let reductionFactor = 1.0;
          if (
            typeof crafting?.currentTimeReduction === 'number' &&
            crafting.currentTimeReduction > 0 &&
            crafting.currentTimeReduction < 1
          ) {
            // Craft World sets currentTimeReduction to the final factor (e.g. 0.6415)
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

          // 3. Workshop speed bonus from player's workshop (if applicable)
          const workshopList = homeData?.craft?.workshop || [];
          const effectiveMs = baseMs * boostMultiplier * reductionFactor;
          let effectiveMin = effectiveMs / 60000;
          if (workshopList.length > 0) {
            effectiveMin = applyWorkshopSpeedToDuration(effectiveMin, tokenId, workshopList);
          }

          const matchedRow = factoryRows.find((r) => r.token === tokenId && r.level === displayLevel);
          const outputToken = matchedRow?.output_token || tokenId;
          const outputAmount = matchedRow?.output_amount || 1;

          // Title: Priority to the actual Factory Name (e.g. "Fábrica de Lodo" / definition.displayName / formatFactoryName), fallback to plot name
          const resolvedFactoryName =
            definition.displayName ||
            definition.name ||
            (tokenId && tokenId !== 'FACTORY' ? formatFactoryName(tokenId, language) : null) ||
            formatFactoryName(outputToken, language) ||
            plot.name ||
            tokenId;

          // Check if factory is actively running or stopped
          const isPaused = Boolean(crafting?.pausedAt || fac?.pausedAt);
          const isStopped = Boolean(crafting?.stoppedAt || fac?.stoppedAt || crafting?.isStopped || fac?.isStopped);
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



  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-xl sm:text-2xl font-title font-bold text-white tracking-wider uppercase"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)' }}
          >
            {language === 'es' ? 'Temporizadores de Fábricas' : 'Factory Timers'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Monitorea el tiempo restante y progreso de tus producciones en tiempo real.'
              : 'Monitor remaining time and live progress of your active runs.'}
          </p>
        </div>

        {/* Notifications & Active Timers Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <h2 className="font-extrabold text-white text-base sm:text-lg font-main flex items-center gap-2">
              <span>⏱️</span>
              <span>
                {language === 'es'
                  ? `Producciones Activas (${activeRuns.length})`
                  : `Active Runs (${activeRuns.length})`}
              </span>
            </h2>
            {activeRuns.length > 0 && (
              <span className="text-xs text-zinc-400 font-mono">
                {activeRuns.filter((r) => {
                  const runtimeSec = Math.max(1, Math.round(r.runtimeMinutes * 60));
                  const startedMs = new Date(r.startedAt).getTime();
                  const elapsedSec = Math.max(0, Math.floor((now + serverOffset - startedMs) / 1000));
                  return !r.isProducing && elapsedSec >= runtimeSec;
                }).length}{' '}
                {language === 'es' ? 'listas' : 'ready'}
              </span>
            )}
          </div>

          {/* Quick Actions: Bell Notification Toggle Button */}
          <div className="flex items-center gap-2">
            {/* Bell Button with filled green checkmark (active) or off badge (disabled) */}
            <button
              type="button"
              onClick={() => {
                if (notifPermission === 'granted') {
                  const currentEnabled = localStorage.getItem('craftworld.notificationsEnabled') === 'true';
                  if (currentEnabled) {
                    localStorage.setItem('craftworld.notificationsEnabled', 'false');
                    setNotifPermission('denied');
                  } else {
                    localStorage.setItem('craftworld.notificationsEnabled', 'true');
                    setNotifPermission('granted');
                  }
                } else {
                  requestNotif();
                }
              }}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                notifPermission === 'granted'
                  ? 'bg-[#18181b] hover:bg-[#222226] text-white'
                  : 'bg-[#18181b] hover:bg-[#222226] text-zinc-400'
              }`}
              title={
                notifPermission === 'granted'
                  ? (language === 'es' ? 'Notificaciones activas (Click para desactivar)' : 'Notifications active (Click to disable)')
                  : (language === 'es' ? 'Activar notificaciones' : 'Enable notifications')
              }
            >
              {/* Bell SVG */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {/* Status Badge in bottom-right corner of bell */}
              {notifPermission === 'granted' ? (
                /* Filled Green Circle with Checkmark */
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10b981] text-black flex items-center justify-center text-[10px] font-black shadow-sm">
                  ✓
                </span>
              ) : (
                /* Red/Dark Off Symbol (Slash or X) */
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500/90 text-white flex items-center justify-center text-[9px] font-black shadow-sm">
                  ✕
                </span>
              )}
            </button>
          </div>
        </div>



        {/* Active Timers Grid (Directly on body, borderless, compact) */}
        {activeRuns.length > 0 ? (
          <div className="grid gap-3 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeRuns.map((run, idx) => {
              const nowSynced = new Date(now + serverOffset);
              const runtimeSec = Math.max(1, Math.round(run.runtimeMinutes * 60));
              const startedMs = new Date(run.startedAt).getTime();
              const elapsedSec = Math.max(0, Math.floor((nowSynced.getTime() - startedMs) / 1000));
              
              // If the factory is actively producing, cycles loop continuously until stopped/empty
              const cycleElapsed = runtimeSec > 0 ? elapsedSec % runtimeSec : 0;
              const completedCycles = runtimeSec > 0 ? Math.floor(elapsedSec / runtimeSec) : 0;
              const remSec = run.isProducing 
                ? (runtimeSec - cycleElapsed) 
                : Math.max(0, runtimeSec - elapsedSec);

              const hrs = Math.floor(remSec / 3600);
              const mins = Math.floor((remSec % 3600) / 60);
              const secs = remSec % 60;
              const formattedTime = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
              
              // Only mark as finished ('Listo') if the factory actually completed and is stopped/empty
              const isFinished = !run.isProducing && remSec <= 0;
              const currentPercent = run.isProducing
                ? Math.min(100, Math.max(0, (cycleElapsed / runtimeSec) * 100))
                : (isFinished ? 100 : Math.min(100, Math.max(0, (elapsedSec / runtimeSec) * 100)));

              // Donut Ring properties
              const donutSize = 44;
              const strokeWidth = 3.8;
              const radius = (donutSize - strokeWidth) / 2;
              const circumference = 2 * Math.PI * radius;
              const clampedPercent = isFinished ? 100 : currentPercent;
              const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

              return (
                <div
                  key={idx}
                  className="bg-[#18181b] hover:bg-[#1c1c20] rounded-[32px] sm:rounded-[36px] p-4 sm:p-5 transition-all duration-200 shadow-lg group border-none flex flex-col justify-between gap-3"
                >
                  {/* TOP ROW: Thumbnail + Info + Multiplier Tag */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rounded square thumbnail container */}
                      <div className="w-11 h-11 rounded-[16px] bg-[#222226] flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                        <FactoryIcon symbol={run.token} size={26} />
                      </div>

                      <div className="min-w-0">
                        {/* Title */}
                        <h4 className="font-bold text-white text-xs sm:text-sm leading-snug truncate">
                          {run.title}
                        </h4>
                        {/* Level & Resource */}
                        <div className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate flex items-center gap-1.5">
                          <span>Nv. {run.level}</span>
                          <span>•</span>
                          <span className="text-zinc-300 flex items-center gap-1">
                            <ResourceIcon symbol={run.outputToken} size={12} />
                            {run.outputToken}
                          </span>
                        </div>
                        {/* Remaining Time */}
                        <div className="text-xs sm:text-sm font-extrabold text-white font-mono mt-0.5 tracking-tight">
                          {isFinished ? '0m 0s' : formattedTime}
                        </div>
                      </div>
                    </div>

                    {/* Right multiplier badge */}
                    <div
                      className="text-[11px] font-mono font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0"
                      style={{ textShadow: '0 1px 4px rgba(245, 158, 11, 0.4)' }}
                    >
                      x{run.outputAmount}
                    </div>
                  </div>

                  {/* BOTTOM ROW: SWAPPED - Actions on the LEFT, Donut Progress Ring on the RIGHT */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Action buttons (LEFT) */}
                    <div className="flex items-center gap-1.5">
                      {/* Main capsule button: says 'Listo' / 'Ready' when finished */}
                      <div
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 select-none ${
                          isFinished
                            ? 'bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20 cursor-pointer hover:bg-[#bef264]'
                            : 'bg-[#222226] text-zinc-300'
                        }`}
                      >
                        {isFinished ? (
                          <>
                            <span>✓</span>
                            <span>{language === 'es' ? 'Listo' : 'Ready'}</span>
                          </>
                        ) : (
                          <span>{language === 'es' ? 'En Producción' : 'In Production'}</span>
                        )}
                      </div>

                      {/* Circular icon button */}
                      <div
                        className="w-7 h-7 rounded-full bg-[#222226] hover:bg-[#28282e] text-zinc-300 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                        title={`Produciendo ${run.outputAmount} ${run.outputToken}`}
                      >
                        <span className="font-mono">%</span>
                      </div>
                    </div>

                    {/* Donut Progress Ring with percentage text inside (RIGHT) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-400 hidden sm:inline">
                        {isFinished
                          ? (language === 'es' ? 'Completado' : 'Completed')
                          : (language === 'es' ? 'Progreso' : 'Progress')}
                      </span>
                      <div className="relative flex items-center justify-center w-[44px] h-[44px] shrink-0">
                        <svg
                          width={donutSize}
                          height={donutSize}
                          className="transform -rotate-90 origin-center"
                        >
                          <circle
                            cx={donutSize / 2}
                            cy={donutSize / 2}
                            r={radius}
                            fill="transparent"
                            stroke="#27272a"
                            strokeWidth={strokeWidth}
                          />
                          <circle
                            cx={donutSize / 2}
                            cy={donutSize / 2}
                            r={radius}
                            fill="transparent"
                            stroke={isFinished ? '#a3e635' : '#06b6d4'}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-white">
                          {Math.round(clampedPercent)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#18181b] rounded-[28px] border-none">
            <ResourceIcon symbol="Hammer" size={48} className="mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-slate-300 font-main">
              {language === 'es'
                ? 'No hay producciones activas en este momento.'
                : 'No active production runs right now.'}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-main">
              {language === 'es'
                ? 'Inicia producciones en el juego para ver los temporizadores en vivo.'
                : 'Start factory runs in game to see live timers here.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
