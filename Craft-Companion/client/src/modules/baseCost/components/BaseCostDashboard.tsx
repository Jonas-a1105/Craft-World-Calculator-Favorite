import React, { useMemo } from 'react';
import Layout from '../../../components/Layout';
import { useBaseCost } from '../hooks/useBaseCost';
import { BaseCostHeader } from './BaseCostHeader';
import { BaseCostInfiniteMarquee } from './BaseCostInfiniteMarquee';
import { BaseCostSettingsBar } from './BaseCostSettingsBar';
import { BaseCostCardView } from './BaseCostCardView';

export const BaseCostDashboard: React.FC = () => {
  const {
    settings,
    filteredRows,
    allRows,
    prices,
    isPricesLoading,
    secondsAgo,
    freshnessColor,
    justImported,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    strategyFilter,
    setStrategyFilter,
    setLevel,
    setMastery,
    setMaxAllLevels,
    setMaxAllMasteries,
    resetAll,
    importFromPriceTable,
    updateSettings,
  } = useBaseCost();

  // Marquee items: Elemental base resources + all crafted items passing infinitely
  const marqueeItems = useMemo(() => {
    const elemental = [
      { token: 'EARTH', name: 'Earth', price: prices.EARTH ?? 0, category: 'Base' },
      { token: 'WATER', name: 'Water', price: prices.WATER ?? 0, category: 'Base' },
      { token: 'FIRE', name: 'Fire', price: prices.FIRE ?? 0, category: 'Base' },
      { token: 'DUST', name: 'Dust', price: prices.DUST ?? 0, category: 'Base' },
      { token: 'LUMBER', name: 'Lumber', price: prices.LUMBER ?? 0, category: 'Base' },
    ];
    const crafted = allRows.map((r) => ({
      token: r.token,
      name: r.name,
      price: r.sellPrice > 0 ? r.sellPrice : (prices[r.token] ?? 0),
      category: r.category,
    }));
    return [...elemental, ...crafted];
  }, [prices, allRows]);

  return (
    <Layout>
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-16 px-2 sm:px-4">
        {/* Module Header */}
        <BaseCostHeader
          secondsAgo={secondsAgo}
          freshnessColor={freshnessColor}
          justImported={justImported}
          onImport={importFromPriceTable}
          onMaxLevels={setMaxAllLevels}
          onMaxMasteries={setMaxAllMasteries}
          onResetAll={resetAll}
        />

        {/* Automatic Infinite Scroll Marquee of Resources with Live Prices */}
        <BaseCostInfiniteMarquee items={marqueeItems} />

        {/* Financial Settings, Filters & Category Tabs */}
        <BaseCostSettingsBar
          settings={settings}
          search={search}
          selectedCategory={selectedCategory}
          strategyFilter={strategyFilter}
          onUpdateSettings={updateSettings}
          onSearchChange={setSearch}
          onSelectCategory={setSelectedCategory}
          onStrategyFilterChange={setStrategyFilter}
        />

        {/* Resource Cards View */}
        {isPricesLoading && filteredRows.length === 0 ? (
          <div className="rounded-[32px] bg-[#18181c] p-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <span>Sincronizando cotizaciones en vivo de la red Ronin...</span>
          </div>
        ) : (
          <BaseCostCardView
            rows={filteredRows}
            strategyFilter={strategyFilter}
            onLevelChange={setLevel}
            onMasteryChange={setMastery}
          />
        )}
      </div>
    </Layout>
  );
};
