import React from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useEncyclopedia } from '../modules/encyclopedia/hooks/useEncyclopedia';
import { EncyclopediaHeader } from '../modules/encyclopedia/components/EncyclopediaHeader';
import { CategoryChips } from '../modules/encyclopedia/components/CategoryChips';
import { SelectedBanner } from '../modules/encyclopedia/components/SelectedBanner';
import { StatSummaryCards } from '../modules/encyclopedia/components/StatSummaryCards';
import { ChartsRow } from '../modules/encyclopedia/components/ChartsRow';
import { ProgressionCards } from '../modules/encyclopedia/components/ProgressionCards';

export default function Encyclopedia() {
  const {
    selectedItem,
    selectedItemId,
    viewMode,
    search,
    levels,
    loading,
    summaryStats,
    filteredResources,
    filteredBuildings,
    setViewMode,
    setSearch,
    selectItem,
  } = useEncyclopedia();

  return (
    <Layout>
      <div className="w-full max-w-[1300px] mx-auto space-y-4 pb-12 px-2 sm:px-4 pt-1 sm:pt-2 overflow-x-hidden min-w-0">
        {/* Header */}
        <EncyclopediaHeader search={search} onSearchChange={setSearch} />

        {/* Categories / Selector chips */}
        <CategoryChips
          resources={filteredResources}
          buildings={filteredBuildings}
          selectedItemId={selectedItemId}
          onSelect={selectItem}
        />

        {loading ? (
          <SkeletonDashboardPage />
        ) : (
          <>
            {/* Selected Item Title & Badge */}
            <SelectedBanner item={selectedItem} />

            {/* 4 Summary Stat Cards */}
            <StatSummaryCards stats={summaryStats} />

            {/* 3 Metric Charts */}
            <ChartsRow levels={levels} />

            {/* Full 50-Level Progression Cards */}
            <ProgressionCards
              levels={levels}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
