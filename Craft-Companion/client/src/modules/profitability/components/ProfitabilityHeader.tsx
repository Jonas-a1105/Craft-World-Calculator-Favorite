import React from 'react';
import { useTranslation } from '../../../utils/i18n';

export const ProfitabilityHeader: React.FC = () => {
  const { language } = useTranslation();

  return (
    <div className="text-center mt-4 mb-2">
      <h1
        className="text-xl sm:text-2xl md:text-3xl font-title font-bold text-white tracking-wider uppercase"
        style={{
          textShadow:
            '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
        }}
      >
        {language === 'es'
          ? 'Centro de Rentabilidad por Fábrica'
          : 'Factory Profitability Center'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto font-main">
        {language === 'es'
          ? 'Explora cada fábrica en tarjetas. Haz clic en cualquiera para desplegar su rentabilidad nivel por nivel (1 al 40).'
          : 'Explore each factory type. Click any card to inspect full level-by-level profitability (Levels 1 to 40).'}
      </p>
    </div>
  );
};
