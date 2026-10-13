import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../utils/i18n';

/**
 * Navegación cruzada del hub analítico (LP7): las tres herramientas de
 * decisión económica comparten pestañas para que el usuario entienda que son
 * una sola familia (simular rentabilidad → decidir mejora → descomponer
 * costes) sin obligar a navegar por el dock de 15 iconos.
 */
const TABS = [
  {
    path: '/profitability',
    labelEs: 'Rentabilidad',
    labelEn: 'Profitability',
  },
  {
    path: '/upgrade-advisor',
    labelEs: 'Asesor de Mejoras',
    labelEn: 'Upgrade Advisor',
  },
  {
    path: '/base-cost',
    labelEs: 'Costo Base',
    labelEn: 'Base Cost',
  },
];

export const AnalyticsHubTabs: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useTranslation();
  const location = useLocation();
  const isEs = language === 'es';

  return (
    <nav
      role="tablist"
      aria-label={isEs ? 'Herramientas de análisis económico' : 'Economic analysis tools'}
      className={`flex items-center justify-center gap-1.5 p-1 rounded-full bg-oled-card w-fit mx-auto ${className}`}
    >
      {TABS.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            role="tab"
            aria-selected={active}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              active
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-oled-pill'
            }`}
          >
            {isEs ? tab.labelEs : tab.labelEn}
          </Link>
        );
      })}
    </nav>
  );
};

export default AnalyticsHubTabs;
