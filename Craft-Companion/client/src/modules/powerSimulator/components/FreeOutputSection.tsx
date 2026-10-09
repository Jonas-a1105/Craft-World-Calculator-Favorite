import React from 'react';
import { formatPower } from '../services/powerCalculatorService';

interface FreeOutputSectionProps {
  airstreamHourly: number;
  sunforgeHourly: number;
  freePowerDaily: number;
  language: string;
}

export const FreeOutputSection: React.FC<FreeOutputSectionProps> = ({
  airstreamHourly,
  sunforgeHourly,
  freePowerDaily,
  language,
}) => {
  const isEs = language === 'es';
  const totalHourly = airstreamHourly + sunforgeHourly;

  if (totalHourly <= 0) {
    return (
      <div className="p-5 rounded-2xl border-none bg-[#17171d] text-center text-xs font-mono text-slate-500 select-none shadow-inner">
        {isEs
          ? 'Selecciona un nivel en tus plantas pasivas para calcular tu producción gratuita.'
          : 'Select a level in your passive plants to calculate your free output.'}
      </div>
    );
  }

  const airFraction = totalHourly > 0 ? airstreamHourly / totalHourly : 0;
  const sunFraction = totalHourly > 0 ? sunforgeHourly / totalHourly : 0;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-4 border-none outline-none select-none">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
          {isEs ? 'PRODUCCIÓN GRATUITA' : 'FREE OUTPUT'}
        </h3>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold">
          100% {isEs ? 'sin coste de operación' : 'no running cost'}
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2.5 font-mono text-xs">
        {/* Airstream Bar */}
        {airstreamHourly > 0 && (
          <div className="flex items-center gap-3">
            <span className="w-24 text-[11px] text-slate-400 font-medium shrink-0 truncate">
              AIRSTREAM
            </span>
            <div className="flex-1 h-2 rounded-full bg-[#131316] overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(4, airFraction * 100)}%` }}
              />
            </div>
            <span className="w-20 text-right text-xs font-bold text-slate-200 shrink-0">
              {formatPower(airstreamHourly)} / h
            </span>
          </div>
        )}

        {/* Sunforge Bar */}
        {sunforgeHourly > 0 && (
          <div className="flex items-center gap-3">
            <span className="w-24 text-[11px] text-slate-400 font-medium shrink-0 truncate">
              SUNFORGE
            </span>
            <div className="flex-1 h-2 rounded-full bg-[#131316] overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(4, sunFraction * 100)}%` }}
              />
            </div>
            <span className="w-20 text-right text-xs font-bold text-slate-200 shrink-0">
              {formatPower(sunforgeHourly)} / h
            </span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 font-mono">
        <div className="p-3 rounded-2xl bg-[#131316] shadow-inner text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            {isEs ? 'Energía gratis / h' : 'Free power / h'}
          </span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {formatPower(totalHourly)}
            </span>
            <span className="text-[10px] text-slate-500">kW</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#131316] shadow-inner text-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
            {isEs ? 'Energía gratis / día' : 'Free power / day'}
          </span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {formatPower(freePowerDaily)}
            </span>
            <span className="text-[10px] text-slate-500">kW</span>
          </div>
        </div>
      </div>
    </div>
  );
};
