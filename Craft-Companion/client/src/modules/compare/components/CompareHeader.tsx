import React from 'react';

export interface CompareHeaderProps {
  language: 'es' | 'en';
}

export const CompareHeader: React.FC<CompareHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
      <h1
        className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
        style={{
          textShadow:
            '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
        }}
      >
        {language === 'es' ? 'Comparar Fábricas' : 'Compare Factories'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
        {language === 'es'
          ? 'Análisis frente a frente de producción, rentabilidad y consumo entre dos opciones.'
          : 'Side-by-side head-to-head comparison of output, profitability, and costs.'}
      </p>
    </div>
  );
};
