import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { SkeletonSingleColumn } from '../components/Skeleton';
import { loadFactoryData, type FactoryDataRow } from '../services/factoryData';

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

function getResourceImage(symbol?: string) {
  if (!symbol) return '';
  const cleanSymbol = symbol.trim().toLowerCase();
  const formattedSymbol = cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1);
  return `/assets/resources/${formattedSymbol}.png`;
}

type MatrixCell = {
  inputBuyCost: number;
  outputSellValue: number;
  returnPercent: number;
  priceImpactPercentage: number;
  isComplete: boolean;
  updatedAt: string;
};

type MatrixCachePayload = {
  updatedAt: string;
  selectedGroup?: string;
  scanStatus?: 'idle' | 'scanning';
  scanColumn?: string;
  scanStartedAt?: string;
  nextScanAt?: string;
  cells: Record<string, MatrixCell>;
};

const tokenOrder = [
  'MUD',
  'CLAY',
  'SAND',
  'COPPER',
  'STEEL',
  'SCREWS',
  'SEAWATER',
  'HEAT',
  'ALGAE',
  'LAVA',
  'OXYGEN',
  'GAS',
  'FUEL',
  'OIL',
  'GLASS',
  'SULFUR',
  'FIBERGLASS',
  'STEAM',
  'CERAMICS',
  'STONE',
  'CEMENT',
  'ACID',
  'PLASTICS',
  'ENERGY',
  'HYDROGEN',
  'DYNAMITE',
  'BOLTS',
  'KEY',
  'CERAMICKEY',
  'GLASSKEY',
  'DYNOKEY',
];

const API = import.meta.env.VITE_API_BASE_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : ''
);
const POLL_MS = 1000;
const EMPTY_MATRIX_CACHE: MatrixCachePayload = { updatedAt: '', scanStatus: 'idle', scanColumn: '', nextScanAt: '', cells: {} };

function formatNumber(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function cellKey(token: string, level: number) {
  return `${token}-${level}`;
}

function getCellClass(value: number) {
  if (!Number.isFinite(value)) return 'bg-slate-950 text-slate-500';
  if (value >= 0) return 'profit-cell';
  return 'loss-cell';
}

function secondsUntil(dateString?: string) {
  if (!dateString) return 0;
  return Math.max(0, Math.ceil((new Date(dateString).getTime() - Date.now()) / 1000));
}

async function loadMatrixCache(): Promise<MatrixCachePayload> {
  const authToken = localStorage.getItem('token');
  const response = await fetch(`${API}/api/craftworld/matrix-cache?_=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Matrix cache request failed.');
  return response.json();
}

export default function Matrix() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [cache, setCache] = useState<MatrixCachePayload>(EMPTY_MATRIX_CACHE);
  const [selectedGroup, setSelectedGroup] = useState('EARTH');
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [lastPolledAt, setLastPolledAt] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('matrixViewMode') as 'list' | 'grid') || 'list';
  });

  async function refreshCache() {
    try {
      const nextCache = await loadMatrixCache();
      setCache({ ...EMPTY_MATRIX_CACHE, ...nextCache, cells: (nextCache.cells || {}) as Record<string, MatrixCell> });
      setCountdown(secondsUntil(nextCache.nextScanAt));
      setLastPolledAt(new Date().toISOString());
      setError('');
    } catch {
      setError(language === 'es' ? 'No se pudo cargar el caché global de la matriz.' : 'Unable to load global matrix cache.');
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [factoryRows, matrixCache] = await Promise.all([loadFactoryData(), loadMatrixCache().catch(() => EMPTY_MATRIX_CACHE)]);
        setRows(factoryRows);
        setCache({ ...EMPTY_MATRIX_CACHE, ...matrixCache, cells: (matrixCache.cells || {}) as Record<string, MatrixCell> });
        setCountdown(secondsUntil(matrixCache.nextScanAt));
        setLastPolledAt(new Date().toISOString());
      } catch {
        setError(language === 'es' ? 'No se pudieron cargar los datos de la matriz.' : 'Unable to load matrix data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [language]);

  useEffect(() => {
    refreshCache();
    const poll = window.setInterval(refreshCache, POLL_MS);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const tokenGroups = useMemo(() => {
    const available = [...new Set(rows.map((row) => row.token))];
    return {
      EARTH: available.filter((token) => ['MUD', 'CLAY', 'SAND', 'COPPER', 'STEEL', 'SCREWS'].includes(token)),
      WATER: available.filter((token) => ['SEAWATER', 'ALGAE', 'OXYGEN', 'GAS', 'FUEL', 'OIL'].includes(token)),
      FIRE: available.filter((token) => ['HEAT', 'LAVA', 'GLASS', 'SULFUR', 'FIBERGLASS'].includes(token)),
      ADVANCED: available.filter((token) => ['STEAM', 'CERAMICS', 'STONE', 'CEMENT', 'ACID', 'PLASTICS', 'ENERGY', 'HYDROGEN', 'DYNAMITE'].includes(token)),
      KEYS: available.filter((token) => ['BOLTS', 'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'].includes(token)),
    };
  }, [rows]);

  const selectedTokens = useMemo(() => {
    const groupTokens = tokenGroups[selectedGroup as keyof typeof tokenGroups] || [];
    return [...groupTokens].sort((a, b) => {
      const indexA = tokenOrder.indexOf(a);
      const indexB = tokenOrder.indexOf(b);
      const normalizedA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const normalizedB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      if (normalizedA !== normalizedB) return normalizedA - normalizedB;
      return a.localeCompare(b);
    });
  }, [selectedGroup, tokenGroups]);

  const maxLevel = useMemo(() => {
    const levels = rows.filter((row) => selectedTokens.includes(row.token)).map((row) => row.level);
    return levels.length ? Math.max(...levels) : 0;
  }, [rows, selectedTokens]);

  if (loading) {
    return (
      <Layout>
        <SkeletonSingleColumn />
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        .matrix-container {
          background-color: rgba(10, 10, 10, 0.4) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border-radius: 12px;
        }
        .matrix-table th {
          border: none !important;
          background-color: rgba(22, 22, 22, 0.85) !important;
          color: #e2e8f0 !important;
        }
        .matrix-table td {
          border: none !important;
        }
        .lvl-cell {
          background-color: rgba(22, 22, 22, 0.75) !important;
          color: #94a3b8 !important;
          font-weight: 700;
        }
        .empty-cell {
          background-color: rgba(22, 22, 22, 0.25) !important;
          color: #475569 !important;
        }
        .waiting-cell {
          background-color: rgba(22, 22, 22, 0.25) !important;
          color: #64748b !important;
        }
        .profit-cell {
          background-color: rgba(16, 185, 129, 0.08) !important;
          color: #34d399 !important;
        }
        .loss-cell {
          background-color: rgba(239, 68, 68, 0.08) !important;
          color: #f87171 !important;
        }
        
        /* Hover states with text popping and glowing */
        .matrix-table tr:hover td.lvl-cell {
          background-color: rgba(45, 45, 45, 0.85) !important;
          color: #f8fafc !important;
        }
        .matrix-table tr:hover td.empty-cell {
          background-color: rgba(45, 45, 45, 0.45) !important;
        }
        .matrix-table tr:hover td.waiting-cell {
          background-color: rgba(45, 45, 45, 0.45) !important;
        }
        .matrix-table tr:hover td.profit-cell {
          background-color: rgba(16, 185, 129, 0.2) !important;
          color: #a7f3d0 !important;
          text-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
        }
        .matrix-table tr:hover td.loss-cell {
          background-color: rgba(239, 68, 68, 0.2) !important;
          color: #fca5a5 !important;
          text-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
        }
      `}</style>
      <div className="space-y-4">
        <Card title={language === 'es' ? 'Matriz' : 'Matrix'}>
          <div className="space-y-3">
            <p key="info1" className="text-sm text-slate-300">
              {language === 'es'
                ? 'Esta página lee del caché de matriz global del servidor y fuerza una actualización cada segundo.'
                : 'This page reads from the global server matrix cache and forces a fresh poll every second.'}
            </p>
            <p key="info2" className="text-sm text-yellow-200">
              {language === 'es'
                ? 'El navegador ya no realiza el escaneo. Solo recarga el caché guardado a medida que el servidor escribe nuevas celdas.'
                : 'The browser no longer scans. It only reloads the saved cache as the server writes new matrix cells.'}
            </p>
            {error && <p key="err" className="text-sm text-red-300">{error}</p>}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {Object.keys(tokenGroups).map((group) => {
                  const groupLabels: Record<string, string> = {
                    EARTH: language === 'es' ? 'Tierra' : 'Earth',
                    WATER: language === 'es' ? 'Agua' : 'Water',
                    FIRE: language === 'es' ? 'Fuego' : 'Fire',
                    ADVANCED: language === 'es' ? 'Avanzado' : 'Advanced',
                    KEYS: language === 'es' ? 'Llaves' : 'Keys',
                  };
                  return (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`rounded-[8px] border px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                        selectedGroup === group 
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' 
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {groupLabels[group] || group}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => { setViewMode('list'); localStorage.setItem('matrixViewMode', 'list'); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                  style={{ border: 'none' }}
                >
                  {language === 'es' ? 'Lista' : 'List'}
                </button>
                <button 
                  onClick={() => { setViewMode('grid'); localStorage.setItem('matrixViewMode', 'grid'); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                  style={{ border: 'none' }}
                >
                  {language === 'es' ? 'Tarjetas' : 'Cards'}
                </button>
              </div>
            </div>
            <div className="grid gap-2 text-xs text-slate-400 md:grid-cols-5 border-t border-slate-800/50 pt-3">
              <p key="next">
                {language === 'es' ? 'Próximo escaneo:' : 'Next global scan:'}{' '}
                <span className="font-bold text-white">{countdown}s</span>
              </p>
              <p key="status">
                {language === 'es' ? 'Estado:' : 'Status:'}{' '}
                <span className="font-bold text-white">
                  {cache.scanStatus === 'scanning' ? (language === 'es' ? 'escaneando' : 'scanning') : (language === 'es' ? 'inactivo' : 'idle')}
                </span>
              </p>
              <p key="column">
                {language === 'es' ? 'Columna:' : 'Column:'}{' '}
                <span className="font-bold text-white">
                  {cache.scanColumn ? formatFactoryName(cache.scanColumn, language) : (language === 'es' ? 'Ninguna' : 'None')}
                </span>
              </p>
              <p key="save">
                {language === 'es' ? 'Último guardado:' : 'Last save:'}{' '}
                <span className="font-bold text-white">
                  {cache.updatedAt ? new Date(cache.updatedAt).toLocaleString() : (language === 'es' ? 'Sin datos' : 'No save yet')}
                </span>
              </p>
              <p key="poll">
                {language === 'es' ? 'Último sondeo:' : 'Last poll:'}{' '}
                <span className="font-bold text-white">
                  {lastPolledAt ? new Date(lastPolledAt).toLocaleTimeString() : (language === 'es' ? 'Nunca' : 'Never')}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-xl matrix-container">
            <table className="min-w-full border-collapse text-center text-sm matrix-table">
              <thead className="sticky top-0 bg-slate-950">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-300 font-extrabold">{language === 'es' ? 'Nivel' : 'Lvl'}</th>
                  {selectedTokens.map((token) => {
                    const img = getResourceImage(token);
                    return (
                      <th key={token} className={`px-3 py-2 text-slate-300 ${cache.scanColumn === token ? 'bg-emerald-500/10' : ''}`}>
                        <div className="flex flex-col items-center gap-1">
                          {img && <img src={img} alt={token} className="h-6 w-6 object-contain" style={{ borderRadius: 'var(--radius-resource-item)' }} />}
                          <span className="font-bold">{formatFactoryName(token, language)}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxLevel }, (_, index) => index + 1).map((level) => (
                  <tr key={level}>
                    <td className="lvl-cell px-3 py-2 text-left text-slate-300">{level}</td>
                    {selectedTokens.map((token) => {
                      const cell = cache.cells[cellKey(token, level)];
                      const hasFactoryLevel = Boolean(rows.find((row) => row.token === token && row.level === level));
                      if (!hasFactoryLevel) {
                        return (
                          <td key={`${token}-${level}`} className="empty-cell px-3 py-2 text-slate-700">
                            ·
                          </td>
                        );
                      }

                      if (!cell?.isComplete) {
                        return (
                          <td key={`${token}-${level}`} className="waiting-cell px-3 py-2 text-slate-500" title={language === 'es' ? 'Esperando datos de caché global' : 'Waiting for global cache data'}>
                            ...
                          </td>
                        );
                      }

                      const tooltip = language === 'es'
                        ? `Valor de venta: ${formatNumber(cell.outputSellValue, 6)} COIN • Costo de ingredientes: ${formatNumber(cell.inputBuyCost, 6)} COIN • Impacto: ${formatNumber(cell.priceImpactPercentage, 2)}% • Actualizado: ${new Date(cell.updatedAt).toLocaleString()}`
                        : `Output sell value ${formatNumber(cell.outputSellValue, 6)} COIN • Input buy cost ${formatNumber(cell.inputBuyCost, 6)} COIN • Impact ${formatNumber(cell.priceImpactPercentage, 2)}% • Updated ${new Date(cell.updatedAt).toLocaleString()}`;

                      return (
                        <td
                          key={`${token}-${level}`}
                          className={`px-3 py-2 font-mono ${getCellClass(cell.returnPercent)}`}
                          title={tooltip}
                        >
                          {cell.returnPercent >= 0 ? '+' : ''}{formatNumber(cell.returnPercent, 2)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
            {selectedTokens.map((token) => {
              const img = getResourceImage(token);
              const isScanning = cache.scanColumn === token;
              return (
                <div 
                  key={token} 
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    border: 'none'
                  }}
                  className={`flex flex-col gap-4 relative overflow-hidden ${isScanning ? 'ring-1 ring-emerald-500/30' : ''}`}
                >
                  {/* Scan indicator badge */}
                  {isScanning && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[9px] font-black text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        {language === 'es' ? 'Escaneando' : 'Scanning'}
                      </span>
                    </div>
                  )}

                  {/* Header: Resource Image + Name */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 bg-slate-900/60 flex items-center justify-center p-1 shrink-0"
                      style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                    >
                      {img ? (
                        <img 
                          src={img} 
                          alt={token} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-xs font-black text-slate-500">{token.slice(0, 3)}</div>
                      )}
                    </div>
                    <div className="min-w-0 pr-16">
                      <span className="text-[10px] uppercase font-black text-slate-400">
                        {token}
                      </span>
                      <h3 className="text-sm font-black text-white truncate mt-0.5">
                        {formatFactoryName(token, language)}
                      </h3>
                    </div>
                  </div>

                  {/* Details grid as badges */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.03] justify-start">
                    {Array.from({ length: maxLevel }, (_, index) => index + 1).map((level) => {
                      const cell = cache.cells[cellKey(token, level)];
                      const hasFactoryLevel = Boolean(rows.find((row) => row.token === token && row.level === level));
                      if (!hasFactoryLevel) return null;

                      if (!cell?.isComplete) {
                        return (
                          <div 
                            key={level}
                            className="resource-item-badge flex items-center gap-1 text-[10px] text-slate-500 font-mono"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '3px 8px' }}
                            title={language === 'es' ? 'Esperando datos de caché global' : 'Waiting for global cache data'}
                          >
                            <span className="opacity-70">L{level}:</span>
                            <strong>...</strong>
                          </div>
                        );
                      }

                      const tooltip = language === 'es'
                        ? `Valor de venta: ${formatNumber(cell.outputSellValue, 6)} COIN • Costo de ingredientes: ${formatNumber(cell.inputBuyCost, 6)} COIN • Impacto: ${formatNumber(cell.priceImpactPercentage, 2)}% • Actualizado: ${new Date(cell.updatedAt).toLocaleString()}`
                        : `Output sell value ${formatNumber(cell.outputSellValue, 6)} COIN • Input buy cost ${formatNumber(cell.inputBuyCost, 6)} COIN • Impact ${formatNumber(cell.priceImpactPercentage, 2)}% • Updated ${new Date(cell.updatedAt).toLocaleString()}`;

                      const isProfit = cell.returnPercent >= 0;
                      return (
                        <div 
                          key={level}
                          className="resource-item-badge flex items-center gap-1 text-[10px] font-mono transition-all"
                          style={{ 
                            backgroundColor: isProfit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: isProfit ? '#34d399' : '#f87171',
                            border: 'none', 
                            padding: '3px 8px' 
                          }}
                          title={tooltip}
                        >
                          <span className="opacity-70">L{level}:</span>
                          <strong>{isProfit ? '+' : ''}{formatNumber(cell.returnPercent, 2)}%</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
