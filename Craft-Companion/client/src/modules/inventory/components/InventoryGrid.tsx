import React from 'react';
import type { ValuedInventoryItem } from '../types';
import { InventoryResourceCard } from './InventoryResourceCard';

interface InventoryGridProps {
  items: ValuedInventoryItem[];
  activeCategory: string | null;
  expandedSymbol: string | null;
  language: string;
  onToggleExpand: (symbol: string) => void;
  onNavigateToResource: (symbol: string) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  activeCategory,
  expandedSymbol,
  language,
  onToggleExpand,
  onNavigateToResource,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-title text-xs md:text-sm text-white tracking-wide uppercase">
          {language === 'es' ? 'Recursos y Valor Individual' : 'Resources & Individual Value'}
        </h3>
        {activeCategory && (
          <span className="text-xs text-emerald-400 font-semibold">
            {items.length} {language === 'es' ? 'filtrados' : 'filtered'}
          </span>
        )}
      </div>

      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {items.map((item, idx) => (
            <InventoryResourceCard
              key={item.symbol || idx}
              item={item}
              isExpanded={expandedSymbol === item.symbol}
              language={language}
              onToggleExpand={() => onToggleExpand(item.symbol)}
              onNavigateToResource={onNavigateToResource}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6">
          {language === 'es'
            ? 'No se encontraron recursos en tu inventario.'
            : 'No resources found in your inventory.'}
        </p>
      )}
    </div>
  );
};
