import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useTranslation } from '../../../utils/i18n';
import { useFactoryCompare } from '../hooks/useFactoryCompare';
import { CompareHeader } from './CompareHeader';
import { ComparePresetsBar } from './ComparePresetsBar';
import { FactorySelectorCard } from './FactorySelectorCard';
import { CompareHatchChartCard } from './CompareHatchChartCard';
import { CompareVerdictCard } from './CompareVerdictCard';
import { FactoryDetailCard } from './FactoryDetailCard';
import { RocketBoldDuotone, Buildings2BoldDuotone } from 'solar-icon-set';

export const CompareDashboard: React.FC = () => {
  const { language } = useTranslation();
  const {
    loading,
    token1,
    setToken1,
    level1,
    setLevel1,
    token2,
    setToken2,
    level2,
    setLevel2,
    tokenOptions,
    availableLevels1,
    levelOptions1,
    availableLevels2,
    levelOptions2,
    userFactories,
    cycle1,
    cycle2,
    comparisonVerdict,
    withPlayerBonuses,
    setWithPlayerBonuses,
    handleSwap,
    handleCompareNextLevel,
    handleCompareMaxLevel,
  } = useFactoryCompare();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-6 pb-12 select-none">
      {/* Game Title Header */}
      <CompareHeader language={language} />

      {/* Quick Comparison Presets Bar */}
      <ComparePresetsBar
        onCompareNextLevel={handleCompareNextLevel}
        onCompareMaxLevel={handleCompareMaxLevel}
        onSwap={handleSwap}
        language={language}
      />

      {/* Simulation Mode Toggle Bar */}
      <div className="flex items-center justify-between bg-[#18181b] p-3 px-5 rounded-2xl shadow-md border-none">
        <span className="text-xs text-zinc-400 font-medium">
          {language === 'es' ? 'Modo de Comparación:' : 'Comparison Mode:'}
        </span>
        <button
          type="button"
          onClick={() => setWithPlayerBonuses(!withPlayerBonuses)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-none shadow-sm ${
            withPlayerBonuses
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-[#141416] text-zinc-400 hover:text-white'
          }`}
        >
          {withPlayerBonuses ? (
            <RocketBoldDuotone className="w-4 h-4 text-emerald-400" />
          ) : (
            <Buildings2BoldDuotone className="w-4 h-4 text-zinc-400" />
          )}
          <span>
            {withPlayerBonuses
              ? language === 'es'
                ? 'Con mis Bonos (Taller, Maestrías, x2)'
                : 'With Account Perks (Workshop, Mastery, 2x)'
              : language === 'es'
                ? 'Modo Base Puro (1x)'
                : 'Pure Base (1x)'}
          </span>
        </button>
      </div>

      {/* 1. Selection Ribbon: Side-by-Side Factory Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <FactorySelectorCard
          optionLabel="A"
          token={token1}
          setToken={setToken1}
          level={level1}
          setLevel={setLevel1}
          tokenOptions={tokenOptions}
          availableLevels={availableLevels1}
          levelOptions={levelOptions1}
          userOwnedLevel={userFactories[token1]}
          language={language}
        />

        <FactorySelectorCard
          optionLabel="B"
          token={token2}
          setToken={setToken2}
          level={level2}
          setLevel={setLevel2}
          tokenOptions={tokenOptions}
          availableLevels={availableLevels2}
          levelOptions={levelOptions2}
          userOwnedLevel={userFactories[token2]}
          language={language}
        />
      </div>

      {/* 2. Comparative Performance Trends Chart (From Mockup with Hatch Patterns) */}
      {comparisonVerdict && cycle1 && cycle2 && (
        <CompareHatchChartCard
          cycle1={cycle1}
          cycle2={cycle2}
          verdict={comparisonVerdict}
          language={language}
        />
      )}

      {/* 3. Comparative Verdict Banner */}
      {comparisonVerdict && cycle1 && cycle2 && (
        <CompareVerdictCard verdict={comparisonVerdict} language={language} />
      )}

      {/* 4. Detailed Side-by-Side Metrics Cards */}
      {cycle1 && cycle2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FactoryDetailCard
            optionLabel="A"
            cycle={cycle1}
            language={language}
          />
          <FactoryDetailCard
            optionLabel="B"
            cycle={cycle2}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
