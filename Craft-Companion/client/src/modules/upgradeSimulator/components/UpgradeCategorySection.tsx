import React from 'react';
import type { FactoryUpgradeRow, CategoryTab } from '../types';
import { CATEGORY_TABS } from '../data/upgradeSimulatorCatalog';
import { FactoryUpgradeCard } from './FactoryUpgradeCard';

interface UpgradeCategorySectionProps {
  category: CategoryTab;
  rows: FactoryUpgradeRow[];
  onFromChange: (token: string, from: number) => void;
  onToChange: (token: string, to: number) => void;
  onQtyChange: (token: string, qty: number) => void;
  onToggleCart: (token: string) => void;
  baseSymbol: string;
  language: string;
}

export const UpgradeCategorySection: React.FC<UpgradeCategorySectionProps> = ({
  category,
  rows,
  onFromChange,
  onToChange,
  onQtyChange,
  onToggleCart,
  baseSymbol,
  language,
}) => {
  if (rows.length === 0) return null;

  const isEs = language === 'es';
  const meta = CATEGORY_TABS.find((c) => c.id === category);
  const title = meta ? (isEs ? meta.labelEs : meta.labelEn).toUpperCase() : category.toUpperCase();
  const colorClass = meta?.colorClass || 'text-amber-400';

  return (
    <div className="space-y-2 select-none">
      {/* Category Section Header */}
      <div className="flex items-center gap-2 pt-2 pb-1">
        <span className={`text-xs font-mono font-black tracking-wider ${colorClass}`}>
          {title}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Facilities Cards List */}
      <div className="space-y-2">
        {rows.map((row) => (
          <FactoryUpgradeCard
            key={row.token}
            row={row}
            onFromChange={onFromChange}
            onToChange={onToChange}
            onQtyChange={onQtyChange}
            onToggleCart={onToggleCart}
            baseSymbol={baseSymbol}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
