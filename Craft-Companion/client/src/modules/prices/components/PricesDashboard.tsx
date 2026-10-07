import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useMarketPrices } from '../hooks/useMarketPrices';
import { PricesHeader } from './PricesHeader';
import { PricesSearchBar } from './PricesSearchBar';
import { PricesGrid } from './PricesGrid';

export const PricesDashboard: React.FC = () => {
  const {
    language,
    loading,
    search,
    setSearch,
    baseSymbol,
    filteredPrices,
  } = useMarketPrices();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6">
        <PricesHeader language={language} />

        <PricesSearchBar
          search={search}
          onSearchChange={setSearch}
          baseSymbol={baseSymbol}
          language={language}
        />

        <PricesGrid
          prices={filteredPrices}
          language={language}
        />
      </div>
    </Layout>
  );
};
