import React from 'react';
import { useTranslation } from '../../../utils/i18n';

export const PlannerHeader: React.FC = () => {
  const { language } = useTranslation();

  return (
    <div className="text-center mt-3 mb-2 space-y-1.5 px-3">
      <h1
        className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
        style={{
          textShadow:
            '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
        }}
      >
        {language === 'es' ? 'Planificador de Recursos' : 'Resource Planner'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-xl mx-auto font-main">
        {language === 'es'
          ? 'Calcula insumos exactos, faltantes de inventario y la cadena de producción requerida.'
          : 'Calculate exact raw materials, stock deficits, and the step-by-step production chain.'}
      </p>
    </div>
  );
};
