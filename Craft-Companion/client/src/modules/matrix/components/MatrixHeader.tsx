import React from 'react';
import type { MatrixViewMode } from '../types';

export interface MatrixHeaderProps {
  viewMode: MatrixViewMode;
  setViewMode: (mode: MatrixViewMode) => void;
  language: 'es' | 'en';
}

export const MatrixHeader: React.FC<MatrixHeaderProps> = ({
  viewMode,
  setViewMode,
  language,
}) => {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h1
          className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
          style={{
            textShadow:
              '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
          }}
        >
          {language === 'es' ? 'Matriz de Ganancias' : 'Profit Matrix'}
        </h1>
        <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-full border-none">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
              viewMode === 'matrix'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            {language === 'es' ? 'Matriz' : 'Matrix'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
              viewMode === 'table'
                ? 'bg-[#27272a] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-transparent'
            }`}
          >
            {language === 'es' ? 'Lista' : 'Table'}
          </button>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-main">
        {language === 'es'
          ? 'Matriz dinámica para consultar la rentabilidad por recurso en tiempo real. Ajusta maestrías, slippage y costos para evaluar cada nivel de fábrica.'
          : 'Dynamic matrix to check for resource profitability at a glance. Adjust masteries, slippage, and power cost.'}
      </p>
    </div>
  );
};
