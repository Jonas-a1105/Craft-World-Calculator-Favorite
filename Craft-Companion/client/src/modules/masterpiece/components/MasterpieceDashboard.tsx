import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useMasterpiece } from '../hooks/useMasterpiece';
import { MasterpieceHeader } from './MasterpieceHeader';
import { LeagueProgressCard } from './LeagueProgressCard';
import { TierContributionsGrid } from './TierContributionsGrid';
import { EfficiencySection } from './EfficiencySection';
import { EfficiencyCardsGrid } from './EfficiencyCardsGrid';
import { CONTRIBUTION_TIERS } from '../data/masterpieceData';

export const MasterpieceDashboard: React.FC = () => {
  const {
    language,
    loading,
    activeLeague,
    setActiveLeague,
    currentLeagueInfo,
    leagues,
    activeTier,
    setActiveTier,
    tierContributions,
    search,
    setSearch,
    powerPricePer100k,
    setPowerPricePer100k,
    globalMultiplier,
    setGlobalMultiplier,
    setMultiplierForResource,
    updateResourceUnits,
    updateResourceBracket,
    updateContribution,
    efficiencies,
    totalEfficiencyCount,
    baseSymbol,
  } = useMasterpiece();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const topEfficiency = efficiencies.length > 0 ? efficiencies[0].efficiency : 0;

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-12">
        {/* Header with Title and Live Stats */}
        <MasterpieceHeader
          language={language}
          totalResources={totalEfficiencyCount}
          topEfficiencyCrowns={topEfficiency}
        />

        {/* League Match & Community Progress Card */}
        <LeagueProgressCard
          leagues={leagues}
          activeLeague={activeLeague}
          onSelectLeague={setActiveLeague}
          currentLeagueInfo={currentLeagueInfo}
          language={language}
        />

        {/* Tier Requirements & Personal Contribution Tracking */}
        <TierContributionsGrid
          tiers={CONTRIBUTION_TIERS}
          activeTier={activeTier}
          onSelectTier={setActiveTier}
          items={tierContributions}
          onUpdateContribution={updateContribution}
          language={language}
        />

        {/* Efficiency Section: Filters & Settings */}
        <EfficiencySection
          search={search}
          onSearchChange={setSearch}
          powerPricePer100k={powerPricePer100k}
          onPowerPriceChange={setPowerPricePer100k}
          globalMultiplier={globalMultiplier}
          onGlobalMultiplierChange={setGlobalMultiplier}
          language={language}
          baseSymbol={baseSymbol}
        />

        {/* Efficiency Resource Cards Grid */}
        <EfficiencyCardsGrid
          items={efficiencies}
          onMultiplierChange={setMultiplierForResource}
          onUnitsChange={updateResourceUnits}
          onBracketChange={updateResourceBracket}
          language={language}
          baseSymbol={baseSymbol}
        />
      </div>
    </Layout>
  );
};
