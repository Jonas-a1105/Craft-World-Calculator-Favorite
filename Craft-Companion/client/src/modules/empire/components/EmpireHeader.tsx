import React from 'react';

interface EmpireHeaderProps {
  language: string;
}

export const EmpireHeader: React.FC<EmpireHeaderProps> = ({ language }) => {
  return (
    <div className="text-center mt-3 mb-2 space-y-1.5 px-3 select-none">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-game font-impostor text-white tracking-wider uppercase drop-shadow-md">
        {language === 'es' ? 'Panel de Imperio' : 'Empire Dashboard'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-xl mx-auto">
        {language === 'es'
          ? 'Monitorea tus parcelas de tierra, fábricas asignadas, trabajadores y estructuras.'
          : 'Monitor your land plots, installed factories, workers, and structures.'}
      </p>
    </div>
  );
};
