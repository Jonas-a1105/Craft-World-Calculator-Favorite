import React from 'react';
import { WalletMoneyBoldDuotone } from 'solar-icon-set';
import Card from '../../../components/Card';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import type { FactoryCycleResult } from '../types';

interface CalculatorFinancialCardProps {
  language: string;
  cycle: FactoryCycleResult;
}

export const CalculatorFinancialCard: React.FC<CalculatorFinancialCardProps> = ({
  language,
  cycle,
}) => {
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <WalletMoneyBoldDuotone size={18} className="text-emerald-400" />
          {language === 'es' ? 'Financiero & Insumos' : 'Financial & Inputs'}
        </span>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-bold block">
            {language === 'es'
              ? 'Insumos requeridos por ciclo:'
              : 'Inputs required per cycle:'}
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="resource-item-badge px-2.5 py-1 text-slate-200 font-bold flex items-center gap-1.5">
              <ResourceIcon symbol={cycle.row.input_token_1} size={16} />
              {cycle.row.input_token_1}: {cycle.input1PerCycle}
            </span>
            {cycle.row.input_token_2 && (
              <span className="resource-item-badge px-2.5 py-1 text-slate-200 font-bold flex items-center gap-1.5">
                <ResourceIcon symbol={cycle.row.input_token_2} size={16} />
                {cycle.row.input_token_2}: {cycle.input2PerCycle}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-none">
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
            </span>
            <span className="text-sm font-black text-cyan-400">
              {formatNumber(cycle.profitPerHour)} COIN
            </span>
          </div>
          <div className="resource-item-badge p-2.5">
            <span className="text-[10px] text-slate-400 block font-bold">
              {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
            </span>
            <span className="text-sm font-black text-emerald-400">
              {formatNumber(cycle.profitPerDay)} COIN
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
