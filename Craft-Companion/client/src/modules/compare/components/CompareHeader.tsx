import React from 'react';

export interface CompareHeaderProps {
  language: 'es' | 'en';
}

export const CompareHeader: React.FC<CompareHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-3 mb-2 space-y-2 px-3 select-none">
      <h1 className="font-game font-impostor text-white drop-shadow-md text-2xl sm:text-3xl md:text-4xl tracking-wider uppercase">
        {language === 'es' ? 'Comparar Fábricas' : 'Compare Factories'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-xl mx-auto">
        {language === 'es'
          ? 'Análisis frente a frente de producción, rentabilidad y consumo entre dos opciones.'
          : 'Side-by-side head-to-head comparison of output, profitability, and costs.'}
      </p>
    </div>
  );
};
