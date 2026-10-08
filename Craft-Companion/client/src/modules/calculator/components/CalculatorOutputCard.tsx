import React from 'react';
import { ArchiveBoldDuotone } from 'solar-icon-set';
import Card from '../../../components/Card';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { formatNumber, formatCycleMinutes } from '../../../utils/formatters';
import type { FactoryCycleResult } from '../types';
import type { ModifierBadgeInfo, SimulationMode } from '../../profitability/types';

interface CalculatorOutputCardProps {
  language: string;
  cycle: FactoryCycleResult;
  simulationMode?: SimulationMode;
  modifiers?: ModifierBadgeInfo[];
}

export const CalculatorOutputCard: React.FC<CalculatorOutputCardProps> = ({
  language,
  cycle,
  modifiers,
}) => {
  const powerCost = cycle.row.power_cost ?? 0;
  const xpPerOutput = cycle.row.xp_per_output ?? 0;
  const totalXp = xpPerOutput * cycle.outputPerCycle;

  const baseMinutes = cycle.row.duration_min;
  const isBoosted = Math.abs(cycle.runtimeMinutes - baseMinutes) > 0.1;

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ArchiveBoldDuotone size={18} className="text-sky-400" />
          {language === 'es' ? 'Output de Producción' : 'Production Output'}
        </span>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 resource-item-badge">
          <div className="flex items-center gap-3">
            <FactoryIcon symbol={cycle.row.token} size={40} />
            <div>
              <span className="text-sm font-extrabold text-white block">
                {cycle.row.token} (Nv. {cycle.row.level})
              </span>
              <span className="text-xs text-slate-300">
                {language === 'es' ? 'Tiempo de ciclo: ' : 'Cycle time: '}
                <strong className="text-amber-300 font-mono">
                  {formatCycleMinutes(cycle.runtimeMinutes)}
                </strong>
                {isBoosted && (
                  <span className="text-zinc-500 font-mono text-[11px] ml-1.5">
                    ({language === 'es' ? 'base: ' : 'base: '}
                    {cycle.row.duration_raw || `${baseMinutes}m`})
                  </span>
                )}
              </span>
            </div>
          </div>
          {cycle.row.yield_percent !== undefined && (
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg">
              {cycle.row.yield_percent}% {language === 'es' ? 'Rend.' : 'Yield'}
            </span>
          )}
        </div>

        {/* Modifier Badges */}
        {modifiers && modifiers.length > 0 && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {modifiers.map((m, idx) => {
              const colorClass =
                m.type === 'booster'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : m.type === 'worker'
                    ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                    : m.type === 'workshop'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

              return (
                <span
                  key={idx}
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}
                  title={m.detail}
                >
                  {m.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'Por Ciclo' : 'Per Cycle'}
            </span>
            <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
              <ResourceIcon symbol={cycle.row.output_token} size={16} />
              {cycle.outputPerCycle}
            </span>
          </div>
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'Por Día' : 'Per Day'}
            </span>
            <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
              <ResourceIcon symbol={cycle.row.output_token} size={16} />
              {formatNumber(cycle.outputPerDay)}
            </span>
          </div>
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'Energía / Ciclo' : 'Power / Cycle'}
            </span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {powerCost > 0 ? (
                <span>⚡ {powerCost >= 1000 ? `${(powerCost / 1000).toFixed(0)}k` : powerCost}</span>
              ) : (
                <span className="text-slate-500">0 ⚡</span>
              )}
            </span>
          </div>
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'XP / Ciclo' : 'XP / Cycle'}
            </span>
            <span className="text-sm font-black text-purple-400 font-mono">
              {totalXp > 0 ? (
                <span>★ {totalXp >= 1000000 ? `${(totalXp / 1000000).toFixed(1)}M` : totalXp >= 1000 ? `${(totalXp / 1000).toFixed(0)}k` : totalXp}</span>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
