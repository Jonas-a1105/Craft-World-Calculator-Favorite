import React from 'react';

interface AdvisorHeaderProps {
  language: string;
}

export const AdvisorHeader: React.FC<AdvisorHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
      <h1
        className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
        style={{
          textShadow:
            '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
        }}
      >
        {language === 'es' ? 'Asesor de Mejoras' : 'Upgrade Advisor'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
        {language === 'es'
          ? 'Recomendaciones inteligentes de subida de nivel ordenadas por retorno de inversión (ROI).'
          : 'Smart level upgrade recommendations ranked by return on investment (ROI).'}
      </p>
    </div>
  );
};
