import React from 'react';
import { ArchiveBoldDuotone } from 'solar-icon-set';
import Card from '../../../components/Card';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { FactoryCycleResult } from '../types';

interface CalculatorOutputCardProps {
  language: string;
  cycle: FactoryCycleResult;
}

export const CalculatorOutputCard: React.FC<CalculatorOutputCardProps> = ({
  language,
  cycle,
}) => {
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
        <div className="flex items-center gap-3 p-3 resource-item-badge">
          <FactoryIcon symbol={cycle.row.token} size={40} />
          <div>
            <span className="text-sm font-extrabold text-white block">
              {cycle.row.token} (Nv. {cycle.row.level})
            </span>
            <span className="text-xs text-slate-300">
              {language === 'es' ? 'Tiempo de ciclo: ' : 'Cycle time: '}
              <strong className="text-amber-300">{cycle.runtimeMinutes} min</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-center">
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
        </div>
      </div>
    </Card>
  );
};
