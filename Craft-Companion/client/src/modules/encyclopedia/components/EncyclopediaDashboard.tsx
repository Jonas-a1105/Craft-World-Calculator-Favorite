import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useEncyclopedia } from '../hooks/useEncyclopedia';
import { EncyclopediaHeader } from './EncyclopediaHeader';
import { CategoryChips } from './CategoryChips';
import { SelectedBanner } from './SelectedBanner';
import { StatSummaryCards } from './StatSummaryCards';
import { ChartsRow } from './ChartsRow';
import { ProgressionCards } from './ProgressionCards';

export const EncyclopediaDashboard: React.FC = () => {
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
        <EncyclopediaHeader search={search} onSearchChange={setSearch} />

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
            <SelectedBanner item={selectedItem} />
            <StatSummaryCards stats={summaryStats} />
            <ChartsRow levels={levels} />
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
};
