import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useInventoryValue } from '../hooks/useInventoryValue';
import { InventoryTotalHeader } from './InventoryTotalHeader';
import { InventoryExecutiveAnalyticsCard } from './InventoryExecutiveAnalyticsCard';
import { InventoryCategoryFilterBar } from './InventoryCategoryFilterBar';
import { InventoryGrid } from './InventoryGrid';

export const InventoryValueDashboard: React.FC = () => {
  const {
    language,
    loading,
    totalValue,
    resourceCount,
    activeCategory,
    expandedSymbol,
    filteredItems,
    toggleExpand,
    selectCategory,
    handleNavigateToResource,
  } = useInventoryValue();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6 pt-2 select-none">
        <InventoryTotalHeader
          totalValue={totalValue}
          resourceCount={resourceCount}
          language={language}
        />

        <InventoryCategoryFilterBar
          activeCategory={activeCategory}
          onSelectCategory={selectCategory}
          language={language}
        />

        <InventoryExecutiveAnalyticsCard
          items={filteredItems}
          totalValue={totalValue}
          language={language}
        />

        <InventoryGrid
          items={filteredItems}
          activeCategory={activeCategory}
          expandedSymbol={expandedSymbol}
          language={language}
          onToggleExpand={toggleExpand}
          onNavigateToResource={handleNavigateToResource}
        />
      </div>
    </Layout>
  );
};
