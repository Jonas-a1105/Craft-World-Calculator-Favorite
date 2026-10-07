import React from 'react';
import type { FactorySummary } from '../types';
import { FactoryCard } from './FactoryCard';

export interface FactoryGridProps {
  summaries: FactorySummary[];
  onSelectFactory: (token: string) => void;
}

export const FactoryGrid: React.FC<FactoryGridProps> = ({
  summaries,
  onSelectFactory,
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {summaries.map((s) => (
        <FactoryCard key={s.token} summary={s} onSelect={onSelectFactory} />
      ))}
    </div>
  );
};
