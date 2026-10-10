import React, { useMemo } from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useProfitabilityTable } from '../hooks/useProfitabilityTable';
import { PricesAndProfitabilityHeader } from './PricesAndProfitabilityHeader';
import { CategoryTabsBar } from './CategoryTabsBar';
import { ProfitabilityCard } from './ProfitabilityCard';
import { ProfitabilitySummaryFooter } from './ProfitabilitySummaryFooter';
import { ProfitabilityModal } from './modal/ProfitabilityModal';
import { extractPriceMap } from '../../../services/priceService';
import { calculateFactoryCycle } from '../../../services/craftworldCalculations';
import { getAdjustedCycle } from '../services/cycleAdjuster';
import { computeValueChain, type ValueChainAnalysis } from '../../../services/valueChainCalculator';
import type { FactorySummary, AdjustedCycleResult } from '../types';

export const ProfitabilityDashboard: React.FC = () => {
  const {
    loading,
    homeData,
    allTableRows,
    filteredRows,
    totals,
    hasAnyAccountFactories,

    // Filters & Sorting
    category,
    setCategory,
    search,
    setSearch,

    // Global settings
    globalSettings,
    setGlobalSettings,

    // Actions
    incrementCount,
    decrementCount,
    setLevel,
    setMaxLevel,
    setAllLevelsMax,
    incrementMastery,
    decrementMastery,
    setBoost,
    resetToAccountData,

    // Favorites
    favorites,
    toggleFavorite,
    isFavorite,

    // Modal drill-down
    selectedTokenModal,
    setSelectedTokenModal,
    modalViewTab,
    setModalViewTab,
    modalLevelFilter,
    setModalLevelFilter,
    selectedRowForModal,
  } = useProfitabilityTable();

  const prices = useMemo(() => extractPriceMap(homeData), [homeData]);

  // Compute modal drill-down props when a row is selected
  const modalSummary: FactorySummary | undefined = useMemo(() => {
    if (!selectedRowForModal) return undefined;
    return {
      token: selectedRowForModal.token,
      ownedLevel: selectedRowForModal.accountCount > 0 ? selectedRowForModal.accountLevel : null,
      activeRow: selectedRowForModal.activeRow,
      cycle: {
        ...calculateFactoryCycle(selectedRowForModal.activeRow, prices, {
          factoryCount: Math.max(1, selectedRowForModal.count),
          manualBoostMultiplier:
            selectedRowForModal.boost === 'x2' || globalSettings.adBoost2x ? 2 : 1,
          workersPercent: selectedRowForModal.workerPercent,
          workshop: homeData?.craft?.workshop || [],
          proficiencies: homeData?.craft?.proficiencies || [],
        }),
        effectiveInputCost:
          selectedRowForModal.inputCostPerHour / Math.max(1, selectedRowForModal.runsPerHour),
        effectiveProfitPerCycle:
          selectedRowForModal.profitPerHour / Math.max(1, selectedRowForModal.runsPerHour),
        effectiveProfitPerHour: selectedRowForModal.profitPerHour,
        effectiveProfitPerDay: selectedRowForModal.profitPerDay,
      },
      allRows: selectedRowForModal.allRows,
      modifiers: [],
    };
  }, [selectedRowForModal, prices, homeData, globalSettings.adBoost2x]);

  const modalCycleResults: AdjustedCycleResult[] = useMemo(() => {
    if (!selectedRowForModal) return [];
    return selectedRowForModal.allRows.map((r) =>
      getAdjustedCycle({
        row: r,
        prices,
        context: {
          workshop: homeData?.craft?.workshop || [],
          proficiencies: homeData?.craft?.proficiencies || [],
          activeBoosts: [],
          manualBoostMultiplier:
            selectedRowForModal.boost === 'x2' || globalSettings.adBoost2x ? 2 : 1,
          workersPercent: selectedRowForModal.workerPercent,
        },
        inputSupplyMode: globalSettings.inputSupplyMode,
        allRows: selectedRowForModal.allRows,
        useMastery: true,
      }),
    );
  }, [selectedRowForModal, prices, homeData, globalSettings]);

  const modalChainAnalysis: ValueChainAnalysis | null = useMemo(() => {
    if (!selectedRowForModal) return null;
    try {
      return computeValueChain(
        selectedRowForModal.token,
        selectedRowForModal.level || 1,
        selectedRowForModal.allRows,
        prices,
        homeData?.craft?.proficiencies || [],
        globalSettings.inputSupplyMode === 'self_crafted' ? 'self_crafted' : 'market_buy',
      );
    } catch {
      return null;
    }
  }, [selectedRowForModal, prices, homeData, globalSettings]);

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  const activeCount = allTableRows.filter((r) => r.count > 0).length;
  const favoritesCount = allTableRows.filter((r) => isFavorite(r.token)).length;

  return (
    <div className="w-full max-w-[1280px] mx-auto space-y-6 pb-28 px-2 sm:px-4">
      {/* 1. Header with title & organized global simulation settings */}
      <PricesAndProfitabilityHeader
        settings={globalSettings}
        onUpdateSettings={(key, val) =>
          setGlobalSettings((prev) => ({ ...prev, [key]: val }))
        }
        hasActiveAccount={hasAnyAccountFactories}
        onResetAccount={resetToAccountData}
      />

      {/* 2. Category filter tabs & search input */}
      <CategoryTabsBar
        activeCategory={category}
        onSelectCategory={setCategory}
        search={search}
        onSearchChange={setSearch}
        favoritesCount={favoritesCount}
        activeCount={activeCount}
        totalCount={allTableRows.length}
        onMaxAllLevels={setAllLevelsMax}
      />

      {/* 3. Cards Grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredRows.map((row) => (
          <ProfitabilityCard
            key={row.token}
            row={row}
            isFavorite={isFavorite(row.token)}
            onToggleFavorite={() => toggleFavorite(row.token)}
            onOpenModal={() => setSelectedTokenModal(row.token)}
            onIncrementCount={() => incrementCount(row.token)}
            onDecrementCount={() => decrementCount(row.token)}
            onSetLevel={(lvl) => setLevel(row.token, lvl)}
            onSetMaxLevel={() => setMaxLevel(row.token)}
            onIncrementMastery={() => incrementMastery(row.token)}
            onDecrementMastery={() => decrementMastery(row.token)}
            onSetBoost={(b) => setBoost(row.token, b)}
          />
        ))}
      </div>

      {/* 4. Sticky Summary Footer Bar */}
      <ProfitabilitySummaryFooter totals={totals} />

      {/* 5. Deep Drill-Down Modal (Levels 1 to 50 & Value Chain Analysis) */}
      {selectedTokenModal && (
        <ProfitabilityModal
          summary={modalSummary}
          cycleResults={modalCycleResults}
          chainAnalysis={modalChainAnalysis}
          modalViewTab={modalViewTab}
          setModalViewTab={setModalViewTab}
          modalLevelFilter={modalLevelFilter}
          setModalLevelFilter={setModalLevelFilter}
          inputSupplyMode={globalSettings.inputSupplyMode}
          onClose={() => setSelectedTokenModal(null)}
        />
      )}
    </div>
  );
};
