import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import {
  calculateFactoryCycle,
  FactoryCycleResult,
  buildRecipeTree,
  flattenRecipeToBaseResources,
} from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import {
  applyMasteryInputReduction,
  getMasteryInputReductionPercent,
} from '../services/masteryModifiers';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function Profitability() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'owned' | 'profitable' | 'loss'>('all');
  const [sortBy, setSortBy] = useState<
    'profit_hour' | 'profit_day' | 'xp_hour' | 'margin' | 'alphabetical'
  >('profit_hour');
  const [selectedTokenModal, setSelectedTokenModal] = useState<string | null>(null);
  const [modalLevelFilter, setModalLevelFilter] = useState<'all' | 'owned' | 'profitable' | 'loss'>(
    'all',
  );

  // Live Boost & Input Mode Toggles
  const [useWorkshop, setUseWorkshop] = useState(true);
  const [useMastery, setUseMastery] = useState(true);
  const [useBoosters, setUseBoosters] = useState(true);
  const [inputSupplyMode, setInputSupplyMode] = useState<'market' | 'self_crafted'>('market');

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        setHomeData(home);

        // Base raw material market price fallback: 0.00394 COIN per EARTH/WATER/FIRE (matching in-game Exchange rate)
        const map: Record<string, number> = {
          COIN: 1,
          EARTH: 0.00394,
          WATER: 0.00394,
          FIRE: 0.00394,
        };
        if (home?.priceList?.prices) {
          home.priceList.prices.forEach((p: any) => {
            if (typeof p.amount === 'number' && p.amount > 0) {
              map[p.referenceSymbol?.toUpperCase()] = p.amount;
            }
          });
        }
        setPrices(map);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  // Extract owned factories from land plots (symbol -> max 1-indexed level)
  const ownedMap = new Map<string, number>();
  const landPlots = homeData?.craftWorld?.landPlots || [];
  landPlots.forEach((plot: any) => {
    (plot.areas || []).forEach((area: any) => {
      (area.factories || []).forEach((facObj: any) => {
        const symbol = (facObj?.factory?.definition?.id || '').toUpperCase();
        const rawLevel = typeof facObj?.factory?.level === 'number' ? facObj.factory.level : 0;
        const displayLevel = rawLevel + 1;
        if (symbol) {
          const current = ownedMap.get(symbol) || 0;
          if (displayLevel > current) ownedMap.set(symbol, displayLevel);
        }
      });
    });
  });

  // Construct active context based on live toggles
  const context = {
    workshop: useWorkshop ? homeData?.craft?.workshop || [] : [],
    proficiencies: useMastery ? homeData?.craft?.proficiencies || [] : [],
    activeBoosts: useBoosters ? [{ boostValue: 0.5 }] : [],
  };

  // Helper to adjust cycle calculations for self-crafted inputs mode
  const getAdjustedCycle = (
    row: FactoryDataRow,
  ): FactoryCycleResult & {
    effectiveInputCost: number;
    effectiveProfitPerCycle: number;
    effectiveProfitPerHour: number;
    effectiveProfitPerDay: number;
    rawBaseMaterialsText?: string;
  } => {
    const baseCycle = calculateFactoryCycle(row, prices, context);

    if (inputSupplyMode === 'self_crafted') {
      // Decompose recipe tree all the way down to EARTH, WATER, FIRE
      const tree = buildRecipeTree(rows, row.token, 1, row.level);
      const baseReqs = flattenRecipeToBaseResources(tree, {});

      const parentMasteryRed = useMastery
        ? getMasteryInputReductionPercent(row.token, context.proficiencies || [])
        : 0;

      let rawCostPerOutput = 0;
      const rawTextParts: string[] = [];
      Object.entries(baseReqs).forEach(([tok, amt]) => {
        if (tok !== row.token) {
          // Apply raw material mastery reduction if enabled
          const adjustedAmt = useMastery
            ? applyMasteryInputReduction(amt, tok, context.proficiencies || [])
            : amt;
          // Apply parent factory's mastery input reduction
          const finalAmtPerUnit = adjustedAmt * (1 - parentMasteryRed / 100);

          const p = typeof prices[tok] === 'number' && prices[tok] > 0 ? prices[tok] : 0.00394;
          rawCostPerOutput += finalAmtPerUnit * p;
          rawTextParts.push(`${tok} (${formatNumber(finalAmtPerUnit * baseCycle.outputPerCycle, 1)})`);
        }
      });

      const effectiveInputCost = rawCostPerOutput * baseCycle.outputPerCycle;
      const effectiveProfitPerCycle = baseCycle.revenuePerCycle - effectiveInputCost;
      const effectiveProfitPerHour = effectiveProfitPerCycle * baseCycle.runsPerHour;
      const effectiveProfitPerDay = effectiveProfitPerCycle * baseCycle.runsPerDay;

      return {
        ...baseCycle,
        effectiveInputCost,
        effectiveProfitPerCycle,
        effectiveProfitPerHour,
        effectiveProfitPerDay,
        rawBaseMaterialsText: rawTextParts.join(', '),
      };
    }

    return {
      ...baseCycle,
      effectiveInputCost: baseCycle.inputCostPerCycle,
      effectiveProfitPerCycle: baseCycle.profitPerCycle,
      effectiveProfitPerHour: baseCycle.profitPerHour,
      effectiveProfitPerDay: baseCycle.profitPerDay,
    };
  };

  // Group factory rows by unique factory token
  const uniqueTokens = Array.from(new Set(rows.map((r) => r.token)));

  // Build summary data for each factory token (using owned level or level 1)
  const factorySummaries = uniqueTokens.map((token) => {
    const tokenRows = rows.filter((r) => r.token === token).sort((a, b) => a.level - b.level);
    const ownedLevel = ownedMap.get(token.toUpperCase());
    const targetLevel = ownedLevel || 1;
    const activeRow = tokenRows.find((r) => r.level === targetLevel) || tokenRows[0];
    const cycle = getAdjustedCycle(activeRow);

    return {
      token,
      ownedLevel: ownedLevel || null,
      activeRow,
      cycle,
      allRows: tokenRows,
    };
  });

  // Filter summaries
  const filteredSummaries = factorySummaries.filter((s) => {
    const matchesSearch =
      s.token.toLowerCase().includes(search.toLowerCase()) ||
      s.activeRow.output_token.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'owned') return s.ownedLevel !== null;
    if (filterMode === 'profitable') return s.cycle.effectiveProfitPerDay > 0;
    if (filterMode === 'loss') return s.cycle.effectiveProfitPerDay < 0;
    return true;
  });

  // Sort summaries according to selected sort option
  filteredSummaries.sort((a, b) => {
    if (sortBy === 'profit_hour')
      return b.cycle.effectiveProfitPerHour - a.cycle.effectiveProfitPerHour;
    if (sortBy === 'profit_day')
      return b.cycle.effectiveProfitPerDay - a.cycle.effectiveProfitPerDay;
    if (sortBy === 'xp_hour') return b.cycle.xpPerHour - a.cycle.xpPerHour;
    if (sortBy === 'margin') return (b.cycle.marginPercent || 0) - (a.cycle.marginPercent || 0);
    if (sortBy === 'alphabetical') return a.token.localeCompare(b.token);
    return 0;
  });

  // Selected factory for modal view
  const modalSummary = factorySummaries.find((s) => s.token === selectedTokenModal);
  let modalCycleResults = modalSummary ? modalSummary.allRows.map((r) => getAdjustedCycle(r)) : [];

  if (modalSummary && modalLevelFilter !== 'all') {
    modalCycleResults = modalCycleResults.filter((c) => {
      if (modalLevelFilter === 'owned') return c.row.level === modalSummary.ownedLevel;
      if (modalLevelFilter === 'profitable') return c.effectiveProfitPerDay > 0;
      if (modalLevelFilter === 'loss') return c.effectiveProfitPerDay < 0;
      return true;
    });
  }

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es'
              ? 'Centro de Rentabilidad por Fábrica'
              : 'Factory Profitability Center'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Explora cada fábrica en tarjetas. Haz clic en cualquiera para desplegar su rentabilidad nivel por nivel (1 al 40).'
              : 'Explore each factory type. Click any card to inspect full level-by-level profitability (Levels 1 to 40).'}
          </p>
        </div>

        {/* Live Boost & Input Supply Mode Controls Ribbon */}
        <Card
          title={
            language === 'es'
              ? '🎛️ Modificadores & Modo de Abastecimiento'
              : '🎛️ Modifiers & Supply Mode'
          }
        >
          <div className="space-y-4">
            {/* Input Supply Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="font-extrabold text-white text-xs">
                {language === 'es'
                  ? '📦 Origen de Insumos para el Cálculo:'
                  : '📦 Input Origin for Calculation:'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setInputSupplyMode('market')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    inputSupplyMode === 'market'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  🛒 {language === 'es' ? 'Comprados en Mercado (Bolsa)' : 'Bought on Market'}
                </button>

                <button
                  onClick={() => setInputSupplyMode('self_crafted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    inputSupplyMode === 'self_crafted'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  ⛏️{' '}
                  {language === 'es'
                    ? 'Auto-Producidos (Tierra/Agua/Fuego)'
                    : 'Self-Crafted (Raw Earth/Water/Fire)'}
                </button>
              </div>
            </div>

            {/* Account Modifiers */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition">
                  <input
                    type="checkbox"
                    checked={useWorkshop}
                    onChange={(e) => setUseWorkshop(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="font-extrabold text-white">
                    ⚡ {language === 'es' ? 'Velocidad de Taller' : 'Workshop Speed'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition">
                  <input
                    type="checkbox"
                    checked={useMastery}
                    onChange={(e) => setUseMastery(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="font-extrabold text-white">
                    🎓 {language === 'es' ? 'Descuento de Maestría' : 'Mastery Reduction'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition">
                  <input
                    type="checkbox"
                    checked={useBoosters}
                    onChange={(e) => setUseBoosters(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span className="font-extrabold text-white">
                    🚀 {language === 'es' ? 'Boosters & Anuncios x2' : 'Boosters & Ad Boost'}
                  </span>
                </label>
              </div>

              <div className="text-slate-400 font-bold text-[11px]">
                {useWorkshop && useMastery && useBoosters ? (
                  <span className="text-emerald-400 font-black">
                    ✓{' '}
                    {language === 'es'
                      ? 'Modo: Con Boosts de Cuenta'
                      : 'Mode: Full Account Boosted'}
                  </span>
                ) : (
                  <span className="text-amber-400 font-black">
                    ⚙️{' '}
                    {language === 'es'
                      ? 'Modo: Máquina Base / Personalizado'
                      : 'Mode: Base Machine / Custom'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Filter & Sort Controls */}
        <Card>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: 'all',
                  label:
                    language === 'es'
                      ? `Todas (${uniqueTokens.length})`
                      : `All (${uniqueTokens.length})`,
                },
                {
                  id: 'owned',
                  label:
                    language === 'es'
                      ? `Mis Fábricas (${ownedMap.size})`
                      : `My Owned (${ownedMap.size})`,
                },
                { id: 'profitable', label: language === 'es' ? 'En Ganancia' : 'Profitable' },
                { id: 'loss', label: language === 'es' ? 'En Pérdida ⚠️' : 'In Loss ⚠️' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterMode(t.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                    filterMode === t.id
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort Selector & Search */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-800 cursor-pointer"
              >
                <option value="profit_hour">
                  💰 {language === 'es' ? 'Ordenar: Ganancia / Hora' : 'Sort: Profit / Hour'}
                </option>
                <option value="profit_day">
                  💎 {language === 'es' ? 'Ordenar: Ganancia / Día' : 'Sort: Profit / Day'}
                </option>
                <option value="xp_hour">
                  ⭐ {language === 'es' ? 'Ordenar: XP / Hora' : 'Sort: XP / Hour'}
                </option>
                <option value="margin">
                  📊 {language === 'es' ? 'Ordenar: Margen %' : 'Sort: Margin %'}
                </option>
                <option value="alphabetical">
                  🔤 {language === 'es' ? 'Ordenar: Alfabético' : 'Sort: A-Z'}
                </option>
              </select>

              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar fábrica...' : 'Search factory...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-48"
              />
            </div>
          </div>
        </Card>

        {/* Factory Grid (Native App Cards) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSummaries.map((s) => {
            const isOwned = s.ownedLevel !== null;
            const isLoss = s.cycle.effectiveProfitPerDay < 0;

            return (
              <div
                key={s.token}
                onClick={() => {
                  setSelectedTokenModal(s.token);
                  setModalLevelFilter('all');
                }}
                className="cursor-pointer transition-all hover:scale-[1.015]"
              >
                <Card>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FactoryIcon symbol={s.token} size={36} />
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-wide">
                            {s.token}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {isOwned
                              ? `Nv. ${s.ownedLevel} (${language === 'es' ? 'Poseída' : 'Owned'})`
                              : `Nv. 1 (${language === 'es' ? 'Base' : 'Base'})`}
                          </span>
                        </div>
                      </div>

                      {isOwned ? (
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-black border border-emerald-700/60">
                          ✓ {language === 'es' ? 'EN PROPIEDAD' : 'OWNED'}
                        </span>
                      ) : (
                        <span className="bg-slate-900 text-slate-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-slate-800">
                          Nv. 1
                        </span>
                      )}
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`p-2.5 rounded-xl border text-center transition ${isLoss ? 'bg-rose-950/70 border-rose-700/80 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}
                      >
                        <span className="text-[10px] uppercase font-black block opacity-80">
                          {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                        </span>
                        <span className="text-sm font-black tracking-wide block mt-0.5">
                          {s.cycle.effectiveProfitPerHour > 0 ? '+' : ''}
                          {formatNumber(s.cycle.effectiveProfitPerHour)} COIN
                        </span>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border text-center transition ${isLoss ? 'bg-rose-950/70 border-rose-700/80 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'}`}
                      >
                        <span className="text-[10px] uppercase font-black block opacity-80">
                          {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                        </span>
                        <span className="text-sm font-black tracking-wide block mt-0.5">
                          {s.cycle.effectiveProfitPerDay > 0 ? '+' : ''}
                          {formatNumber(s.cycle.effectiveProfitPerDay)} COIN
                        </span>
                      </div>
                    </div>

                    {/* Additional Metrics (XP & Battery) */}
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-300 font-bold border-t border-slate-800/80 pt-2">
                      <span className="flex items-center gap-1 text-amber-300">
                        ⭐ {formatNumber(s.cycle.xpPerHour, 0)} XP/h
                      </span>

                      {s.cycle.powerCostPerCycle > 0 && (
                        <span className="flex items-center gap-1 text-cyan-300">
                          ⚡ {s.cycle.powerCostPerCycle} Bat/ciclo
                        </span>
                      )}
                    </div>

                    {/* Footer Button */}
                    <div className="pt-1">
                      <button className="retroBtn w-full text-xs py-1.5 flex items-center justify-center gap-2">
                        🔍 {language === 'es' ? 'Ver los 40 Niveles' : 'Inspect Levels 1-40'}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* FULLSCREEN REACT PORTAL MODAL (LEVELS 1 TO 40) */}
        {modalSummary &&
          createPortal(
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-5xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
                {/* Modal Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <FactoryIcon symbol={modalSummary.token} size={48} />
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        {modalSummary.token}
                        {modalSummary.ownedLevel && (
                          <span className="bg-emerald-950 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-700/60">
                            {language === 'es'
                              ? `Posees Nivel ${modalSummary.ownedLevel}`
                              : `Owned Level ${modalSummary.ownedLevel}`}
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {language === 'es'
                          ? 'Desglose financiero completo nivel por nivel (1 al 40).'
                          : 'Complete level-by-level financial breakdown (Levels 1 to 40).'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTokenModal(null)}
                    className="retroBtn text-xs px-4 py-2 shrink-0 self-end sm:self-auto"
                  >
                    ✕ {language === 'es' ? 'Cerrar' : 'Close'}
                  </button>
                </div>

                {/* Input Mode Indicator in Modal */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">
                    {inputSupplyMode === 'self_crafted'
                      ? language === 'es'
                        ? '⛏️ Modo Activo: Insumos Auto-Producidos (Tierra, Agua, Fuego)'
                        : '⛏️ Active Mode: Self-Crafted (Raw Earth/Water/Fire)'
                      : language === 'es'
                        ? '🛒 Modo Activo: Insumos Comprados en Mercado (Bolsa)'
                        : '🛒 Active Mode: Bought on Market'}
                  </span>
                  <span className="text-emerald-400 font-black text-[11px]">
                    {modalCycleResults.length}{' '}
                    {language === 'es' ? 'niveles analizados' : 'levels analyzed'}
                  </span>
                </div>

                {/* Modal Level Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-2.5">{language === 'es' ? 'Nivel' : 'Level'}</th>
                        <th className="p-2.5">{language === 'es' ? 'Estado' : 'Status'}</th>
                        <th className="p-2.5">{language === 'es' ? 'Tiempo' : 'Runtime'}</th>
                        <th className="p-2.5">
                          {language === 'es' ? 'Insumos (Costo)' : 'Inputs (Cost)'}
                        </th>
                        <th className="p-2.5">
                          {language === 'es' ? 'Output (Venta)' : 'Output (Revenue)'}
                        </th>
                        <th className="p-2.5">
                          {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                        </th>
                        <th className="p-2.5">
                          {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                        </th>
                        <th className="p-2.5">XP / h</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {modalCycleResults.map((c) => {
                        const isOwnedLevel = modalSummary.ownedLevel === c.row.level;
                        const isLoss = c.effectiveProfitPerDay < 0;

                        return (
                          <tr
                            key={c.row.level}
                            className={`transition ${
                              isOwnedLevel
                                ? 'bg-emerald-950/50 font-bold border-l-4 border-l-emerald-400'
                                : isLoss
                                  ? 'bg-rose-950/20 hover:bg-rose-900/30'
                                  : 'bg-emerald-950/10 hover:bg-emerald-900/20'
                            }`}
                          >
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="font-extrabold text-white">Nv. {c.row.level}</span>
                              {isOwnedLevel && (
                                <span className="ml-1 text-[9px] bg-emerald-900 text-emerald-200 px-1.5 py-0.5 rounded font-black">
                                  ★ {language === 'es' ? 'TU NIVEL' : 'YOU'}
                                </span>
                              )}
                            </td>

                            <td className="p-2.5 whitespace-nowrap">
                              {isLoss ? (
                                <span className="bg-rose-950/60 text-rose-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-rose-800/60">
                                  ⚠️ {language === 'es' ? 'PÉRDIDA' : 'LOSS'}
                                </span>
                              ) : (
                                <span className="bg-emerald-950/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-extrabold border border-emerald-800/60">
                                  ✓ {language === 'es' ? 'GANANCIA' : 'PROFIT'}
                                </span>
                              )}
                            </td>

                            <td className="p-2.5 text-slate-300 whitespace-nowrap">
                              {c.runtimeMinutes} min
                            </td>

                            <td className="p-2.5 text-rose-300 font-bold whitespace-nowrap">
                              -{formatNumber(c.effectiveInputCost)} COIN
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {inputSupplyMode === 'self_crafted' && c.rawBaseMaterialsText
                                  ? c.rawBaseMaterialsText
                                  : `${c.row.input_token_1} (${formatNumber(c.input1PerCycle, 1)})${c.row.input_token_2 ? ` + ${c.row.input_token_2} (${formatNumber(c.input2PerCycle, 1)})` : ''}`}
                              </span>
                            </td>

                            <td className="p-2.5 text-amber-300 font-bold whitespace-nowrap">
                              +{formatNumber(c.revenuePerCycle)} COIN
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {c.row.output_token} ({formatNumber(c.outputPerCycle, 1)})
                              </span>
                            </td>

                            <td className="p-2.5 font-extrabold whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${isLoss ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'}`}
                              >
                                {c.effectiveProfitPerHour > 0 ? '+' : ''}
                                {formatNumber(c.effectiveProfitPerHour)} COIN
                              </span>
                            </td>

                            <td className="p-2.5 font-black whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${isLoss ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'}`}
                              >
                                {c.effectiveProfitPerDay > 0 ? '+' : ''}
                                {formatNumber(c.effectiveProfitPerDay)} COIN
                              </span>
                            </td>

                            <td className="p-2.5 text-amber-300 font-bold whitespace-nowrap">
                              ⭐ {formatNumber(c.xpPerHour, 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedTokenModal(null)}
                    className="retroBtn text-xs px-5 py-2"
                  >
                    ✓ {language === 'es' ? 'Listo' : 'Done'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </Layout>
  );
}
