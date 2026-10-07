import React from 'react';

interface EmpireHeaderProps {
  language: string;
}

export const EmpireHeader: React.FC<EmpireHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-4 mb-2">
      <h1
        className="text-xl sm:text-2xl font-title font-bold text-white tracking-wider uppercase"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)' }}
      >
        {language === 'es' ? 'Panel de Imperio' : 'Empire Dashboard'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto font-main">
        {language === 'es'
          ? 'Monitorea tus parcelas de tierra, fábricas asignadas, trabajadores y estructuras.'
          : 'Monitor your land plots, installed factories, workers, and structures.'}
      </p>
    </div>
  );
};
