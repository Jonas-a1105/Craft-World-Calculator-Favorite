import React from 'react';
import Layout from '../../../components/Layout';
import { SkeletonDashboardPage } from '../../../components/Skeleton';
import { useUpgradeSimulator } from '../hooks/useUpgradeSimulator';
import { UpgradeSimulatorHeader } from './UpgradeSimulatorHeader';
import { CategoryTabsBar } from './CategoryTabsBar';
import { UpgradeCategorySection } from './UpgradeCategorySection';
import { ShoppingListSection } from './ShoppingListSection';
import type { CategoryTab } from '../types';

const CATEGORY_ORDER: CategoryTab[] = [
  'earth',
  'water',
  'fire',
  'special',
  'keys',
  'nests',
  'wraps',
  'academy',
  'construction',
];

export const UpgradeSimulatorDashboard: React.FC = () => {
  const {
    language,
    loading,
    activeCategory,
    setActiveCategory,
    rows,
    totalFacilitiesCount,
    shoppingListItems,
    consolidatedResources,
    shoppingListTotalCoin,
    updateFromLevel,
    updateToLevel,
    updateQty,
    toggleCart,
    resetAll,
    baseSymbol,
  } = useUpgradeSimulator();

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  // Categories to render
  const categoriesToRender: CategoryTab[] =
    activeCategory === 'all' ? CATEGORY_ORDER : [activeCategory];

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-16">
        {/* Centered Header */}
        <UpgradeSimulatorHeader
          language={language}
          totalFacilities={totalFacilitiesCount}
        />

        {/* Category Tabs & Reset Action */}
        <CategoryTabsBar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onReset={resetAll}
          language={language}
        />

        {/* Grouped Category Sections */}
        <div className="space-y-6">
          {categoriesToRender.map((cat) => {
            const catRows = rows.filter((r) => r.category === cat);
            return (
              <UpgradeCategorySection
                key={cat}
                category={cat}
                rows={catRows}
                onFromChange={updateFromLevel}
                onToChange={updateToLevel}
                onQtyChange={updateQty}
                onToggleCart={toggleCart}
                baseSymbol={baseSymbol}
                language={language}
              />
            );
          })}
        </div>

        {/* Shopping List Section */}
        <ShoppingListSection
          items={shoppingListItems}
          consolidated={consolidatedResources}
          totalCoin={shoppingListTotalCoin}
          baseSymbol={baseSymbol}
          language={language}
        />
      </div>
    </Layout>
  );
};
