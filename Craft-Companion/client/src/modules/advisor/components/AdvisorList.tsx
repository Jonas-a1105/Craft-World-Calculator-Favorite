import React from 'react';
import type { UpgradeRecommendation } from '../types';
import { AdvisorCard } from './AdvisorCard';

interface AdvisorListProps {
  recommendations: UpgradeRecommendation[];
  language: string;
}

export const AdvisorList: React.FC<AdvisorListProps> = ({
  recommendations,
  language,
}) => {
  if (recommendations.length === 0) {
    return (
      <div className="py-16 text-center text-zinc-500 bg-[#18181b] rounded-[32px] p-8 space-y-2 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold">
          {language === 'es'
            ? 'No se encontraron recomendaciones con los filtros seleccionados.'
            : 'No recommendations found matching your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {recommendations.slice(0, 40).map((rec, i) => (
        <AdvisorCard
          key={`${rec.row.token}-${rec.row.level}-${i}`}
          rec={rec}
          language={language}
        />
      ))}
    </div>
  );
};
