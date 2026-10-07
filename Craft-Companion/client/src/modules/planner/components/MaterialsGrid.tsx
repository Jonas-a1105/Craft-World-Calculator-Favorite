import React from 'react';
import type { MaterialEntry } from '../types';
import { MaterialCard } from './MaterialCard';

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
      <div className="py-12 text-center text-zinc-500 space-y-2">
        <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto text-zinc-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold">
          {language === 'es'
            ? 'No hay materiales en esta categoría.'
            : 'No materials found in this category.'}
        </p>
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
