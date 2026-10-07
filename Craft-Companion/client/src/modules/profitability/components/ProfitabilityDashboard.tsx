import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useProfitability } from '../hooks/useProfitability';
import { ProfitabilityHeader } from './ProfitabilityHeader';
import { ModifiersRibbon } from './ModifiersRibbon';
import { FilterRibbon } from './FilterRibbon';
import { FactoryGrid } from './FactoryGrid';
import { ProfitabilityModal } from './modal/ProfitabilityModal';

export const ProfitabilityDashboard: React.FC = () => {
  const {
    loading,
    search,
    setSearch,
    filterMode,
    setFilterMode,
    sortBy,
    setSortBy,
    useWorkshop,
    setUseWorkshop,
    useMastery,
    setUseMastery,
    useBoosters,
    setUseBoosters,
    inputSupplyMode,
    setInputSupplyMode,
    selectedTokenModal,
    setSelectedTokenModal,
    modalViewTab,
    setModalViewTab,
    modalLevelFilter,
    setModalLevelFilter,
    filteredSummaries,
    uniqueTokensCount,
    ownedCount,
    modalSummary,
    modalCycleResults,
    modalChainAnalysis,
  } = useProfitability();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <ProfitabilityHeader />

      {/* Live Boost & Input Supply Mode Controls Ribbon */}
      <ModifiersRibbon
        inputSupplyMode={inputSupplyMode}
        setInputSupplyMode={setInputSupplyMode}
        useWorkshop={useWorkshop}
        setUseWorkshop={setUseWorkshop}
        useMastery={useMastery}
        setUseMastery={setUseMastery}
        useBoosters={useBoosters}
        setUseBoosters={setUseBoosters}
      />

      {/* Filter & Sort Controls */}
      <FilterRibbon
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        search={search}
        setSearch={setSearch}
        uniqueTokensCount={uniqueTokensCount}
        ownedCount={ownedCount}
      />

      {/* Factory Grid Cards */}
      <FactoryGrid
        summaries={filteredSummaries}
        onSelectFactory={(token) => {
          setSelectedTokenModal(token);
          setModalLevelFilter('all');
        }}
      />

      {/* Fullscreen React Portal Modal (Levels 1 to 40 & Value Chain) */}
      <ProfitabilityModal
        summary={modalSummary}
        cycleResults={modalCycleResults}
        chainAnalysis={modalChainAnalysis}
        modalViewTab={modalViewTab}
        setModalViewTab={setModalViewTab}
        modalLevelFilter={modalLevelFilter}
        setModalLevelFilter={setModalLevelFilter}
        inputSupplyMode={inputSupplyMode}
        onClose={() => setSelectedTokenModal(null)}
      />
    </div>
  );
};
