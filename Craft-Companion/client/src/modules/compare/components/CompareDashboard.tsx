import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useTranslation } from '../../../utils/i18n';
import { useFactoryCompare } from '../hooks/useFactoryCompare';
import { CompareHeader } from './CompareHeader';
import { ComparePresetsBar } from './ComparePresetsBar';
import { FactorySelectorCard } from './FactorySelectorCard';
import { CompareVerdictCard } from './CompareVerdictCard';
import { FactoryDetailCard } from './FactoryDetailCard';

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
    handleSwap,
    handleCompareNextLevel,
    handleCompareMaxLevel,
  } = useFactoryCompare();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-6 pb-12">
      {/* Game Title Header */}
      <CompareHeader language={language} />

      {/* Quick Comparison Presets Bar */}
      <ComparePresetsBar
        onCompareNextLevel={handleCompareNextLevel}
        onCompareMaxLevel={handleCompareMaxLevel}
        onSwap={handleSwap}
        language={language}
      />

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

      {/* 2. Comparative Verdict Banner */}
      {comparisonVerdict && cycle1 && cycle2 && (
        <CompareVerdictCard verdict={comparisonVerdict} language={language} />
      )}

      {/* 3. Detailed Side-by-Side Metrics Cards */}
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
