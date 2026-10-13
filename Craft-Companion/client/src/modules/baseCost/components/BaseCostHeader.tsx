import React from 'react';
import {
  ChecklistBoldDuotone,
  RestartBoldDuotone,
  DoubleAltArrowUpBoldDuotone,
  ImportBoldDuotone,
} from 'solar-icon-set';
import { PriceTrustBanner } from '../../../components/PriceTrustBanner';
import { useTranslation } from '../../../utils/i18n';

interface BaseCostHeaderProps {
  secondsAgo: number;
  freshnessColor: string;
  justImported: boolean;
  onImport: () => void;
  onMaxLevels: () => void;
  onMaxMasteries: () => void;
  onResetAll: () => void;
}

export const BaseCostHeader: React.FC<BaseCostHeaderProps> = ({
  secondsAgo,
  freshnessColor,
  justImported,
  onImport,
  onMaxLevels,
  onMaxMasteries,
  onResetAll,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="flex flex-col items-center text-center gap-3 select-none w-full">
      {/* Title & Live Status Centered */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <h1 className="font-game text-xl sm:text-2xl md:text-3xl text-white tracking-wide uppercase drop-shadow-md">
          {isEs ? 'Calculadora de Costo Base' : 'Base Cost Calculator'}
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-oled-card text-[11px] font-mono shadow-md border-none">
          <span className={`inline-block w-2 h-2 rounded-full ${freshnessColor} animate-pulse`} />
          <span className="text-slate-400">upd</span>
          <span className="font-semibold text-slate-200">{secondsAgo}s</span>
        </div>
      </div>

      {/* Game priceList staleness warning — shared global trust component (QW2) */}
      <PriceTrustBanner />

      {/* Centered Description */}
      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans leading-relaxed text-center px-2">
        {isEs
          ? 'Descomposición recursiva completa de costos de fabricación hasta las 5 materias elementales (Tierra, Agua, Fuego, Polvo, Madera) y cálculo de rentabilidad neta por unidad.'
          : 'Full recursive breakdown of manufacturing costs down to the 5 elemental raw materials (Earth, Water, Fire, Dust, Lumber) and net profit per unit.'}
      </p>

      {/* Centered Responsive Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        {/* Import Button */}
        <button
          onClick={onImport}
          title={isEs
            ? 'Copiar niveles de fábrica y maestrías desde la tabla de precios'
            : 'Copy factory levels and masteries from the price table'}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-md active:scale-95 border-none cursor-pointer ${
            justImported
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'bg-oled-card text-amber-400 hover:bg-oled-pillHover hover:text-amber-300'
          }`}
        >
          {justImported ? (
            <>
              <ChecklistBoldDuotone size={16} className="text-emerald-400" />
              <span>{isEs ? '¡Configuración Importada!' : 'Settings Imported!'}</span>
            </>
          ) : (
            <>
              <ImportBoldDuotone size={16} className="text-amber-400" />
              <span>{isEs ? 'Importar Precios/Niveles' : 'Import Prices/Levels'}</span>
            </>
          )}
        </button>

        {/* Max Levels */}
        <button
          onClick={onMaxLevels}
          title={isEs
            ? 'Ajustar todas las fábricas a su nivel máximo disponible'
            : 'Set all factories to their available max level'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-oled-card text-slate-300 hover:bg-oled-pillHover hover:text-white transition-all shadow-md active:scale-95 border-none cursor-pointer"
        >
          <DoubleAltArrowUpBoldDuotone size={16} className="text-amber-400" />
          <span>{isEs ? 'Max Niveles' : 'Max Levels'}</span>
        </button>

        {/* Max Masteries */}
        <button
          onClick={onMaxMasteries}
          title={isEs
            ? 'Ajustar todas las maestrías al nivel 10 (+5.25% rendimiento)'
            : 'Set all masteries to level 10 (+5.25% yield)'}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-oled-card text-slate-300 hover:bg-oled-pillHover hover:text-white transition-all shadow-md active:scale-95 border-none cursor-pointer"
        >
          <DoubleAltArrowUpBoldDuotone size={16} className="text-purple-400" />
          <span>{isEs ? 'Max Maestrías' : 'Max Masteries'}</span>
        </button>

        {/* Reset All */}
        <button
          onClick={onResetAll}
          title={isEs
            ? 'Restablecer todas las fábricas a Nivel 1 y Maestrías a 0'
            : 'Reset all factories to Level 1 and Masteries to 0'}
          aria-label={isEs ? 'Restablecer todo' : 'Reset all'}
          className="flex items-center justify-center p-2 rounded-xl bg-oled-card text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all shadow-md active:scale-95 border-none cursor-pointer"
        >
          <RestartBoldDuotone size={16} />
        </button>
      </div>
    </div>
  );
};
