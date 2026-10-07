import React from 'react';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useTranslation } from '../../../utils/i18n';
import { useMatrix } from '../hooks/useMatrix';
import { MatrixHeader } from './MatrixHeader';
import { MatrixSettingsBar } from './MatrixSettingsBar';
import { MatrixCategoryFilterBar } from './MatrixCategoryFilterBar';
import { MatrixHeatmapTable } from './MatrixHeatmapTable';
import { MatrixSearchTable } from './MatrixSearchTable';

export const MatrixDashboard: React.FC = () => {
  const { language } = useTranslation();
  const {
    loading,
    viewMode,
    setViewMode,
    adBoost2x,
    setAdBoost2x,
    factoryBoost,
    setFactoryBoost,
    buySlippage,
    setBuySlippage,
    sellSlippage,
    setSellSlippage,
    powerPrice,
    setPowerPrice,
    selectedCategory,
    setSelectedCategory,
    priceMap,
    setPriceMap,
    handleResetPrices,
    masteryMap,
    setMasteryForResource,
    openMasteryRes,
    setOpenMasteryRes,
    tableSearch,
    setTableSearch,
    visibleResources,
    availableResources,
    levels,
    rows,
    boostOptions,
    getCellProfit,
  } = useMatrix();

  if (loading) {
    return <SkeletonDashboardPage />;
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-3 px-2 sm:px-3 pb-12">
      {/* HEADER & SETTINGS TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        <MatrixHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          language={language}
        />

        <MatrixSettingsBar
          adBoost2x={adBoost2x}
          setAdBoost2x={setAdBoost2x}
          buySlippage={buySlippage}
          setBuySlippage={setBuySlippage}
          sellSlippage={sellSlippage}
          setSellSlippage={setSellSlippage}
          factoryBoost={factoryBoost}
          setFactoryBoost={setFactoryBoost}
          boostOptions={boostOptions}
          powerPrice={powerPrice}
          setPowerPrice={setPowerPrice}
        />
      </div>

      {/* SUBHEADER: CATEGORY FILTER CAROUSEL + METRICS + RESET */}
      <MatrixCategoryFilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        visibleResourcesCount={visibleResources.length}
        totalResourcesCount={availableResources.length}
        onResetPrices={handleResetPrices}
        language={language}
      />

      {/* VIEW 1: PROFIT MATRIX HEATMAP GRID */}
      {viewMode === 'matrix' && (
        <MatrixHeatmapTable
          visibleResources={visibleResources}
          levels={levels}
          masteryMap={masteryMap}
          setMasteryForResource={setMasteryForResource}
          openMasteryRes={openMasteryRes}
          setOpenMasteryRes={setOpenMasteryRes}
          priceMap={priceMap}
          setPriceMap={setPriceMap}
          getCellProfit={getCellProfit}
        />
      )}

      {/* VIEW 2: TRADITIONAL SEARCHABLE RECIPE TABLE */}
      {viewMode === 'table' && (
        <MatrixSearchTable
          rows={rows}
          tableSearch={tableSearch}
          setTableSearch={setTableSearch}
          language={language}
        />
      )}
    </div>
  );
};
