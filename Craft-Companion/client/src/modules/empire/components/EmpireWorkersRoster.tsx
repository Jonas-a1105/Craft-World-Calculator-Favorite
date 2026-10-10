import React from 'react';
import { UserBoldDuotone } from 'solar-icon-set';
import type { CraftworldWorker } from '../../../types';

interface EmpireWorkersRosterProps {
  workers: CraftworldWorker[];
  language: string;
}

export const EmpireWorkersRoster: React.FC<EmpireWorkersRosterProps> = ({
  workers,
  language,
}) => {
  const isEs = language === 'es';

  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <UserBoldDuotone className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xs sm:text-sm text-white tracking-wide uppercase">
              {isEs ? 'Roster de Trabajadores' : 'Worker Roster'}
            </h2>
            <span className="text-[11px] text-zinc-400">
              {isEs ? 'Asignaciones y bonificaciones de velocidad activas' : 'Worker assignments and speed bonuses'}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full font-bold">
          {workers.length} {isEs ? 'trabajadores' : 'workers'}
        </span>
      </div>

      {workers.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[340px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {workers.map((worker: CraftworldWorker, idx: number) => {
            const boostPercent = Math.round((worker.areaBoostValue || 0) * 100);
            const isAssigned = Boolean(worker.areaUuid);
            return (
              <div
                key={worker.id || idx}
                className="bg-zinc-800/40 hover:bg-zinc-800/60 p-2.5 px-3 rounded-2xl shadow-sm flex items-center justify-between text-xs transition-colors border-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-zinc-900/60 flex items-center justify-center shrink-0 shadow-inner">
                    <UserBoldDuotone size={14} className="text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs truncate">
                        {worker.name}
                      </span>
                      {worker.isAreaLead && (
                        <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded-full font-black">
                          LEAD
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {isAssigned ? (
                        <span className="text-emerald-400 font-semibold">
                          ● {isEs ? 'Asignado' : 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium">
                          ○ {isEs ? 'En descanso' : 'Resting'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <span className="bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[11px] px-2 py-0.5 rounded-full shrink-0">
                  +{boostPercent}% Boost
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-zinc-400 text-center py-6">
          {isEs ? 'Sin trabajadores registrados.' : 'No workers recorded.'}
        </p>
      )}
    </div>
  );
};
