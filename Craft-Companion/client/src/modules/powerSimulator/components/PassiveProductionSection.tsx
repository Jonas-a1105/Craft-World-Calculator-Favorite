import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import {
  AIRSTREAM_LEVELS,
  SUNFORGE_LEVELS,
} from '../data/powerSimulatorData';
import { formatPower } from '../services/powerCalculatorService';
import { CustomPlantLevelSelect } from './CustomPlantLevelSelect';
import type { PlantState } from '../types';

interface PassiveProductionSectionProps {
  airstream: PlantState;
  sunforge: PlantState;
  airstreamHourly: number;
  sunforgeHourly: number;
  onAirstreamLevelChange: (level: number) => void;
  onAirstreamCountChange: (count: number) => void;
  onSunforgeLevelChange: (level: number) => void;
  onSunforgeCountChange: (count: number) => void;
  language: string;
}

export const PassiveProductionSection: React.FC<PassiveProductionSectionProps> = ({
  airstream,
  sunforge,
  airstreamHourly,
  sunforgeHourly,
  onAirstreamLevelChange,
  onAirstreamCountChange,
  onSunforgeLevelChange,
  onSunforgeCountChange,
  language,
}) => {
  const isEs = language === 'es';

  // Max counts for current levels
  const currentAirLevel = AIRSTREAM_LEVELS.find((l) => l.level === airstream.level);
  const airMaxCount = currentAirLevel?.maxCount ?? 8;

  const currentSunLevel = SUNFORGE_LEVELS.find((l) => l.level === sunforge.level);
  const sunMaxCount = currentSunLevel?.maxCount ?? 5;

  return (
    <div className="space-y-3 select-none">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-mono font-bold text-slate-300 tracking-wider uppercase">
          {isEs ? 'PRODUCCIÓN PASIVA' : 'PASSIVE PRODUCTION'}
        </h2>
        <p className="text-xs font-mono text-slate-500 mt-0.5">
          {isEs
            ? 'Plantas pasivas — sin costo de operación. Utilizadas como reducción gratuita en las secciones inferiores.'
            : 'Passive plants — no running cost. Used as a free offset in the sections below.'}
        </p>
      </div>

      {/* Grid of 2 Passive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AIRSTREAM CARD */}
        <div className="p-4 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-3 border-none outline-none">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#131316] flex items-center justify-center p-1.5 shadow-inner shrink-0">
              <ResourceIcon symbol="Airstream" size={26} />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-sm font-bold text-white tracking-wide">
                AIRSTREAM
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {isEs ? 'Turbina eólica — pasiva, ciclo de 5 min' : 'Wind turbine — passive, 5 min cycle'}
              </div>
            </div>
          </div>

          {/* Level Dropdown */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
              {isEs ? 'Nivel' : 'Level'}
            </span>
            <div className="flex-1 min-w-0">
              <CustomPlantLevelSelect
                levels={AIRSTREAM_LEVELS}
                currentLevel={airstream.level}
                onChange={onAirstreamLevelChange}
                language={language}
              />
            </div>
          </div>

          {/* Count Stepper & Output */}
          {airstream.level > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
                  {isEs ? 'Cant.' : 'Count'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAirstreamCountChange(Math.max(1, airstream.count - 1))}
                    disabled={airstream.count <= 1}
                    className="w-7 h-7 rounded-lg bg-[#131316] hover:bg-[#23232c] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-mono text-xs font-bold text-white">
                    {airstream.count}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAirstreamCountChange(Math.min(airMaxCount, airstream.count + 1))}
                    disabled={airstream.count >= airMaxCount}
                    className="w-7 h-7 rounded-lg bg-[#131316] hover:bg-[#23232c] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                  >
                    +
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 ml-1">
                    / {airMaxCount} {isEs ? 'máx' : 'max'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">
                  {isEs ? 'Energía por hora' : 'Power per hour'}
                </span>
                <span className="text-base font-mono font-black text-[#38BDF8]">
                  {formatPower(airstreamHourly)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SUNFORGE CARD */}
        <div className="p-4 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-3 border-none outline-none">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#131316] flex items-center justify-center p-1.5 shadow-inner shrink-0">
              <ResourceIcon symbol="Sunforge" size={26} />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-sm font-bold text-white tracking-wide">
                SUNFORGE
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {isEs ? 'Panel solar — pasivo, ciclo de 4 h' : 'Solar panel — passive, 4 h cycle'}
              </div>
            </div>
          </div>

          {/* Level Dropdown */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
              {isEs ? 'Nivel' : 'Level'}
            </span>
            <div className="flex-1 min-w-0">
              <CustomPlantLevelSelect
                levels={SUNFORGE_LEVELS}
                currentLevel={sunforge.level}
                onChange={onSunforgeLevelChange}
                language={language}
              />
            </div>
          </div>

          {/* Count Stepper & Output */}
          {sunforge.level > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 w-12 shrink-0">
                  {isEs ? 'Cant.' : 'Count'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSunforgeCountChange(Math.max(1, sunforge.count - 1))}
                    disabled={sunforge.count <= 1}
                    className="w-7 h-7 rounded-lg bg-[#131316] hover:bg-[#23232c] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-mono text-xs font-bold text-white">
                    {sunforge.count}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSunforgeCountChange(Math.min(sunMaxCount, sunforge.count + 1))}
                    disabled={sunforge.count >= sunMaxCount}
                    className="w-7 h-7 rounded-lg bg-[#131316] hover:bg-[#23232c] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-none outline-none shadow-inner"
                  >
                    +
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 ml-1">
                    / {sunMaxCount} {isEs ? 'máx' : 'max'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">
                  {isEs ? 'Energía por hora' : 'Power per hour'}
                </span>
                <span className="text-base font-mono font-black text-[#38BDF8]">
                  {formatPower(sunforgeHourly)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
