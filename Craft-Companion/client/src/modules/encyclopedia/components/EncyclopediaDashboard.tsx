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
import { EventLandingView } from './EventLandingView';
import { OFFICIAL_EVENTS, getEventByCatalogId, getEventById } from '../data/eventsCatalog';

interface Props {
  mode?: 'encyclopedia' | 'events';
}

export const EncyclopediaDashboard: React.FC<Props> = ({ mode = 'encyclopedia' }) => {
  const {
    selectedItem,
    selectedItemId,
    search,
    levels,
    loading,
    summaryStats,
    filteredResources,
    filteredBuildings,
    filteredEvents,
    setSearch,
    selectItem,
  } = useEncyclopedia(mode);

  const isEvents = selectedItem.category === 'events';

  // Always safely resolve a valid OfficialEvent when in events category
  const activeEvent =
    getEventByCatalogId(selectedItem.id) ||
    getEventById(selectedItem.id) ||
    OFFICIAL_EVENTS[0];

  return (
    <Layout>
      <div className="w-full max-w-[1300px] mx-auto space-y-4 pb-12 px-2 sm:px-4 pt-1 sm:pt-2 overflow-x-hidden min-w-0">
        {/* Centered Clean Header */}
        <EncyclopediaHeader search={search} onSearchChange={setSearch} />

        {/* The actual Category Chips selector including Recursos, Edificios y Eventos */}
        <CategoryChips
          resources={filteredResources}
          buildings={filteredBuildings}
          events={filteredEvents}
          selectedItemId={selectedItemId}
          onSelect={selectItem}
          showEvents={true}
        />

        {/* Dynamic Content View */}
        {isEvents ? (
          <EventLandingView event={activeEvent} onSelectEvent={selectItem} />
        ) : loading ? (
          <SkeletonDashboardPage />
        ) : (
          <>
            <SelectedBanner item={selectedItem} />
            <StatSummaryCards stats={summaryStats} />
            <ChartsRow levels={levels} />
            <ProgressionCards levels={levels} />
          </>
        )}
      </div>
    </Layout>
  );
};
