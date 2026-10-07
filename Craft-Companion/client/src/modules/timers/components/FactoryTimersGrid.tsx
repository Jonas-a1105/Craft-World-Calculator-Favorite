import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import type { ActiveRun } from '../types';
import { FactoryTimerCard } from './FactoryTimerCard';

interface FactoryTimersGridProps {
  runs: ActiveRun[];
  nowSyncedMs: number;
  language: string;
}

export const FactoryTimersGrid: React.FC<FactoryTimersGridProps> = ({
  runs,
  nowSyncedMs,
  language,
}) => {
  if (runs.length === 0) {
    return (
      <div className="text-center py-12 bg-[#18181b] rounded-[28px] border-none">
        <ResourceIcon symbol="Hammer" size={48} className="mx-auto mb-3 opacity-60" />
        <p className="text-sm font-bold text-slate-300 font-main">
          {language === 'es'
            ? 'No hay producciones activas en este momento.'
            : 'No active production runs right now.'}
        </p>
        <p className="text-xs text-slate-400 mt-1 font-main">
          {language === 'es'
            ? 'Inicia producciones en el juego para ver los temporizadores en vivo.'
            : 'Start factory runs in game to see live timers here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {runs.map((run, idx) => (
        <FactoryTimerCard
          key={`${run.token}-${run.level}-${idx}`}
          run={run}
          nowSyncedMs={nowSyncedMs}
          language={language}
        />
      ))}
    </div>
  );
};
