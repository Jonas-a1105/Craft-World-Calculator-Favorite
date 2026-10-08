import React from 'react';
import type { SimulationMode } from '../types';
import { useTranslation } from '../../../utils/i18n';

export interface SimulationModeSelectorProps {
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => void;
  ownedCount: number;
}

export const SimulationModeSelector: React.FC<SimulationModeSelectorProps> = ({
  simulationMode,
  setSimulationMode,
  ownedCount,
}) => {
  const { language } = useTranslation();

  const modes: Array<{
    id: SimulationMode;
    icon: string;
    title: string;
    subtitle: string;
    badge?: string;
  }> = [
    {
      id: 'base',
      icon: '🏛️',
      title: language === 'es' ? 'Fábricas Base' : 'Base Catalog',
      subtitle: language === 'es' ? 'Valores puros 1x sin bonos' : 'Pure 1x stats without boosts',
    },
    {
      id: 'active_owned',
      icon: '🚜',
      title: language === 'es' ? 'Mis Fábricas Activas' : 'My Active Factories',
      subtitle: language === 'es' ? 'Tus niveles, parcelas y trabajadores' : 'Your live levels & workers',
      badge: `${ownedCount} ${language === 'es' ? 'en parcelas' : 'on plots'}`,
    },
    {
      id: 'projected',
      icon: '🚀',
      title: language === 'es' ? 'Proyección con mis Bonos' : 'Projected (With Perks)',
      subtitle: language === 'es' ? 'Todo el juego con tu taller y maestrías' : 'All recipes with your account perks',
    },
  ];

  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-2.5 sm:p-3 shadow-xl border border-white/[0.04]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {modes.map((m) => {
          const isActive = simulationMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSimulationMode(m.id)}
              className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer select-none flex items-start gap-3 relative ${
                isActive
                  ? 'bg-[#222227] ring-2 ring-emerald-400/80 shadow-lg'
                  : 'bg-[#141416] hover:bg-[#1c1c20] text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{m.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-bold text-xs sm:text-sm truncate ${
                      isActive ? 'text-white font-extrabold' : 'text-zinc-300'
                    }`}
                  >
                    {m.title}
                  </h4>
                  {m.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex-shrink-0">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {m.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
