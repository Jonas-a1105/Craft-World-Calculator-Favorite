import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { calculateFactoryCycle, FactoryCycleResult } from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { Combobox } from '../components/ui/Combobox';
import { formatNumber, formatCompactNumber } from '../utils/formatters';

export default function FactoryCompare() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [token1, setToken1] = useState('STEEL');
  const [level1, setLevel1] = useState(1);
  const [token2, setToken2] = useState('STEEL');
  const [level2, setLevel2] = useState(2);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [userFactories, setUserFactories] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) {
          const first = factoryRows[0].token;
          setToken1(first);
          setToken2(first);
          setLevel1(1);
          setLevel2(2);
        }
        setPrices(extractPriceMap(home));

        const ownedMap: Record<string, number> = {};
        if (home?.craftWorld?.factories && Array.isArray(home.craftWorld.factories)) {
          home.craftWorld.factories.forEach((f: any) => {
            if (f.symbol) ownedMap[f.symbol.toUpperCase()] = f.level || 1;
          });
        }
        setUserFactories(ownedMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const uniqueTokens = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.token))).filter(Boolean);
  }, [rows]);

  const tokenOptions = useMemo(() => {
    return uniqueTokens.map((t) => ({
      value: t,
      label: t,
      icon: <FactoryIcon symbol={t} size={18} />,
    }));
  }, [uniqueTokens]);

  const availableLevels1 = useMemo(() => {
    return rows
      .filter((r) => r.token === token1)
      .map((r) => r.level)
      .sort((a, b) => a - b);
  }, [rows, token1]);

  const levelOptions1 = useMemo(() => {
    return availableLevels1.map((lvl) => ({
      value: lvl,
      label: `Nv. ${lvl}`,
    }));
  }, [availableLevels1]);

  const availableLevels2 = useMemo(() => {
    return rows
      .filter((r) => r.token === token2)
      .map((r) => r.level)
      .sort((a, b) => a - b);
  }, [rows, token2]);

  const levelOptions2 = useMemo(() => {
    return availableLevels2.map((lvl) => ({
      value: lvl,
      label: `Nv. ${lvl}`,
    }));
  }, [availableLevels2]);

  const row1 = useMemo(() => {
    return (
      rows.find((r) => r.token === token1 && r.level === level1) ||
      rows.find((r) => r.token === token1)
    );
  }, [rows, token1, level1]);

  const row2 = useMemo(() => {
    return (
      rows.find((r) => r.token === token2 && r.level === level2) ||
      rows.find((r) => r.token === token2)
    );
  }, [rows, token2, level2]);

  const cycle1: FactoryCycleResult | null = useMemo(() => {
    return row1 ? calculateFactoryCycle(row1, prices) : null;
  }, [row1, prices]);

  const cycle2: FactoryCycleResult | null = useMemo(() => {
    return row2 ? calculateFactoryCycle(row2, prices) : null;
  }, [row2, prices]);

  // Quick helper actions
  const handleSwap = () => {
    const tempT = token1;
    const tempL = level1;
    setToken1(token2);
    setLevel1(level2);
    setToken2(tempT);
    setLevel2(tempL);
  };

  const handleCompareNextLevel = () => {
    setToken2(token1);
    const maxL = Math.max(...availableLevels1, 1);
    setLevel2(Math.min(level1 + 1, maxL));
  };

  const handleCompareMaxLevel = () => {
    setToken2(token1);
    const maxL = Math.max(...availableLevels1, 1);
    setLevel2(maxL);
  };

  // Comparative Verdict Calculations
  const comparisonVerdict = useMemo(() => {
    if (!cycle1 || !cycle2) return null;

    const profitDiffDay = cycle1.profitPerDay - cycle2.profitPerDay;
    const profitWinner = profitDiffDay > 0 ? 'A' : profitDiffDay < 0 ? 'B' : 'TIE';
    const profitDiffAbs = Math.abs(profitDiffDay);
    const baseProfit = Math.min(Math.abs(cycle1.profitPerDay), Math.abs(cycle2.profitPerDay));
    const profitPercent =
      baseProfit > 0 ? Math.round((profitDiffAbs / baseProfit) * 100) : 0;

    const outputDiffDay = cycle1.outputPerDay - cycle2.outputPerDay;
    const outputWinner = outputDiffDay > 0 ? 'A' : outputDiffDay < 0 ? 'B' : 'TIE';

    const xpDiffDay = cycle1.xpPerDay - cycle2.xpPerDay;
    const xpWinner = xpDiffDay > 0 ? 'A' : xpDiffDay < 0 ? 'B' : 'TIE';

    const timeDiff = cycle1.runtimeMinutes - cycle2.runtimeMinutes;
    const timeWinner = timeDiff < 0 ? 'A' : timeDiff > 0 ? 'B' : 'TIE'; // faster is better

    return {
      profitWinner,
      profitDiffDay,
      profitDiffAbs,
      profitPercent,
      outputWinner,
      outputDiffDay: Math.abs(outputDiffDay),
      xpWinner,
      xpDiffDay: Math.abs(xpDiffDay),
      timeWinner,
      isSameFactory: token1 === token2,
    };
  }, [cycle1, cycle2, token1, token2]);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6 pb-12">
        {/* Game Title Header */}
        <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
          <h1
            className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
            style={{
              textShadow:
                '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
            }}
          >
            {language === 'es' ? 'Comparar Fábricas' : 'Compare Factories'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
            {language === 'es'
              ? 'Análisis frente a frente de producción, rentabilidad y consumo entre dos opciones.'
              : 'Side-by-side head-to-head comparison of output, profitability, and costs.'}
          </p>
        </div>

        {/* Quick Comparison Presets Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          <button
            type="button"
            onClick={handleCompareNextLevel}
            className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>{language === 'es' ? 'Comparar Nivel Siguiente (+1)' : 'Compare Next Level (+1)'}</span>
          </button>

          <button
            type="button"
            onClick={handleCompareMaxLevel}
            className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
            </svg>
            <span>{language === 'es' ? 'Comparar con Nivel Máximo (40)' : 'Compare with Max Level (40)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSwap}
            className="px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#222226] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer border-none shadow-md flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{language === 'es' ? 'Invertir A ⇄ B' : 'Swap A ⇄ B'}</span>
          </button>
        </div>

        {/* 1. Selection Ribbon: Side-by-Side Factory Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          {/* Card Factory A */}
          <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
                  <FactoryIcon symbol={token1} size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400">
                      {language === 'es' ? 'Opción A' : 'Option A'}
                    </span>
                    <h3 className="font-extrabold text-white text-base tracking-wide uppercase">
                      {token1}
                    </h3>
                  </div>
                </div>
              </div>

              {userFactories[token1] && (
                <button
                  type="button"
                  onClick={() => setLevel1(userFactories[token1])}
                  className="px-2.5 py-1 rounded-full bg-[#141416] hover:bg-[#202024] text-[11px] font-bold text-emerald-400 cursor-pointer border-none transition-colors"
                >
                  {language === 'es' ? `Tu Nv: ${userFactories[token1]}` : `Owned: ${userFactories[token1]}`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  {language === 'es' ? 'Fábrica' : 'Factory'}
                </label>
                <Combobox
                  value={token1}
                  onChange={(val) => {
                    const nextTok = val as string;
                    setToken1(nextTok);
                    const firstLvl = rows.find((r) => r.token === nextTok)?.level || 1;
                    setLevel1(firstLvl);
                  }}
                  options={tokenOptions}
                  className="w-full !py-2.5 !px-3.5 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-bold text-white shadow-inner"
                  menuClassName="w-full max-h-60"
                  align="full"
                />
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  {language === 'es' ? 'Nivel' : 'Level'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLevel1((prev) => Math.max(1, prev - 1))}
                    disabled={level1 <= (availableLevels1[0] ?? 1)}
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
                    title={language === 'es' ? 'Reducir nivel' : 'Decrease level'}
                  >
                    -
                  </button>
                  <div className="flex-1 min-w-0">
                    <Combobox
                      value={level1}
                      onChange={(val) => setLevel1(Number(val))}
                      options={levelOptions1}
                      className="w-full !py-2.5 !px-3 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-mono font-bold text-white shadow-inner justify-between"
                      menuClassName="w-full min-w-[100px] max-h-60"
                      align="full"
                      searchPlaceholder={language === 'es' ? 'Nivel...' : 'Level...'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const maxL = Math.max(...availableLevels1, 1);
                      setLevel1((prev) => Math.min(maxL, prev + 1));
                    }}
                    disabled={level1 >= Math.max(...availableLevels1, 1)}
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
                    title={language === 'es' ? 'Aumentar nivel' : 'Increase level'}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card Factory B */}
          <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
                  <FactoryIcon symbol={token2} size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                      {language === 'es' ? 'Opción B' : 'Option B'}
                    </span>
                    <h3 className="font-extrabold text-white text-base tracking-wide uppercase">
                      {token2}
                    </h3>
                  </div>
                </div>
              </div>

              {userFactories[token2] && (
                <button
                  type="button"
                  onClick={() => setLevel2(userFactories[token2])}
                  className="px-2.5 py-1 rounded-full bg-[#141416] hover:bg-[#202024] text-[11px] font-bold text-emerald-400 cursor-pointer border-none transition-colors"
                >
                  {language === 'es' ? `Tu Nv: ${userFactories[token2]}` : `Owned: ${userFactories[token2]}`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  {language === 'es' ? 'Fábrica' : 'Factory'}
                </label>
                <Combobox
                  value={token2}
                  onChange={(val) => {
                    const nextTok = val as string;
                    setToken2(nextTok);
                    const firstLvl = rows.find((r) => r.token === nextTok)?.level || 1;
                    setLevel2(firstLvl);
                  }}
                  options={tokenOptions}
                  className="w-full !py-2.5 !px-3.5 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-bold text-white shadow-inner"
                  menuClassName="w-full max-h-60"
                  align="full"
                />
              </div>

              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  {language === 'es' ? 'Nivel' : 'Level'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLevel2((prev) => Math.max(1, prev - 1))}
                    disabled={level2 <= (availableLevels2[0] ?? 1)}
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
                    title={language === 'es' ? 'Reducir nivel' : 'Decrease level'}
                  >
                    -
                  </button>
                  <div className="flex-1 min-w-0">
                    <Combobox
                      value={level2}
                      onChange={(val) => setLevel2(Number(val))}
                      options={levelOptions2}
                      className="w-full !py-2.5 !px-3 bg-[#141416] hover:bg-[#19191d] rounded-full text-xs font-mono font-bold text-white shadow-inner justify-between"
                      menuClassName="w-full min-w-[100px] max-h-60"
                      align="full"
                      searchPlaceholder={language === 'es' ? 'Nivel...' : 'Level...'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const maxL = Math.max(...availableLevels2, 1);
                      setLevel2((prev) => Math.min(maxL, prev + 1));
                    }}
                    disabled={level2 >= Math.max(...availableLevels2, 1)}
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-[#141416] hover:bg-[#202024] disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 hover:text-white font-bold transition-all cursor-pointer border-none flex items-center justify-center text-sm shadow-inner"
                    title={language === 'es' ? 'Aumentar nivel' : 'Increase level'}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Comparative Verdict Banner */}
        {comparisonVerdict && cycle1 && cycle2 && (
          <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                VS
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                  {language === 'es' ? 'Veredicto de Comparación' : 'Comparison Verdict'}
                </h3>
                <span className="text-xs text-zinc-400">
                  {comparisonVerdict.profitWinner === 'TIE'
                    ? language === 'es'
                      ? 'Ambas opciones generan la misma rentabilidad diaria.'
                      : 'Both options yield equal daily profits.'
                    : language === 'es'
                      ? `La Opción ${comparisonVerdict.profitWinner} es la más rentable con +${formatNumber(comparisonVerdict.profitDiffAbs)} COIN extra al día.`
                      : `Option ${comparisonVerdict.profitWinner} is more profitable with +${formatNumber(comparisonVerdict.profitDiffAbs)} COIN extra per day.`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Metric 1: Profit Diff */}
              <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  {language === 'es' ? 'Diferencia de Ganancia' : 'Profit Difference'}
                </span>
                <div className="font-mono font-extrabold text-base flex items-baseline">
                  <span
                    className={
                      comparisonVerdict.profitWinner === 'A'
                        ? 'text-sky-400'
                        : comparisonVerdict.profitWinner === 'B'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                    }
                  >
                    {comparisonVerdict.profitWinner === 'TIE'
                      ? 'Iguales'
                      : `Opción ${comparisonVerdict.profitWinner} (+${formatNumber(comparisonVerdict.profitDiffAbs)})`}
                  </span>
                  {comparisonVerdict.profitWinner !== 'TIE' && (
                    <span className="text-amber-400 text-xs ml-1 font-bold">COIN/día</span>
                  )}
                </div>
              </div>

              {/* Metric 2: Output Diff */}
              <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  {language === 'es' ? 'Volumen de Producción' : 'Production Volume'}
                </span>
                <div className="font-mono font-extrabold text-base text-zinc-200">
                  {comparisonVerdict.outputWinner === 'TIE'
                    ? language === 'es'
                      ? 'Mismo volumen'
                      : 'Equal output'
                    : `Opción ${comparisonVerdict.outputWinner} (+${formatNumber(comparisonVerdict.outputDiffDay)}/día)`}
                </div>
              </div>

              {/* Metric 3: XP Diff */}
              <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  {language === 'es' ? 'Experiencia (XP)' : 'Experience (XP)'}
                </span>
                <div className="font-mono font-extrabold text-base text-amber-300">
                  {comparisonVerdict.xpWinner === 'TIE'
                    ? language === 'es'
                      ? 'Misma XP'
                      : 'Equal XP'
                    : `Opción ${comparisonVerdict.xpWinner} (+${formatCompactNumber(comparisonVerdict.xpDiffDay)} XP)`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Detailed Side-by-Side Metrics Cards */}
        {cycle1 && cycle2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detailed Card Option A */}
            <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
                    <FactoryIcon symbol={cycle1.row.token} size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base uppercase tracking-wide">
                      {cycle1.row.token}
                    </h4>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      Nv. {cycle1.row.level}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                  </span>
                  <div className="font-mono font-black text-base flex items-baseline justify-end">
                    <span className={cycle1.profitPerDay >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cycle1.profitPerDay > 0 ? '+' : ''}
                      {formatNumber(cycle1.profitPerDay)}
                    </span>
                    <span className="text-amber-400 font-bold text-xs ml-1">COIN</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Ganancia / Hora */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                  </span>
                  <div className="font-mono font-bold flex items-baseline mt-0.5">
                    <span className={cycle1.profitPerHour >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cycle1.profitPerHour > 0 ? '+' : ''}
                      {formatNumber(cycle1.profitPerHour)}
                    </span>
                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                  </div>
                </div>

                {/* Output / Día */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Output / Día' : 'Output / Day'}
                  </span>
                  <div className="font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <ResourceIcon symbol={cycle1.row.output_token} size={15} />
                    <span>{formatNumber(cycle1.outputPerDay)}</span>
                    <span className="text-zinc-400 text-[11px]">{cycle1.row.output_token}</span>
                  </div>
                </div>

                {/* Insumos / Ciclo */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Costo Insumos / Ciclo' : 'Inputs Cost / Cycle'}
                  </span>
                  <div className="font-mono font-bold flex items-baseline mt-0.5">
                    <span className="text-amber-400">
                      {cycle1.inputCostPerCycle > 0 ? `-${formatNumber(cycle1.inputCostPerCycle)}` : '0'}
                    </span>
                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                  </div>
                </div>

                {/* Tiempo de Ciclo */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Tiempo de Ciclo' : 'Cycle Duration'}
                  </span>
                  <span className="font-mono font-bold text-white block mt-0.5">
                    {Number(cycle1.runtimeMinutes.toFixed(1))} min
                  </span>
                </div>

                {/* Margen */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Margen de Margen' : 'Profit Margin'}
                  </span>
                  <span
                    className={`font-mono font-bold block mt-0.5 ${
                      cycle1.marginPercent && cycle1.marginPercent < 0
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {typeof cycle1.marginPercent === 'number'
                      ? `${cycle1.marginPercent > 0 ? '+' : ''}${cycle1.marginPercent.toFixed(0)}%`
                      : '100%'}
                  </span>
                </div>

                {/* XP / Día */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'XP Ganada / Día' : 'Daily XP'}
                  </span>
                  <span className="font-mono font-bold text-amber-300 block mt-0.5">
                    +{formatCompactNumber(cycle1.xpPerDay)} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Card Option B */}
            <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#141416] flex items-center justify-center shadow-inner">
                    <FactoryIcon symbol={cycle2.row.token} size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base uppercase tracking-wide">
                      {cycle2.row.token}
                    </h4>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Nv. {cycle2.row.level}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                    {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                  </span>
                  <div className="font-mono font-black text-base flex items-baseline justify-end">
                    <span className={cycle2.profitPerDay >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cycle2.profitPerDay > 0 ? '+' : ''}
                      {formatNumber(cycle2.profitPerDay)}
                    </span>
                    <span className="text-amber-400 font-bold text-xs ml-1">COIN</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Ganancia / Hora */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                  </span>
                  <div className="font-mono font-bold flex items-baseline mt-0.5">
                    <span className={cycle2.profitPerHour >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {cycle2.profitPerHour > 0 ? '+' : ''}
                      {formatNumber(cycle2.profitPerHour)}
                    </span>
                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                  </div>
                </div>

                {/* Output / Día */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Output / Día' : 'Output / Day'}
                  </span>
                  <div className="font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <ResourceIcon symbol={cycle2.row.output_token} size={15} />
                    <span>{formatNumber(cycle2.outputPerDay)}</span>
                    <span className="text-zinc-400 text-[11px]">{cycle2.row.output_token}</span>
                  </div>
                </div>

                {/* Insumos / Ciclo */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Costo Insumos / Ciclo' : 'Inputs Cost / Cycle'}
                  </span>
                  <div className="font-mono font-bold flex items-baseline mt-0.5">
                    <span className="text-amber-400">
                      {cycle2.inputCostPerCycle > 0 ? `-${formatNumber(cycle2.inputCostPerCycle)}` : '0'}
                    </span>
                    <span className="text-amber-400 font-semibold text-[11px] ml-1">COIN</span>
                  </div>
                </div>

                {/* Tiempo de Ciclo */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Tiempo de Ciclo' : 'Cycle Duration'}
                  </span>
                  <span className="font-mono font-bold text-white block mt-0.5">
                    {Number(cycle2.runtimeMinutes.toFixed(1))} min
                  </span>
                </div>

                {/* Margen */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'Margen de Margen' : 'Profit Margin'}
                  </span>
                  <span
                    className={`font-mono font-bold block mt-0.5 ${
                      cycle2.marginPercent && cycle2.marginPercent < 0
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {typeof cycle2.marginPercent === 'number'
                      ? `${cycle2.marginPercent > 0 ? '+' : ''}${cycle2.marginPercent.toFixed(0)}%`
                      : '100%'}
                  </span>
                </div>

                {/* XP / Día */}
                <div className="bg-[#141416] p-3 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {language === 'es' ? 'XP Ganada / Día' : 'Daily XP'}
                  </span>
                  <span className="font-mono font-bold text-amber-300 block mt-0.5">
                    +{formatCompactNumber(cycle2.xpPerDay)} XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
