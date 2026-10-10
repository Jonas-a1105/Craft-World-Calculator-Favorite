import React from 'react';
import type { MaterialEntry } from '../types';
import { MaterialCard } from './MaterialCard';

import { CheckCircleBold } from 'solar-icon-set';

export interface MaterialsGridProps {
  filteredMaterialEntries: MaterialEntry[];
  language: 'es' | 'en';
}

export const MaterialsGrid: React.FC<MaterialsGridProps> = ({
  filteredMaterialEntries,
  language,
}) => {
  if (filteredMaterialEntries.length === 0) {
    return (
      <div className="rounded-[32px] bg-[#18181b] border border-zinc-800/80 p-12 text-center text-zinc-500 space-y-3 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircleBold className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-bold text-zinc-200">
            {language === 'es' ? '¡Todo cubierto!' : 'All clear!'}
          </p>
          <p className="text-xs text-zinc-400">
            {language === 'es'
              ? 'No hay materiales pendientes en esta categoría.'
              : 'No pending materials in this category.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredMaterialEntries.map((material) => (
        <MaterialCard
          key={material.symbol}
          material={material}
          language={language}
        />
      ))}
    </div>
  );
};
