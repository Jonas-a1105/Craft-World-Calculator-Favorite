import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { SkeletonTwoCards } from '../components/Skeleton';
import { getCraftworldHome } from '../services/api';
import {
  calculateCycleWindow,
  calculateCycleTimerStatus,
  calculateFactoryCycle,
  type FactoryDataRow,
} from '../services/craftworldCalculations';
import { formatDurationFromMinutes } from '../services/durationFormat';
import { type FactoryBoost } from '../services/factoryBoostModifiers';
import { loadFactoryData } from '../services/factoryData';
import { type WorkshopItem } from '../services/workshopModifiers';

type OwnedFactory = {
  id?: string;
  areaSymbol?: string;
  level?: number;
  landPlotName?: string;
  currentRunLevel?: number;
  startedAt?: string;
  claimedAt?: string;
  unclaimedUnitsBeforeCurrentRun?: number;
  activeBoosts?: FactoryBoost[];
};

type HomeData = {
  factories?: OwnedFactory[];
  workshop?: WorkshopItem[];
  lastSyncedAt?: string;
};

type StoredTimer = {
  startedAt?: string;
  pausedAt?: string;
  manual?: boolean;
};

const STORAGE_KEY = 'craftworld.factoryTimers.v1';

function formatFactoryName(symbol: string, lang: string): string {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'STEEL': return 'Acero';
      case 'WOOD': return 'Madera';
      case 'WATER': return 'Agua';
      case 'ALGAE': return 'Alga';
      case 'BOLTS': return 'Pernos';
      case 'BONESOUP': return 'Sopa de Huesos';
      case 'CEMENT': return 'Cemento';
      case 'CERAMICKEY': return 'Llave Cerámica';
      case 'CERAMICS': return 'Cerámicas';
      case 'CLAY': return 'Arcilla';
      case 'COPPER': return 'Cobre';
      case 'DYNAMITE': return 'Dinamita';
      case 'EARTH': return 'Tierra';
      case 'EXPLOSIVES': return 'Explosivos';
      case 'FERTILIZER': return 'Fertilizante';
      case 'FIRE': return 'Fuego';
      case 'FISH': return 'Pescado';
      case 'GLASS': return 'Vidrio';
      case 'GOLD': return 'Oro';
      case 'GRAIN': return 'Grano';
      case 'IRON': return 'Hierro';
      case 'LEATHER': return 'Cuero';
      case 'LIMESTONE': return 'Caliza';
      case 'MUD': return 'Lodo';
      case 'OXYGEN': return 'Oxígeno';
      case 'PAPER': return 'Papel';
      case 'PLASTIC': return 'Plástico';
      case 'SAND': return 'Arena';
      case 'SCREWS': return 'Tornillos';
      case 'SILICA': return 'Sílice';
      case 'STONE': return 'Piedra';
      case 'SULFUR': return 'Azufre';
      case 'TEXTILE': return 'Textil';
      case 'VEGETABLES': return 'Vegetales';
      case 'GAS': return 'Gas';
      case 'OIL': return 'Petróleo';
      case 'HEAT': return 'Calor';
      case 'ACID': return 'Ácido';
      case 'SEAWATER': return 'Agua de Mar';
      case 'FUEL': return 'Combustible';
      case 'COAL': return 'Carbón';
      case 'AIR': return 'Aire';
      default:
        return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    }
  } else {
    return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }
}

function formatPlotName(plotName: string, lang: string): string {
  const normalized = String(plotName || '').trim().toUpperCase();
  if (lang === 'es') {
    if (normalized.includes('EARTH_PLOT')) return 'Fábrica de Tierra';
    if (normalized.includes('BLUEPRINT_PLOT_A')) return 'Plano A';
    if (normalized.includes('BLUEPRINT_PLOT_B')) return 'Plano B';
    if (normalized.includes('BLUEPRINT_PLOT_C')) return 'Plano C';
    if (normalized.includes('BLUEPRINT_PLOT_D')) return 'Plano D';
    if (normalized.includes('BLUEPRINT_PLOT_E')) return 'Plano E';
    if (normalized.includes('BLUEPRINT_PLOT_F')) return 'Plano F';
    if (normalized.includes('BLUEPRINT_PLOT_G')) return 'Plano G';
    if (normalized.includes('BLUEPRINT_PLOT_H')) return 'Plano H';
    return plotName;
  }
  return plotName;
}

function fmt(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function formatSeconds(seconds: number) {
  return formatDurationFromMinutes(Math.max(seconds, 0) / 60);
}

function formatTimeToEnd(seconds: number, ended: boolean, lang: string) {
  return ended ? (lang === 'es' ? 'Listo' : 'Ready') : formatSeconds(seconds);
}

function getFactoryImage(symbol?: string) {
  if (!symbol) return '';
  const cleanName = symbol.trim().toLowerCase();
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (capitalized === 'Earth') return '/assets/factories/Earth.png';
  return `/assets/factories/${capitalized}.gif`;
}

function getResourceImage(symbol?: string) {
  if (!symbol) return '';
  const cleanSymbol = symbol.trim().toLowerCase();
  const formattedSymbol = cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1);
  return `/assets/resources/${formattedSymbol}.png`;
}

function formatTimestamp(value?: string, lang?: string) {
  return value ? new Date(value).toLocaleString() : (lang === 'es' ? 'No disponible' : 'Not available');
}

function timerSource(factory: OwnedFactory, timer?: StoredTimer, lang?: string) {
  if (timer?.manual && timer.startedAt) return lang === 'es' ? 'Manual (Sobrescribir)' : 'Manual override';
  if (factory.startedAt) return 'Craft World API';
  return lang === 'es' ? 'Falta hora de inicio' : 'Missing start time';
}

function timerStartedAt(factory: OwnedFactory, timer?: StoredTimer) {
  if (timer?.manual && timer.startedAt) return timer.startedAt;
  return factory.startedAt;
}

function timerPausedAt(timer?: StoredTimer) {
  return timer?.manual ? timer.pausedAt : undefined;
}

function getDisplayLevel(factory: OwnedFactory) {
  return typeof factory.currentRunLevel === 'number'
    ? factory.currentRunLevel + 1
    : typeof factory.level === 'number'
      ? factory.level + 1
      : 0;
}

function loadTimers(): Record<string, StoredTimer> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, StoredTimer>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveTimers(timers: Record<string, StoredTimer>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

interface CircularProgressProps {
  progress: number;
  remainingSeconds: number;
  ended: boolean;
  paused: boolean;
  language: string;
  uniqueId: string;
}

function CircularProgress({ progress, remainingSeconds, ended, paused, language, uniqueId }: CircularProgressProps) {
  const safeId = useMemo(() => `clip-${uniqueId.replace(/[^a-zA-Z0-9]/g, '-')}`, [uniqueId]);

  const wavyPathStatic = useMemo(() => {
    const cx = 50;
    const cy = 50;
    const r = 36;
    const wavesCount = 12; // Fewer waves to make them smoother and wider
    const amplitude = 2.0; // Perfect visual amplitude for rounded wave crests
    const totalSegments = wavesCount * 2;
    const points = [];
    
    const startX = cx + r;
    const startY = cy;
    points.push(`M ${startX.toFixed(2)} ${startY.toFixed(2)}`);
    
    for (let i = 0; i < totalSegments; i++) {
      const angle2 = ((i + 1) * 2 * Math.PI) / totalSegments;
      const angleMid = ((i + 0.5) * 2 * Math.PI) / totalSegments;
      
      const isPeak = i % 2 === 0;
      const controlR = r + (isPeak ? amplitude : -amplitude);
      
      const cx_pt = cx + controlR * Math.cos(angleMid);
      const cy_pt = cy + controlR * Math.sin(angleMid);
      
      const x2 = cx + r * Math.cos(angle2);
      const y2 = cy + r * Math.sin(angle2);
      
      points.push(`Q ${cx_pt.toFixed(2)} ${cy_pt.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`);
    }
    
    return points.join(' ') + ' Z';
  }, []);

  const formatTimeShort = () => {
    if (remainingSeconds <= 0) return '0s';
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = Math.floor(remainingSeconds % 60);
    if (h > 0) return `${h}h${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  const percentage = Math.max(0, Math.min(100, progress));

  return (
    <div className="relative w-[72px] h-[72px] shrink-0 mx-auto select-none">
      <style>{`
        @keyframes slither-${safeId} {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .slithering-path-${safeId} {
          animation: slither-${safeId} 3s linear infinite;
          transform-origin: center;
        }
      `}</style>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          {/* Mask to restrict progress length strictly to the stroke outline */}
          <mask id={safeId}>
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="none"
              stroke="white"
              className="-rotate-90 origin-center"
              strokeWidth="12"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - percentage}
              strokeLinecap="round"
              style={{ fill: 'none', stroke: 'white' }}
            />
          </mask>
        </defs>
        
        {/* Background track circle */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          className="stroke-white/[0.06] fill-none"
          strokeWidth="3.5"
          style={{ fill: 'none' }}
        />
        
        {/* Wavy path, masked and animated */}
        <path
          d={wavyPathStatic}
          fill="none"
          className={`fill-none stroke-emerald-500 slithering-path-${safeId}`}
          strokeWidth="4.5"
          strokeLinecap="round"
          mask={`url(#${safeId})`}
          style={{
            fill: 'none',
            animationPlayState: paused || ended || percentage <= 0 ? 'paused' : 'running',
          }}
        />
      </svg>
      {/* Centered details */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-[12px] font-black text-white leading-none tracking-tight">
          {fmt(percentage, 0)}%
        </span>
        <span className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">
          {paused ? (
            <span className="text-yellow-500/90 font-black">{language === 'es' ? 'Pausa' : 'Pause'}</span>
          ) : ended ? (
            <span className="text-emerald-400 font-black">{language === 'es' ? 'Listo' : 'Ready'}</span>
          ) : (
            formatTimeShort()
          )}
        </span>
      </div>
    </div>
  );
}

export default function FactoryTimers() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [home, setHome] = useState<HomeData | null>(null);
  const [timers, setTimers] = useState<Record<string, StoredTimer>>({});
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('timersViewMode') as 'list' | 'grid') || 'list');

  useEffect(() => {
    localStorage.setItem('timersViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    setTimers(loadTimers());
    const interval = window.setInterval(() => setNow(new Date()), 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [factoryRows, homeData] = await Promise.all([loadFactoryData(), getCraftworldHome()]);
        setRows(factoryRows);
        setHome(homeData || {});
      } catch {
        setError('Unable to load factory timer data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const timerRows = useMemo(() => {
    return (home?.factories || [])
      .map((factory, index) => {
        const symbol = String(factory.areaSymbol || '').trim().toUpperCase();
        const level = getDisplayLevel(factory);
        const row = rows.find((item) => item.token === symbol && item.level === level) || null;
        if (!symbol || !row) return null;
        const key = factory.id ? `${factory.id}-${index}` : `${factory.landPlotName || 'plot'}-${symbol}-${level}-${index}`;
        const cycle = calculateFactoryCycle(row, {}, { workshop: home?.workshop || [], activeBoosts: factory.activeBoosts || [] });
        const storedTimer = timers[key];
        const startedAt = timerStartedAt(factory, storedTimer);
        const cycleWindow = calculateCycleWindow(cycle.runtimeMinutes, startedAt, now);
        const status = calculateCycleTimerStatus({
          runtimeMinutes: cycle.runtimeMinutes,
          startedAt,
          pausedAt: timerPausedAt(storedTimer),
          now,
        });
        return {
          key,
          factory,
          row,
          cycle,
          status,
          cycleWindow,
          source: timerSource(factory, storedTimer, language),
          startedAt,
          estimatedCompleted: Math.max(0, Number(factory.unclaimedUnitsBeforeCurrentRun || 0)) + status.completedCycles,
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
  }, [home, now, rows, timers, language]);

  function updateTimer(key: string, timer: StoredTimer) {
    const next = { ...timers, [key]: timer };
    setTimers(next);
    saveTimers(next);
  }

  function resetTimer(key: string) {
    const next = { ...timers };
    delete next[key];
    setTimers(next);
    saveTimers(next);
  }

  if (loading) {
    return (
      <Layout>
        <SkeletonTwoCards />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Temporizadores de Fábricas' : 'Factory Timers'}>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                {language === 'es'
                  ? 'Los temporizadores usan las marcas de tiempo startedAt de la API de Craft World cuando están disponibles. El inicio manual sigue disponible como una opción local.'
                  : 'Timers use Craft World API startedAt timestamps when available. Manual starts are still available as a local override.'}
              </p>
              <p className="text-slate-400">
                {language === 'es' ? 'Última sincronización:' : 'Last synced:'}{' '}
                {home?.lastSyncedAt ? new Date(home.lastSyncedAt).toLocaleString() : (language === 'es' ? 'No conectado' : 'Not connected')}
              </p>
              {error && <p className="text-red-300">{error}</p>}
            </div>
          </Card>
        </div>

        <div className="w-[95vw] max-w-[1800px] relative left-1/2 -translate-x-1/2">
          <Card title={language === 'es' ? 'Fábricas Activas' : 'Active Factories'}>
            <div className="flex justify-end mb-4 gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                style={{ border: 'none' }}
              >
                {language === 'es' ? 'Lista' : 'List'}
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                style={{ border: 'none' }}
              >
                {language === 'es' ? 'Tarjetas' : 'Cards'}
              </button>
            </div>

            {timerRows.length ? (
              viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1220px] text-left text-sm">
                    <thead className="text-slate-300">
                      <tr>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ejecución' : 'Runtime'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Origen' : 'Source'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Iniciado' : 'Started'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Finaliza' : 'Ends'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Tiempo Restante' : 'Time to End'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ciclos / Hora' : 'Cycles / Hr'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ciclos / Día' : 'Cycles / Day'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Por Finalizar' : 'Remaining'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Progreso' : 'Progress'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estimado Completado' : 'Est. Complete'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Acciones' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timerRows.map(({ key, factory, row, cycle, status, cycleWindow, source, startedAt, estimatedCompleted }) => {
                        const factImg = getFactoryImage(row.token);
                        return (
                          <tr key={key} className="border-t border-slate-800">
                            <td className="p-2 font-semibold whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {factImg && (
                                  <img 
                                    src={factImg} 
                                    alt={row.token} 
                                    className="h-8 w-8 bg-slate-900 object-contain p-0.5" 
                                    style={{ borderRadius: 'var(--radius-resource-item)' }}
                                  />
                                )}
                                <span>
                                  {formatPlotName(factory.landPlotName || '', language)} • {formatFactoryName(row.token, language)} {language === 'es' ? 'Nivel' : 'Lv'} {row.level}
                                </span>
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">{formatDurationFromMinutes(cycle.runtimeMinutes)}</td>
                            <td className="p-2 whitespace-nowrap">{source}</td>
                            <td className="p-2 whitespace-nowrap">{formatTimestamp(startedAt, language)}</td>
                            <td className="p-2 whitespace-nowrap">{formatTimestamp(cycleWindow.endsAt, language)}</td>
                            <td className="p-2 whitespace-nowrap">
                              {cycleWindow.hasWindow 
                                ? formatTimeToEnd(cycleWindow.secondsUntilEnd, cycleWindow.ended, language) 
                                : (language === 'es' ? 'Esperando hora de inicio' : 'Waiting for start time')}
                            </td>
                            <td className="p-2 whitespace-nowrap">{fmt(cycle.runsPerHour, 3)}</td>
                            <td className="p-2 whitespace-nowrap">{fmt(cycle.runsPerDay, 2)}</td>
                            <td className="p-2 whitespace-nowrap">
                              {status.requiresStartTime 
                                ? (language === 'es' ? 'La cuenta regresiva requiere sincronización' : 'Cycle countdown requires start time sync') 
                                : formatSeconds(status.remainingSeconds)}
                              {status.paused ? (language === 'es' ? ' (pausado)' : ' (paused)') : ''}
                            </td>
                            <td className="p-2 text-center">
                              <CircularProgress 
                                progress={status.progressPercent}
                                remainingSeconds={status.remainingSeconds}
                                ended={cycleWindow.ended}
                                paused={status.paused}
                                language={language}
                                uniqueId={key}
                              />
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              {estimatedCompleted}
                              {factory.unclaimedUnitsBeforeCurrentRun ? (
                                <span className="ml-1 text-xs text-slate-400">
                                  ({factory.unclaimedUnitsBeforeCurrentRun} {language === 'es' ? 'no reclamados antes de la actual' : 'unclaimed before current'})
                                </span>
                              ) : null}
                            </td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2">
                                <button 
                                  onClick={() => updateTimer(key, { startedAt: new Date().toISOString(), manual: true })} 
                                  className="rounded-[8px] bg-blue-600 px-3 py-1.5 font-bold text-xs cursor-pointer hover:bg-blue-500 transition-colors"
                                >
                                  {language === 'es' ? 'Inicio manual' : 'Manual start'}
                                </button>
                                <button
                                  onClick={() => {
                                    const existing = timers[key];
                                    if (!existing?.manual || !existing.startedAt) return;
                                    updateTimer(key, existing.pausedAt ? { startedAt: existing.startedAt, manual: true } : { ...existing, pausedAt: new Date().toISOString(), manual: true });
                                  }}
                                  className="rounded-[8px] bg-slate-700 px-3 py-1.5 font-bold text-xs cursor-pointer hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={!timers[key]?.manual}
                                >
                                  {timers[key]?.pausedAt ? (language === 'es' ? 'Reanudar' : 'Resume') : (language === 'es' ? 'Pausar' : 'Pause')}
                                </button>
                                <button 
                                  onClick={() => resetTimer(key)} 
                                  className="rounded-[8px] bg-red-700 px-3 py-1.5 font-bold text-xs cursor-pointer hover:bg-red-650 transition-colors"
                                >
                                  {language === 'es' ? 'Usar API' : 'Use API'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6 mt-2">
                  {timerRows.map(({ key, factory, row, cycle, status, cycleWindow, source, startedAt, estimatedCompleted }) => {
                    const factImg = getFactoryImage(row.token);
                    return (
                      <div 
                        key={key}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius)',
                          padding: '16px',
                          border: 'none'
                        }}
                        className="flex flex-col gap-4 w-full max-w-[420px]"
                      >
                        
                        {/* Header: Info + Circular Progress */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              className="w-14 h-14 bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0"
                              style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                            >
                              {factImg ? (
                                <img 
                                  src={factImg} 
                                  alt={row.token} 
                                  className="w-full h-full object-contain" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `/assets/resources/${row.token.charAt(0).toUpperCase() + row.token.slice(1).toLowerCase()}.png`;
                                  }}
                                />
                              ) : (
                                <div className="text-xs font-black text-slate-500">{row.token.slice(0, 3)}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase font-black text-orange-400">
                                  {formatFactoryName(row.token, language)}
                                </span>
                                <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-300 font-bold">
                                  {language === 'es' ? `Nivel ${row.level}` : `Lv ${row.level}`}
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-white truncate mt-1">
                                {formatPlotName(factory.landPlotName || '', language)}
                              </h3>
                            </div>
                          </div>

                          {/* CircularProgress */}
                          <div className="shrink-0">
                            <CircularProgress 
                              progress={status.progressPercent}
                              remainingSeconds={status.remainingSeconds}
                              ended={cycleWindow.ended}
                              paused={status.paused}
                              language={language}
                              uniqueId={key}
                            />
                          </div>
                        </div>

                        {/* Grid of Adaptive Badges (No borders, wraps to content size!) */}
                        <div className="flex flex-wrap justify-center gap-2">
                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ejecución:' : 'Runtime:'}</span>
                            <strong className="text-slate-200">{formatDurationFromMinutes(cycle.runtimeMinutes)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Origen:' : 'Source:'}</span>
                            <strong className="text-slate-200">{source}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Iniciado:' : 'Started:'}</span>
                            <strong className="text-slate-200">{formatTimestamp(startedAt, language)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Finaliza:' : 'Ends:'}</span>
                            <strong className="text-slate-200">{formatTimestamp(cycleWindow.endsAt, language)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Restante:' : 'Time to End:'}</span>
                            <strong className="text-slate-200">
                              {cycleWindow.hasWindow 
                                ? formatTimeToEnd(cycleWindow.secondsUntilEnd, cycleWindow.ended, language) 
                                : (language === 'es' ? 'Esperando hora' : 'Waiting for time')}
                            </strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ciclos / Hora:' : 'Cycles / Hr:'}</span>
                            <strong className="text-slate-200">{fmt(cycle.runsPerHour, 3)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ciclos / Día:' : 'Cycles / Day:'}</span>
                            <strong className="text-slate-200">{fmt(cycle.runsPerDay, 2)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Por Finalizar:' : 'Remaining:'}</span>
                            <strong className="text-slate-200">
                              {status.requiresStartTime 
                                ? (language === 'es' ? 'Sincro requ.' : 'Sync req.') 
                                : formatSeconds(status.remainingSeconds)}
                              {status.paused ? (language === 'es' ? ' (pausado)' : ' (paused)') : ''}
                            </strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'No Reclamados:' : 'Unclaimed:'}</span>
                            <strong className="text-slate-200">{factory.unclaimedUnitsBeforeCurrentRun || 0}</strong>
                          </div>
                        </div>

                        {/* Action buttons (Styled match, no borders) */}
                        <div className="flex justify-center gap-2 pt-2 border-t border-white/[0.03] flex-wrap">
                          <button 
                            onClick={() => updateTimer(key, { startedAt: new Date().toISOString(), manual: true })} 
                            className="py-1.5 px-3 rounded-[8px] bg-slate-900/60 text-[10px] text-slate-350 font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-center" 
                            style={{ border: 'none' }}
                          >
                            {language === 'es' ? 'Inicio manual' : 'Manual start'}
                          </button>
                          <button 
                            onClick={() => {
                              const existing = timers[key];
                              if (!existing?.manual || !existing.startedAt) return;
                              updateTimer(key, existing.pausedAt ? { startedAt: existing.startedAt, manual: true } : { ...existing, pausedAt: new Date().toISOString(), manual: true });
                            }}
                            disabled={!timers[key]?.manual}
                            className="py-1.5 px-3 rounded-[8px] bg-slate-900/60 text-[10px] text-slate-350 font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed" 
                            style={{ border: 'none' }}
                          >
                            {timers[key]?.pausedAt ? (language === 'es' ? 'Reanudar' : 'Resume') : (language === 'es' ? 'Pausar' : 'Pause')}
                          </button>
                          <button 
                            onClick={() => resetTimer(key)} 
                            className="py-1.5 px-3 rounded-[8px] bg-slate-900/60 text-[10px] text-slate-350 font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-center" 
                            style={{ border: 'none' }}
                          >
                            {language === 'es' ? 'Usar API' : 'Use API'}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <p className="text-sm text-slate-400">
                {language === 'es' ? 'Aún no se encontraron fábricas activas coincidentes.' : 'No matched live factories were found yet.'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
