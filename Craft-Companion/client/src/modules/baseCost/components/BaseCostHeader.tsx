import React from 'react';
import {
  ChecklistBoldDuotone,
  RestartBoldDuotone,
  DoubleAltArrowUpBoldDuotone,
  ImportBoldDuotone,
} from 'solar-icon-set';

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
  return (
    <div className="flex flex-col items-center text-center gap-3 select-none w-full">
      {/* Title & Live Status Centered */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <h1 className="font-game text-xl sm:text-2xl md:text-3xl text-white tracking-wide uppercase drop-shadow-md">
          Base Cost Calculator
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181c] text-[11px] font-mono shadow-sm">
          <span className={`inline-block w-2 h-2 rounded-full ${freshnessColor} animate-pulse`} />
          <span className="text-slate-400">upd</span>
          <span className="font-semibold text-slate-200">{secondsAgo}s</span>
        </div>
      </div>

      {/* Centered Description */}
      <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-sans leading-relaxed text-center px-2">
        Descomposición recursiva completa de costos de fabricación hasta las 5 materias elementales
        (Tierra, Agua, Fuego, Polvo, Madera) y cálculo de rentabilidad neta por unidad.
      </p>

      {/* Centered Responsive Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        {/* Import Button */}
        <button
          onClick={onImport}
          title="Copiar niveles de fábrica y maestrías desde la tabla de precios"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-md active:scale-95 ${
            justImported
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'bg-[#18181c] text-amber-400 hover:bg-[#222228] hover:text-amber-300'
          }`}
        >
          {justImported ? (
            <>
              <ChecklistBoldDuotone size={16} className="text-emerald-400" />
              <span>¡Configuración Importada!</span>
            </>
          ) : (
            <>
              <ImportBoldDuotone size={16} className="text-amber-400" />
              <span>Importar Precios/Niveles</span>
            </>
          )}
        </button>

        {/* Max Levels */}
        <button
          onClick={onMaxLevels}
          title="Ajustar todas las fábricas a su nivel máximo disponible"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#18181c] text-slate-300 hover:bg-[#222228] hover:text-white transition-all shadow-sm active:scale-95"
        >
          <DoubleAltArrowUpBoldDuotone size={16} className="text-amber-400" />
          <span>Max Niveles</span>
        </button>

        {/* Max Masteries */}
        <button
          onClick={onMaxMasteries}
          title="Ajustar todas las maestrías al nivel 10 (+5.25% rendimiento)"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#18181c] text-slate-300 hover:bg-[#222228] hover:text-white transition-all shadow-sm active:scale-95"
        >
          <DoubleAltArrowUpBoldDuotone size={16} className="text-purple-400" />
          <span>Max Maestrías</span>
        </button>

        {/* Reset All */}
        <button
          onClick={onResetAll}
          title="Restablecer todas las fábricas a Nivel 1 y Maestrías a 0"
          className="flex items-center justify-center p-2 rounded-xl bg-[#18181c] text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all shadow-sm active:scale-95"
        >
          <RestartBoldDuotone size={16} />
        </button>
      </div>
    </div>
  );
};
