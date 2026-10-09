import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useResourceDetail } from '../hooks/useResourceDetail';
import { ResourceDetailHeader } from './ResourceDetailHeader';
import { ResourcePriceBanner } from './ResourcePriceBanner';
import { ResourceInteractiveChart } from './ResourceInteractiveChart';
import { ResourceMarketStatsCard } from './ResourceMarketStatsCard';
import { ResourceActivityList } from './ResourceActivityList';

export const ResourceDetailDashboard: React.FC = () => {
  const {
    symbol,
    language,
    loading,
    poolItem,
    chartSeries,
    activityTrades,
    activeTimeframe,
    setActiveTimeframe,
    activePoint,
    hoveredIndex,
    displayPrice,
    displayDiff,
    displayPct,
    displayIsUp,
    timeLabel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleBack,
  } = useResourceDetail();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto py-2 px-2 sm:px-4 space-y-6">
        <ResourceDetailHeader
          symbol={symbol}
          language={language}
          onBack={handleBack}
        />

        <ResourcePriceBanner
          displayPrice={displayPrice}
          displayDiff={displayDiff}
          displayPct={displayPct}
          displayIsUp={displayIsUp}
          timeLabel={timeLabel}
        />

        <ResourceInteractiveChart
          chartSeries={chartSeries}
          activePoint={activePoint}
          hoveredIndex={hoveredIndex}
          activeTimeframe={activeTimeframe}
          setActiveTimeframe={setActiveTimeframe}
          handlePointerDown={handlePointerDown}
          handlePointerMove={handlePointerMove}
          handlePointerUp={handlePointerUp}
          handlePointerCancel={handlePointerCancel}
        />

        {/* Real Ronin Katana DEX Market Metrics (ATH, ATL, Median, Average, TVL) */}
        <ResourceMarketStatsCard
          symbol={symbol}
          poolItem={poolItem}
          activeTimeframe={activeTimeframe}
        />

        <ResourceActivityList trades={activityTrades} />
      </div>
    </Layout>
  );
};
