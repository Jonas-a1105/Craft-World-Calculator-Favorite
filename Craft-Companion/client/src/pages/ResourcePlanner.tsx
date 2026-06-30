import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import Dropdown from '../components/Dropdown';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { getCraftworldHome } from '../services/api';
import { formatDurationFromMinutes, getDurationMinutesFromRunsPerHour } from '../services/durationFormat';
import { type FactoryBoost } from '../services/factoryBoostModifiers';
import { loadFactoryData, type FactoryDataRow } from '../services/factoryData';
import {
  buildRecipeTree,
  calculateProductionPerHour,
  calculateTimeUntilResources,
  flattenRecipeToBaseResources,
  type RecipeNode,
} from '../services/craftworldCalculations';
import { type WorkshopItem } from '../services/workshopModifiers';

type ResourceAmount = { symbol?: string; amount?: number };
type OwnedFactory = { id?: string; areaSymbol?: string; level?: number; landPlotName?: string; currentRunLevel?: number; activeBoosts?: FactoryBoost[] };
type HomeData = { factories?: OwnedFactory[]; inventory?: ResourceAmount[]; workshop?: WorkshopItem[]; lastSyncedAt?: string };

type PlannerResult = {
  selectedRow: FactoryDataRow | null;
  selectedToken: string;
  selectedLevel: number;
  targetAmount: number;
  ownedAmount: number;
  neededAmount: number;
  producer: OwnedFactory | null;
  producerRow: FactoryDataRow | null;
  outputPerHour: number;
  outputPerDay: number;
  etaMinutes: number;
  recipeTree: RecipeNode | null;
  baseResources: Record<string, number>;
};

function fmt(value: number, digits = 3) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function getFactoryImage(symbol?: string) {
  if (!symbol) return '';
  const cleanName = symbol.trim().toLowerCase();
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (capitalized === 'Earth') return '/assets/factories/Earth.png';
  return `/assets/factories/${capitalized}.gif`;
}

const RESOURCE_COLORS: Record<string, string> = {
  COIN: '#f59e0b', EARTH: '#a16207', WATER: '#3b82f6', FIRE: '#ef4444',
  MUD: '#713f12', CLAY: '#ea580c', SAND: '#fbbf24', COPPER: '#ea580c',
  SEAWATER: '#06b6d4', HEAT: '#f472b6', ALGAE: '#10b981', LAVA: '#f97316',
  STONE: '#6b7280', SULFUR: '#fbbf24', CERAMICS: '#cbd5e1', STEEL: '#94a3b8',
  OXYGEN: '#4ade80', GLASS: '#38bdf8', GAS: '#818cf8', STEAM: '#e2e8f0',
  SCREWS: '#94a3b8', FUEL: '#22c55e', CEMENT: '#4b5563', OIL: '#334155',
  ACID: '#a3e635', PLASTICS: '#60a5fa', FIBERGLASS: '#9ca3af', ENERGY: '#facc15',
  HYDROGEN: '#3b82f6', DYNAMITE: '#ef4444', BOLTS: '#cbd5e1',
  KEY: '#eab308', CERAMICKEY: '#f8fafc', GLASSKEY: '#38bdf8', DYNOKEY: '#f87171', BOOK: '#c084fc',
};

function getResourceImage(symbol?: string) {
  if (!symbol) return '';
  const cleanSymbol = symbol.trim().toLowerCase();
  const formattedSymbol = cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1);
  return `/assets/resources/${formattedSymbol}.png`;
}

function getResourceColor(token: string) {
  const t = token.toUpperCase().trim();
  if (t === 'WATER') return 'text-blue-400';
  if (t === 'SEAWATER') return 'text-sky-400';
  if (t === 'OXYGEN' || t === 'GAS' || t === 'AIR') return 'text-emerald-400';
  if (t === 'FUEL' || t === 'HEAT' || t === 'OIL') return 'text-orange-400';
  if (t === 'EARTH' || t === 'CLAY' || t === 'MUD' || t === 'SAND') return 'text-amber-500';
  if (t === 'COPPER' || t === 'STEEL' || t === 'SCREWS' || t === 'IRON') return 'text-slate-300';
  return 'text-amber-400';
}

function formatPlotName(plotName: string, lang: string): string {
  const normalized = String(plotName || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'EARTH_PLOT':
        return 'Parcela de Tierra';
      case 'BLUEPRINT_PLOT':
      case 'BLUEPRINT_PLOT_A':
        return 'Parcela de Planos A';
      case 'BLUEPRINT_PLOT_B':
        return 'Parcela de Planos B';
      case 'FLEXIBLE_PLOT':
        return 'Parcela Flexible';
      default:
        return String(plotName || '')
          .trim()
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
    }
  } else {
    switch (normalized) {
      case 'EARTH_PLOT':
        return 'Earth Plot';
      case 'BLUEPRINT_PLOT':
      case 'BLUEPRINT_PLOT_A':
        return 'Blueprint Plot A';
      case 'BLUEPRINT_PLOT_B':
        return 'Blueprint Plot B';
      case 'FLEXIBLE_PLOT':
        return 'Flexible Plot';
      default:
        return String(plotName || '')
          .trim()
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
    }
  }
}

function formatFactoryName(symbol: string, lang: string): string {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'STEEL': return 'Acero';
      case 'WOOD': return 'Madera';
      case 'FIRE': return 'Fuego';
      case 'WATER': return 'Agua';
      case 'EARTH': return 'Tierra';
      case 'AIR': return 'Aire';
      case 'GOLD': return 'Oro';
      case 'IRON': return 'Hierro';
      case 'STONE': return 'Piedra';
      case 'SILVER': return 'Plata';
      case 'COPPER': return 'Cobre';
      case 'BRONZE': return 'Bronce';
      default:
        return normalized.charAt(0) + normalized.slice(1).toLowerCase();
    }
  } else {
    switch (normalized) {
      case 'STEEL': return 'Steel';
      case 'WOOD': return 'Wood';
      case 'FIRE': return 'Fire';
      case 'WATER': return 'Water';
      case 'EARTH': return 'Earth';
      case 'AIR': return 'Air';
      case 'GOLD': return 'Gold';
      case 'IRON': return 'Iron';
      case 'STONE': return 'Stone';
      case 'SILVER': return 'Silver';
      case 'COPPER': return 'Copper';
      case 'BRONZE': return 'Bronze';
      default:
        return normalized.charAt(0) + normalized.slice(1).toLowerCase();
    }
  }
}

function inventoryMap(items: ResourceAmount[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const symbol = String(item.symbol || '').trim().toUpperCase();
    const amount = Number(item.amount || 0);
    if (symbol) acc[symbol] = (acc[symbol] || 0) + (Number.isFinite(amount) ? amount : 0);
    return acc;
  }, {});
}

function getDisplayLevel(factory: OwnedFactory) {
  return typeof factory.currentRunLevel === 'number'
    ? factory.currentRunLevel + 1
    : typeof factory.level === 'number'
      ? factory.level + 1
      : 0;
}

function getBestOwnedProducer(factories: OwnedFactory[], rows: FactoryDataRow[], outputToken: string) {
  const token = outputToken.trim().toUpperCase();
  const matches = factories
    .map((factory) => {
      const symbol = String(factory.areaSymbol || '').trim().toUpperCase();
      const level = getDisplayLevel(factory);
      const row = rows.find((item) => item.token === symbol && item.level === level && item.output_token === token) || null;
      return row ? { factory, row } : null;
    })
    .filter((value): value is { factory: OwnedFactory; row: FactoryDataRow } => Boolean(value));

  return matches.sort((a, b) => b.row.output_amount - a.row.output_amount || b.row.level - a.row.level)[0] || null;
}

function getOutputPerHour(row: FactoryDataRow | null, factory: OwnedFactory | null, workshop: WorkshopItem[]) {
  if (!row || !factory) return 0;
  return calculateProductionPerHour(row, { workshop, activeBoosts: factory.activeBoosts || [] });
}

function uniqueTokens(rows: FactoryDataRow[]) {
  return Array.from(new Set(rows.map((row) => row.output_token).filter(Boolean))).sort();
}

function levelsForToken(rows: FactoryDataRow[], token: string) {
  return rows
    .filter((row) => row.output_token === token)
    .map((row) => row.level)
    .filter((level, index, levels) => levels.indexOf(level) === index)
    .sort((a, b) => a - b);
}

function buildPlannerResult(
  rows: FactoryDataRow[],
  home: HomeData | null,
  selectedToken: string,
  selectedLevel: number,
  amountInput: string,
): PlannerResult {
  const targetAmount = Math.max(Number(amountInput || 0), 0);
  const inventory = inventoryMap(home?.inventory || []);
  const ownedAmount = inventory[selectedToken] || 0;
  const neededAmount = Math.max(targetAmount - ownedAmount, 0);
  const selectedRow = rows.find((row) => row.output_token === selectedToken && row.level === selectedLevel) || null;
  const producerMatch = getBestOwnedProducer(home?.factories || [], rows, selectedToken);
  const outputPerHour = getOutputPerHour(producerMatch?.row || null, producerMatch?.factory || null, home?.workshop || []);
  const eta = calculateTimeUntilResources(targetAmount, ownedAmount, outputPerHour);
  const recipeTree = selectedRow ? buildRecipeTree(rows, selectedToken, 1, selectedLevel) : null;
  const baseResources = recipeTree ? flattenRecipeToBaseResources(recipeTree) : {};

  return {
    selectedRow,
    selectedToken,
    selectedLevel,
    targetAmount,
    ownedAmount,
    neededAmount,
    producer: producerMatch?.factory || null,
    producerRow: producerMatch?.row || null,
    outputPerHour,
    outputPerDay: outputPerHour * 24,
    etaMinutes: Number.isFinite(eta.hours) ? eta.hours * 60 : Number.POSITIVE_INFINITY,
    recipeTree,
    baseResources,
  };
}

function RecipeTreeView({ node }: { node: RecipeNode }) {
  const { language } = useTranslation();
  const img = getResourceImage(node.token);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {img && <img src={img} alt={node.token} className="h-4 w-4 object-contain" />}
        <span>
          {fmt(node.amount)} {formatFactoryName(node.token, language)}
          {node.circular ? ' (circular recipe protected)' : ''}
          {node.missingRecipe ? ' (base or missing recipe)' : ''}
        </span>
      </div>
      {node.children.length > 0 && (
        <div className="ml-4 border-l border-slate-800 pl-3">
          {node.children.map((child, index) => (
            <RecipeTreeView key={`${child.token}-${index}`} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcePlanner() {
  const { t, language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [home, setHome] = useState<HomeData | null>(null);
  const [selectedToken, setSelectedToken] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [amountInput, setAmountInput] = useState('100');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [factoryRows, homeData] = await Promise.all([loadFactoryData(), getCraftworldHome()]);
      setRows(factoryRows);
      setHome(homeData || {});
      const tokens = uniqueTokens(factoryRows);
      setSelectedToken((current) => current || tokens[0] || '');
    } catch {
      setError('Unable to load resource planner data. Refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tokens = useMemo(() => uniqueTokens(rows), [rows]);
  const availableLevels = useMemo(() => levelsForToken(rows, selectedToken), [rows, selectedToken]);

  const resourceOptions = useMemo(() => {
    return tokens.map((token) => ({
      value: token,
      label: formatFactoryName(token, language),
      image: getResourceImage(token),
    }));
  }, [tokens, language]);

  const levelOptions = useMemo(() => {
    return availableLevels.map((lvl) => ({
      value: lvl,
      label: `Level ${lvl}`,
    }));
  }, [availableLevels]);

  useEffect(() => {
    if (!availableLevels.length) return;
    if (!availableLevels.includes(selectedLevel)) setSelectedLevel(availableLevels[0]);
  }, [availableLevels, selectedLevel]);

  const result = useMemo(
    () => buildPlannerResult(rows, home, selectedToken, selectedLevel, amountInput),
    [amountInput, home, rows, selectedLevel, selectedToken],
  );

  const runtimeText = result.producerRow && result.outputPerHour > 0
    ? formatDurationFromMinutes(getDurationMinutesFromRunsPerHour(result.outputPerHour / result.producerRow.output_amount))
    : 'Not producing';
  const lastSynced = home?.lastSyncedAt ? new Date(home.lastSyncedAt).toLocaleString() : 'Not connected';

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="max-w-[720px] mx-auto w-full relative z-30">
          <Card title="Resource Planner" style={{ overflow: 'visible' }}>
            <div className="space-y-4">
              <div className="space-y-1 text-sm text-slate-300">
                <p>{t("Choose the resource, choose the factory level, then type the amount you want.")}</p>
                <p className="text-slate-400">{t("Last synced")}: {lastSynced}</p>
                {error && <p className="text-red-300">{error}</p>}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-sm text-slate-300">{language === 'es' ? 'Recurso' : 'Resource'}</span>
                  <Dropdown
                    value={selectedToken}
                    onChange={(val) => setSelectedToken(String(val))}
                    options={resourceOptions}
                    searchable={true}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-slate-300">{language === 'es' ? 'Nivel de Fábrica' : 'Factory Level'}</span>
                  <Dropdown
                    value={selectedLevel}
                    onChange={(val) => setSelectedLevel(Number(val))}
                    options={levelOptions}
                    searchable={false}
                  />
                </div>

                <label className="space-y-1 text-sm flex flex-col justify-end">
                  <span className="text-slate-300">{t("Amount Wanted")}</span>
                  <input
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    inputMode="decimal"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-slate-500"
                    placeholder="100"
                  />
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Card title="Want">
            <div className="py-2 px-1">
              <div 
                className="resource-item-badge flex items-center justify-between text-xs text-white"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-resource-item)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getResourceImage(result.selectedToken) && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 p-1.5 shrink-0">
                      <img src={getResourceImage(result.selectedToken)} alt={result.selectedToken} className="h-5 w-5 object-contain" />
                    </div>
                  )}
                  <span className="font-bold text-slate-300 uppercase tracking-wider truncate">
                    {formatFactoryName(result.selectedToken, language)}
                  </span>
                </div>
                <span 
                  className="font-extrabold shrink-0 pl-2 text-sm tabular-nums"
                  style={{ color: RESOURCE_COLORS[result.selectedToken.toUpperCase()] || '#94a3b8' }}
                >
                  {fmt(result.targetAmount)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Own">
            <div className="py-2 px-1">
              <div 
                className="resource-item-badge flex items-center justify-between text-xs text-white"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-resource-item)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getResourceImage(result.selectedToken) && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 p-1.5 shrink-0">
                      <img src={getResourceImage(result.selectedToken)} alt={result.selectedToken} className="h-5 w-5 object-contain" />
                    </div>
                  )}
                  <span className="font-bold text-slate-300 uppercase tracking-wider truncate">
                    {formatFactoryName(result.selectedToken, language)}
                  </span>
                </div>
                <span 
                  className="font-extrabold shrink-0 pl-2 text-sm tabular-nums"
                  style={{ color: RESOURCE_COLORS[result.selectedToken.toUpperCase()] || '#94a3b8' }}
                >
                  {fmt(result.ownedAmount)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Still Need">
            <div className="py-2 px-1">
              <div 
                className="resource-item-badge flex items-center justify-between text-xs text-white"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-resource-item)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getResourceImage(result.selectedToken) && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 p-1.5 shrink-0">
                      <img src={getResourceImage(result.selectedToken)} alt={result.selectedToken} className="h-5 w-5 object-contain" />
                    </div>
                  )}
                  <span className="font-bold text-slate-300 uppercase tracking-wider truncate">
                    {formatFactoryName(result.selectedToken, language)}
                  </span>
                </div>
                <span 
                  className="font-extrabold shrink-0 pl-2 text-sm tabular-nums"
                  style={{ color: RESOURCE_COLORS[result.selectedToken.toUpperCase()] || '#94a3b8' }}
                >
                  {fmt(result.neededAmount)}
                </span>
              </div>
            </div>
          </Card>

          <Card title="ETA">
            <div className="py-2 px-1">
              <div 
                className="resource-item-badge flex items-center justify-between text-xs text-white"
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-resource-item)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/40 p-1.5 shrink-0">
                    <span className="text-sm">⏳</span>
                  </div>
                  <span className="font-bold text-slate-300 uppercase tracking-wider truncate">
                    ETA
                  </span>
                </div>
                <span className="font-extrabold shrink-0 pl-2 text-sm text-cyan-400">
                  {result.neededAmount <= 0 ? t('Ready now') : result.outputPerHour > 0 ? formatDurationFromMinutes(result.etaMinutes) : t('No producer')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card title="Production Source">
            {result.producer && result.producerRow ? (() => {
              const producerRow = result.producerRow;
              return (
                <div 
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    border: 'none'
                  }}
                  className="flex flex-col gap-4 w-full"
                >
                  {/* Header: Title + Image */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0"
                      style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                    >
                      {getFactoryImage(producerRow.token) ? (
                        <img 
                          src={getFactoryImage(producerRow.token)} 
                          alt={producerRow.token} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/assets/resources/${producerRow.token.charAt(0).toUpperCase() + producerRow.token.slice(1).toLowerCase()}.png`;
                          }}
                        />
                      ) : (
                        <div className="text-xs font-black text-slate-500">{producerRow.token.slice(0, 3)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-black text-orange-400">
                          {formatFactoryName(producerRow.token, language)}
                        </span>
                        <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-300 font-bold">
                          {language === 'es' ? `Nivel de producción: ${producerRow.level}` : `Production Level: ${producerRow.level}`}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white mt-1">
                        {formatPlotName(result.producer.landPlotName || (language === 'es' ? 'Parcela desconocida' : 'Unknown plot'), language)}
                      </h3>
                    </div>
                  </div>

                  {/* Badges container */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03]">
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo de Ciclo:' : 'Cycle Runtime:'}</span>
                      <strong className="text-slate-200">{runtimeText}</strong>
                    </div>

                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Producción / Hora:' : 'Output / Hour:'}</span>
                      <strong className="text-emerald-400">{fmt(result.outputPerHour)}</strong>
                      {getResourceImage(result.selectedToken) && <img src={getResourceImage(result.selectedToken)} alt={result.selectedToken} className="h-4 w-4 object-contain shrink-0" />}
                      <span className="text-slate-300 font-semibold">{formatFactoryName(result.selectedToken, language)}</span>
                    </div>

                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Producción / Día:' : 'Output / Day:'}</span>
                      <strong className="text-emerald-400">{fmt(result.outputPerDay)}</strong>
                      {getResourceImage(result.selectedToken) && <img src={getResourceImage(result.selectedToken)} alt={result.selectedToken} className="h-4 w-4 object-contain shrink-0" />}
                      <span className="text-slate-300 font-semibold">{formatFactoryName(result.selectedToken, language)}</span>
                    </div>
                  </div>

                </div>
              );
            })() : (
              <p className="text-sm text-slate-400">
                {language === 'es' 
                  ? `Actualmente no tienes ninguna fábrica que produzca ${formatFactoryName(result.selectedToken, language)}.`
                  : `You do not currently have a matched factory producing ${formatFactoryName(result.selectedToken, language)}.`}
              </p>
            )}
          </Card>

          <Card title="Recipe Tree / Base Resources">
            {result.selectedRow ? (() => {
              const selectedRow = result.selectedRow;
              return (
                <div 
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    border: 'none'
                  }}
                  className="flex flex-col gap-4 w-full"
                >
                  {/* Header: Title + Image */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 bg-slate-900/60 flex items-center justify-center p-1 shrink-0"
                      style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                    >
                      {getFactoryImage(selectedRow.token) ? (
                        <img 
                          src={getFactoryImage(selectedRow.token)} 
                          alt={selectedRow.token} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/assets/resources/${selectedRow.token.charAt(0).toUpperCase() + selectedRow.token.slice(1).toLowerCase()}.png`;
                          }}
                        />
                      ) : (
                        <div className="text-xs font-black text-slate-500">{selectedRow.token.slice(0, 3)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-black text-orange-400">
                          {formatFactoryName(selectedRow.token, language)}
                        </span>
                        <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-300 font-bold">
                          {language === 'es' ? `Nivel ${selectedRow.level}` : `Level ${selectedRow.level}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span>{language === 'es' ? 'Salida:' : 'Output:'}</span>
                        <strong className="text-white">{fmt(selectedRow.output_amount)}</strong>
                        {getResourceImage(selectedRow.output_token) && (
                          <img src={getResourceImage(selectedRow.output_token)} alt={selectedRow.output_token} className="h-4 w-4 object-contain inline-block shrink-0" />
                        )}
                        <strong className="text-white">{formatFactoryName(selectedRow.output_token, language)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Recipe details badges */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03]">
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ejecución Base:' : 'Base Runtime:'}</span>
                      <strong className="text-slate-200">{formatDurationFromMinutes(selectedRow.duration_min)}</strong>
                    </div>

                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ingrediente 1:' : 'Input 1:'}</span>
                      <strong className="text-slate-200">{fmt(selectedRow.input_amount_1)}</strong>
                      {getResourceImage(selectedRow.input_token_1) && <img src={getResourceImage(selectedRow.input_token_1)} alt={selectedRow.input_token_1} className="h-4 w-4 object-contain shrink-0" />}
                      <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.input_token_1, language)}</span>
                    </div>

                    {selectedRow.input_token_2 && selectedRow.input_amount_2 > 0 && (
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ingrediente 2:' : 'Input 2:'}</span>
                        <strong className="text-slate-200">{fmt(selectedRow.input_amount_2)}</strong>
                        {getResourceImage(selectedRow.input_token_2) && <img src={getResourceImage(selectedRow.input_token_2)} alt={selectedRow.input_token_2} className="h-4 w-4 object-contain shrink-0" />}
                        <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.input_token_2, language)}</span>
                      </div>
                    )}

                    {selectedRow.upgrade_token && (
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Próxima Mejora:' : 'Next Upgrade:'}</span>
                        <strong className="text-slate-200">{fmt(selectedRow.upgrade_amount)}</strong>
                        {getResourceImage(selectedRow.upgrade_token) && <img src={getResourceImage(selectedRow.upgrade_token)} alt={selectedRow.upgrade_token} className="h-4 w-4 object-contain shrink-0" />}
                        <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.upgrade_token, language)}</span>
                      </div>
                    )}
                  </div>

                  {result.recipeTree && (
                    <div 
                      className="p-3"
                      style={{
                        backgroundColor: 'var(--bg-resource-item)',
                        borderRadius: 'var(--radius-resource-item)',
                      }}
                    >
                      <RecipeTreeView node={result.recipeTree} />
                    </div>
                  )}

                  <div className="border-t border-white/[0.03] pt-3">
                    <p className="font-semibold text-slate-200 mb-2">{t("Base resources for 1 unit")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.baseResources).map(([token, amount]) => {
                        const img = getResourceImage(token);
                        return (
                          <div 
                            key={token} 
                            className="resource-item-badge flex items-center justify-between text-xs text-white"
                            style={{
                              padding: '8px 16px',
                              borderRadius: 'var(--radius-resource-item)',
                              border: 'none',
                              backgroundColor: 'var(--bg-resource-item)'
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {img && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-955/40 p-1.5 shrink-0">
                                  <img src={img} alt={token} className="h-5 w-5 object-contain" />
                                </div>
                              )}
                              <span className="font-bold text-slate-300 uppercase tracking-wider truncate">
                                {formatFactoryName(token, language)}
                              </span>
                            </div>
                            <span className={`font-extrabold shrink-0 pl-2 ${getResourceColor(token)}`}>
                              {fmt(amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })() : (
              <p className="text-sm text-slate-400">No recipe row found for that dropdown selection.</p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
