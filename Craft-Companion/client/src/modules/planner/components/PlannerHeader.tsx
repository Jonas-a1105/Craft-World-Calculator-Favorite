import React from 'react';
import { useTranslation } from '../../../utils/i18n';

export const PlannerHeader: React.FC = () => {
  const { language } = useTranslation();

  return (
    <div className="text-center mt-3 mb-2 space-y-2 px-3">
      <h1 className="font-game font-impostor text-xl sm:text-2xl md:text-3xl text-white tracking-wider uppercase drop-shadow-md select-none">
        {language === 'es' ? 'Planificador de Recursos' : 'Resource Planner'}
      </h1>
      <p className="text-xs sm:text-sm font-medium text-zinc-400 max-w-xl mx-auto">
        {language === 'es'
          ? 'Calcula insumos exactos, faltantes de inventario y optimiza la ruta de compras o crafteo para tu meta.'
          : 'Calculate exact raw materials, stock deficits, and optimize buy vs craft route for your goal.'}
      </p>
    </div>
  );
};
