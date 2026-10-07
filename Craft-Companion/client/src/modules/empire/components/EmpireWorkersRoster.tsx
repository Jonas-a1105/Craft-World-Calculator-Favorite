import React from 'react';
import type { CraftworldWorker } from '../../../types';

interface EmpireWorkersRosterProps {
  workers: CraftworldWorker[];
  language: string;
}

export const EmpireWorkersRoster: React.FC<EmpireWorkersRosterProps> = ({
  workers,
  language,
}) => {
  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-title text-xs sm:text-sm text-white tracking-wide uppercase flex items-center gap-2">
          <span>👷</span>
          <span>{language === 'es' ? 'Roster de Trabajadores' : 'Worker Roster'}</span>
        </h2>
        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full">
          {workers.length} {language === 'es' ? 'trabajadores' : 'workers'}
        </span>
      </div>

      {workers.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[360px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {workers.map((worker: CraftworldWorker, idx: number) => {
            const boostPercent = Math.round((worker.areaBoostValue || 0) * 100);
            const isAssigned = Boolean(worker.areaUuid);
            return (
              <div
                key={worker.id || idx}
                className="bg-[#202024] hover:bg-[#25252a] p-3 px-3.5 rounded-[20px] shadow-sm flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#18181b] flex items-center justify-center text-sm shrink-0">
                    👷
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
                        <span className="text-emerald-400 font-medium">
                          ● {language === 'es' ? 'Asignado' : 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-medium">
                          ○ {language === 'es' ? 'En descanso' : 'Resting'}
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
        <p className="text-sm text-slate-400 text-center py-6 font-main">
          {language === 'es' ? 'Sin trabajadores registrados.' : 'No workers recorded.'}
        </p>
      )}
    </div>
  );
};
