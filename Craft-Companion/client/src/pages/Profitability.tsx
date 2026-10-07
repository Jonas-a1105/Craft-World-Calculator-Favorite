import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { Combobox } from '../components/ui/Combobox';
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
import { extractPriceMap } from '../services/priceService';
import { formatNumber, formatCompactNumber } from '../utils/formatters';
import { computeValueChain, ValueChainAnalysis } from '../services/valueChainCalculator';

export default function Profitability() {
  const { language } = useTranslation();
  const [modalViewTab, setModalViewTab] = useState<'levels' | 'chain'>('levels');
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
        setPrices(extractPriceMap(home));
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

  // Compute Value Chain analysis for modal
  const modalChainAnalysis: ValueChainAnalysis | null = modalSummary
    ? computeValueChain(
        modalSummary.token,
        modalSummary.ownedLevel || 1,
        rows,
        prices,
        homeData?.proficiencies || [],
        inputSupplyMode === 'self_crafted' ? 'self_crafted' : 'market_buy',
      )
    : null;

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-12">
        {/* Header with Game Title Font */}
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-title font-bold text-white tracking-wider uppercase"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)' }}
          >
            {language === 'es'
              ? 'Centro de Rentabilidad por Fábrica'
              : 'Factory Profitability Center'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto font-main">
            {language === 'es'
              ? 'Explora cada fábrica en tarjetas. Haz clic en cualquiera para desplegar su rentabilidad nivel por nivel (1 al 40).'
              : 'Explore each factory type. Click any card to inspect full level-by-level profitability (Levels 1 to 40).'}
          </p>
        </div>

        {/* Live Boost & Input Supply Mode Controls Ribbon */}
        <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 shadow-xl border-none space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="font-title text-[11px] sm:text-xs md:text-sm text-white tracking-wide uppercase truncate">
              {language === 'es'
                ? 'Modificadores & Abastecimiento'
                : 'Modifiers & Supply Mode'}
            </h3>
          </div>

          <div className="space-y-3.5">
            {/* Input Supply Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 sm:p-3.5 bg-[#141416] rounded-2xl border-none">
              <span className="font-bold text-zinc-300 text-xs flex items-center gap-2 flex-shrink-0">
                <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {language === 'es'
                  ? 'Origen de Insumos:'
                  : 'Input Origin:'}
              </span>
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInputSupplyMode('market')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    inputSupplyMode === 'market'
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="truncate">{language === 'es' ? 'Mercado' : 'Market'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputSupplyMode('self_crafted')}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    inputSupplyMode === 'self_crafted'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'bg-[#202024] text-zinc-400 hover:text-white hover:bg-[#28282e]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span className="truncate">{language === 'es' ? 'Auto-Producido' : 'Self-Crafted'}</span>
                </button>
              </div>
            </div>

            {/* Account Modifiers */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
                <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
                  <input
                    type="checkbox"
                    checked={useWorkshop}
                    onChange={(e) => setUseWorkshop(e.target.checked)}
                    className="accent-emerald-500 flex-shrink-0"
                  />
                  <span className="font-bold text-white flex items-center gap-1.5 truncate">
                    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="truncate">{language === 'es' ? 'Taller' : 'Workshop'}</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
                  <input
                    type="checkbox"
                    checked={useMastery}
                    onChange={(e) => setUseMastery(e.target.checked)}
                    className="accent-emerald-500 flex-shrink-0"
                  />
                  <span className="font-bold text-white flex items-center gap-1.5 truncate">
                    <svg className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                    </svg>
                    <span className="truncate">{language === 'es' ? 'Maestría' : 'Mastery'}</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-[#141416] hover:bg-[#202026] px-3.5 py-2 rounded-full transition-colors">
                  <input
                    type="checkbox"
                    checked={useBoosters}
                    onChange={(e) => setUseBoosters(e.target.checked)}
                    className="accent-emerald-500 flex-shrink-0"
                  />
                  <span className="font-bold text-white flex items-center gap-1.5 truncate">
                    <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span className="truncate">{language === 'es' ? 'Boosters x2' : 'Boosters x2'}</span>
                  </span>
                </label>
              </div>

              <div className="text-zinc-400 font-bold text-[11px] flex items-center">
                {useWorkshop && useMastery && useBoosters ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{language === 'es' ? 'Con Boosts de Cuenta' : 'Full Account Boosted'}</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{language === 'es' ? 'Máquina Base' : 'Base Machine'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 shadow-xl border-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Filter Tabs */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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
                { id: 'loss', label: language === 'es' ? 'En Pérdida' : 'In Loss', hasWarning: true },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilterMode(t.id as any)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                    filterMode === t.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'bg-[#202024] text-zinc-400 hover:bg-[#28282e] hover:text-white border-none'
                  }`}
                >
                  {t.hasWarning && (
                    <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Sort Selector & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5">
              <Combobox
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={[
                  { value: 'profit_hour', label: language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour' },
                  { value: 'profit_day', label: language === 'es' ? 'Ganancia / Día' : 'Profit / Day' },
                  { value: 'xp_hour', label: language === 'es' ? 'XP / Hora' : 'XP / Hour' },
                  { value: 'margin', label: language === 'es' ? 'Margen %' : 'Margin %' },
                  { value: 'alphabetical', label: language === 'es' ? 'Alfabético' : 'A-Z' },
                ]}
              />

              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar fábrica...' : 'Search factory...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full lg:w-48 !rounded-full !bg-[#202024] hover:!bg-[#28282e] px-4 py-2 text-xs"
              />
            </div>
          </div>
        </div>

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
                className="bg-[#18181b] hover:bg-[#1f1f25] rounded-[32px] p-6 shadow-xl flex flex-col justify-between gap-5 transition-colors duration-200 cursor-pointer group select-none"
              >
                {/* Top Header: Avatar + Title/Subtitle + Bookmark Action */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar with status dot */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex items-center justify-center flex-shrink-0">
                      <FactoryIcon symbol={s.token} size={34} />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#18181b] ${
                          isOwned ? 'bg-emerald-400' : 'bg-zinc-600'
                        }`}
                      />
                    </div>

                    {/* Title & Subtitle */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base tracking-wide truncate">
                        {s.token}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {isOwned
                          ? (language === 'es'
                              ? `Nv. ${s.ownedLevel} • En propiedad`
                              : `Lv. ${s.ownedLevel} • Owned`)
                          : (language === 'es' ? 'Fábrica Base • Nv. 1' : 'Base Factory • Lv. 1')}
                      </p>
                    </div>
                  </div>

                  {/* Bookmark Action Pill Icon */}
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-zinc-300 transition-colors flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>

                {/* Description Paragraph */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[34px]">
                  {s.cycle.rawBaseMaterialsText
                    ? (language === 'es'
                        ? `Requiere insumos: ${s.cycle.rawBaseMaterialsText}. Genera ${s.cycle.runsPerHour.toFixed(1)} ciclos/h.`
                        : `Inputs: ${s.cycle.rawBaseMaterialsText}. Runs ${s.cycle.runsPerHour.toFixed(1)} cycles/h.`)
                    : (language === 'es'
                        ? `Extracción directa de ${s.token}. Ciclo continuo de ${s.cycle.runsPerHour.toFixed(1)} ejecuciones por hora.`
                        : `Direct extraction of ${s.token}. Produces continuously at ${s.cycle.runsPerHour.toFixed(1)} cycles/h.`)}
                </p>

                {/* Stats 4 Columns with Thin Vertical Dividers */}
                <div className="grid grid-cols-4 divide-x divide-white/10 pt-1 text-center">
                  <div className="px-1">
                    <span
                      className={`block font-bold text-xs sm:text-sm truncate ${
                        isLoss ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.cycle.effectiveProfitPerHour > 0 ? '+' : ''}
                      {formatCompactNumber(s.cycle.effectiveProfitPerHour)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                      {language === 'es' ? 'Ganancia/h' : 'Profit/h'}
                    </span>
                  </div>

                  <div className="px-1">
                    <span
                      className={`block font-bold text-xs sm:text-sm truncate ${
                        isLoss ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.cycle.effectiveProfitPerDay > 0 ? '+' : ''}
                      {formatCompactNumber(s.cycle.effectiveProfitPerDay)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                      {language === 'es' ? 'Ganancia/día' : 'Profit/day'}
                    </span>
                  </div>

                  <div className="px-1">
                    <span className="block font-bold text-xs sm:text-sm text-amber-400 truncate">
                      {formatCompactNumber(s.cycle.xpPerHour)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                      {language === 'es' ? 'XP/h' : 'XP/h'}
                    </span>
                  </div>

                  <div className="px-1">
                    <span
                      className={`block font-bold text-xs sm:text-sm truncate ${
                        typeof s.cycle.marginPercent === 'number' && s.cycle.marginPercent < 0
                          ? 'text-rose-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {typeof s.cycle.marginPercent === 'number'
                        ? `${s.cycle.marginPercent > 0 ? '+' : ''}${s.cycle.marginPercent.toFixed(0)}%`
                        : '100%'}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium block truncate mt-0.5">
                      {language === 'es' ? 'Margen' : 'Margin'}
                    </span>
                  </div>
                </div>

                {/* Bottom Full-Width Pill Button without elevation scale, in normal sentence casing */}
                <button
                  type="button"
                  className="w-full h-12 rounded-full !bg-white hover:!bg-zinc-200 !text-black hover:!text-black font-semibold text-xs sm:text-sm normal-case tracking-normal transition-colors duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'es' ? 'Ver los 40 niveles' : 'Inspect levels 1-40'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* FULLSCREEN REACT PORTAL MODAL (LEVELS 1 TO 40) */}
        {modalSummary &&
          createPortal(
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
              <div className="w-full max-w-5xl bg-[#18181b] rounded-[32px] p-6 sm:p-7 space-y-5 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border-none animate-in zoom-in-95 duration-200">
                {/* Modal Header: Avatar + Title + Status Badge + Close X Button */}
                <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-1">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-black/60 ring-2 ring-white/10 flex items-center justify-center flex-shrink-0">
                      <FactoryIcon symbol={modalSummary.token} size={42} />
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-[#18181b] ${
                          modalSummary.ownedLevel ? 'bg-emerald-400' : 'bg-zinc-600'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide truncate">
                          {modalSummary.token}
                        </h2>
                        {modalSummary.ownedLevel && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            {language === 'es'
                              ? `Posees Nivel ${modalSummary.ownedLevel}`
                              : `Owned Level ${modalSummary.ownedLevel}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {language === 'es'
                          ? 'Desglose financiero nivel por nivel (1 al 40) con costos y márgenes en tiempo real.'
                          : 'Complete level-by-level financial breakdown (Levels 1 to 40) with real-time costs.'}
                      </p>
                    </div>
                  </div>

                  {/* Circular Close Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedTokenModal(null)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                    title={language === 'es' ? 'Cerrar' : 'Close'}
                  >
                    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                {/* Main Modal View Selector: Desglose de Niveles vs Cadena Paso a Paso */}
                <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalViewTab('levels')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalViewTab === 'levels'
                        ? 'bg-white text-zinc-950 shadow-md font-bold'
                        : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>{language === 'es' ? 'Desglose de Niveles (1 al 40)' : 'Level Breakdown (1 to 40)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalViewTab('chain')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalViewTab === 'chain'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{language === 'es' ? 'Cadena Paso a Paso' : 'Step-by-Step Chain'}</span>
                  </button>
                </div>

                {modalViewTab === 'levels' ? (
                  <>
                    {/* Sub-header Filter Tabs & Input Mode Info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 flex-shrink-0">
                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'all', label: language === 'es' ? 'Todos los Niveles (40)' : 'All Levels (40)' },
                          ...(modalSummary.ownedLevel
                            ? [{ id: 'owned', label: language === 'es' ? `Tu Nivel (Nv. ${modalSummary.ownedLevel})` : `Your Level (Lv. ${modalSummary.ownedLevel})` }]
                            : []),
                          { id: 'profitable', label: language === 'es' ? 'En Ganancia' : 'Profitable' },
                          { id: 'loss', label: language === 'es' ? 'En Pérdida' : 'In Loss' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setModalLevelFilter(tab.id as any)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              modalLevelFilter === tab.id
                                ? 'bg-emerald-500 text-black font-bold shadow-sm'
                                : 'bg-[#24242a] text-zinc-300 hover:text-white hover:bg-[#2e2e36]'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Input Mode Badge */}
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>
                          {inputSupplyMode === 'self_crafted'
                            ? language === 'es'
                              ? 'Insumos Auto-Producidos'
                              : 'Self-Crafted Inputs'
                            : language === 'es'
                              ? 'Insumos de Mercado'
                              : 'Market Inputs'}
                        </span>
                      </div>
                    </div>

                    {/* Modal Level Cards List (Independent elongated rounded cards, fully responsive) */}
                    <div className="flex-1 overflow-y-auto min-h-0 modal-custom-scroll pr-1.5 -mr-1 space-y-2.5">
                      {modalCycleResults.map((c) => {
                        const isOwnedLevel = modalSummary.ownedLevel === c.row.level;
                        const isLoss = c.effectiveProfitPerDay < 0;

                        return (
                          <div
                            key={c.row.level}
                            className={`relative p-3.5 sm:p-4 rounded-[22px] transition-all ${
                              isOwnedLevel
                                ? 'bg-[#141416] border-[3.5px] border-emerald-400 shadow-md'
                                : 'bg-[#141416] hover:bg-[#18181c] border-[3.5px] border-transparent shadow-md'
                            }`}
                          >
                            {/* Solid Green Checkmark Badge at Top-Right Corner */}
                            {isOwnedLevel && (
                              <div
                                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-6 h-6 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-md z-10"
                                title={language === 'es' ? 'Tu nivel actual' : 'Your current level'}
                              >
                                <svg
                                  className="w-4 h-4 text-black"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3.5"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}

                            <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-5 ${isOwnedLevel ? 'pr-7 sm:pr-8' : ''}`}>
                              {/* Left Block: Level ID, Badges, Time, XP */}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0">
                                <span className="font-extrabold text-white text-sm sm:text-base font-mono">
                                  Nv. {c.row.level}
                                </span>

                                {isOwnedLevel && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {language === 'es' ? 'TU NIVEL' : 'YOU'}
                                  </span>
                                )}

                                {isLoss ? (
                                  <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold inline-flex items-center gap-1">
                                    <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {language === 'es' ? 'Pérdida' : 'Loss'}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {language === 'es' ? 'Rentable' : 'Profit'}
                                  </span>
                                )}

                                <span className="text-zinc-400 text-xs font-mono bg-[#1c1c20] px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {Number(c.runtimeMinutes.toFixed(1))} min
                                </span>

                                {c.xpPerHour > 0 && (
                                  <span className="text-amber-400 text-xs font-mono font-bold bg-[#1c1c20] px-2.5 py-1 rounded-full flex items-center gap-1">
                                    ⭐ {formatCompactNumber(c.xpPerHour)} XP/h
                                  </span>
                                )}
                              </div>

                              {/* Right/Middle Block: Insumos, Output, Ganancia/h, Ganancia/Día */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 flex-1 lg:justify-end items-center text-xs">
                                {/* Insumos */}
                                <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
                                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                                    {language === 'es' ? 'Insumos' : 'Inputs'}
                                  </span>
                                  <div className="font-mono font-bold flex items-baseline">
                                    <span className="text-amber-400">
                                      {c.effectiveInputCost > 0 ? `-${formatNumber(c.effectiveInputCost)}` : '0'}
                                    </span>
                                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500 truncate block max-w-[130px]">
                                    {c.effectiveInputCost > 0
                                      ? (inputSupplyMode === 'self_crafted' && c.rawBaseMaterialsText
                                          ? c.rawBaseMaterialsText
                                          : `${c.row.input_token_1 || ''} (${formatNumber(c.input1PerCycle, 1)})${c.row.input_token_2 ? ` + ${c.row.input_token_2}` : ''}`)
                                      : (language === 'es' ? 'Sin insumos' : 'No inputs')}
                                  </span>
                                </div>

                                {/* Output */}
                                <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
                                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                                    {language === 'es' ? 'Output (Venta)' : 'Output'}
                                  </span>
                                  <div className="font-mono font-bold flex items-baseline">
                                    <span className="text-white">
                                      +{formatNumber(c.revenuePerCycle)}
                                    </span>
                                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500 truncate block">
                                    {c.row.output_token} ({formatNumber(c.outputPerCycle, 1)})
                                  </span>
                                </div>

                                {/* Ganancia / Hora */}
                                <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
                                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                                    {language === 'es' ? 'Ganancia / h' : 'Profit / h'}
                                  </span>
                                  <div className="font-mono font-bold text-xs sm:text-sm flex items-baseline">
                                    <span className={isLoss ? 'text-rose-400' : 'text-emerald-400'}>
                                      {c.effectiveProfitPerHour > 0 ? '+' : ''}
                                      {formatNumber(c.effectiveProfitPerHour)}
                                    </span>
                                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                                  </div>
                                </div>

                                {/* Ganancia / Día */}
                                <div className="bg-[#101012] lg:bg-transparent p-2 sm:p-2.5 lg:p-0 rounded-2xl lg:rounded-none">
                                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                                    {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                                  </span>
                                  <div className="font-mono font-bold text-xs sm:text-sm flex items-baseline">
                                    <span className={isLoss ? 'text-rose-400' : 'text-emerald-400'}>
                                      {c.effectiveProfitPerDay > 0 ? '+' : ''}
                                      {formatNumber(c.effectiveProfitPerDay)}
                                    </span>
                                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Step-by-Step Value Chain View */
                  <div className="flex-1 overflow-y-auto min-h-0 modal-custom-scroll pr-1.5 space-y-4">
                    {modalChainAnalysis ? (
                      <>
                        {/* Summary Metrics Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-[#141416] p-4 rounded-[28px] border-none">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Insumos Base Diarios</span>
                            <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
                              {Object.entries(modalChainAnalysis.rawMaterialsNeeded).map(([k, v]) => (
                                <span key={k} className="flex items-center gap-1">
                                  <ResourceIcon symbol={k} className="w-4 h-4" />
                                  {formatNumber(v, 0)}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-[#141416] p-4 rounded-[28px] border-none">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Venta Cruda (Tierra)</span>
                            <div className="mt-1 text-sm font-bold text-amber-400">
                              {formatNumber(modalChainAnalysis.rawOpportunityCostDay)} COIN
                            </div>
                          </div>

                          <div className="bg-[#141416] p-4 rounded-[28px] border-none">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Venta Procesada ({modalSummary.token})</span>
                            <div className="mt-1 text-sm font-bold text-cyan-400">
                              +{formatNumber(modalChainAnalysis.finalOutputValueDay)} COIN
                            </div>
                          </div>

                          <div className="bg-emerald-500/10 p-4 rounded-[28px] border-none">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Ganancia Extra Neta</span>
                            <div className="mt-1 text-sm font-black text-emerald-300">
                              +{formatNumber(modalChainAnalysis.netProfitDay)} COIN/día
                            </div>
                          </div>
                        </div>

                        {/* Steps Progression Flow */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                            {language === 'es' ? 'Flujo de Transformación de la Fábrica' : 'Factory Transformation Flow'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {modalChainAnalysis.steps.map((st, idx) => (
                              <div key={st.token} className="bg-[#141416] p-5 rounded-[28px] border-none relative flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                      Paso #{idx + 1}
                                    </span>
                                    <span className="text-xs text-zinc-400 font-mono">
                                      {st.cyclesPerDay.toFixed(1)} ciclos/día
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <FactoryIcon symbol={st.token} size={32} />
                                    <div>
                                      <h5 className="font-bold text-white text-sm">{st.token}</h5>
                                      <span className="text-[11px] text-zinc-400">Nv. {st.factoryLevel}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                                  <span className="text-zinc-400">Ganancia Neta:</span>
                                  <span className="font-bold text-emerald-400">
                                    +{formatNumber(st.netProfitPerDay)} COIN/día
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center text-xs text-zinc-400">
                        {language === 'es' ? 'No se pudo simular la cadena de este producto.' : 'Chain simulation not available.'}
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-shrink-0">
                  <span className="text-xs text-zinc-400 font-medium">
                    {modalViewTab === 'levels'
                      ? `${modalCycleResults.length} ${language === 'es' ? 'niveles mostrados' : 'levels displayed'}`
                      : `${modalChainAnalysis?.steps.length || 0} ${language === 'es' ? 'pasos en la cadena' : 'chain steps'}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTokenModal(null)}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm cursor-pointer transition-colors shadow-md"
                  >
                    {language === 'es' ? 'Cerrar' : 'Close'}
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
