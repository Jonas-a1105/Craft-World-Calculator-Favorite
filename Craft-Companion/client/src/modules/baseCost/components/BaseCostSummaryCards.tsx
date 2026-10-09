import React from 'react';
import type { BaseCostSummaryStats } from '../types';
import { formatCoin } from '../services/baseCostCalculatorService';

interface BaseCostSummaryCardsProps {
  stats: BaseCostSummaryStats;
}

export const BaseCostSummaryCards: React.FC<BaseCostSummaryCardsProps> = ({ stats }) => {
  const elements = [
    { name: 'Earth', token: 'EARTH', price: stats.elementalPrices.earth, icon: '/assets/resources/Earth.png' },
    { name: 'Water', token: 'WATER', price: stats.elementalPrices.water, icon: '/assets/resources/Water.png' },
    { name: 'Fire', token: 'FIRE', price: stats.elementalPrices.fire, icon: '/assets/resources/Fire.png' },
    { name: 'Dust', token: 'DUST', price: stats.elementalPrices.dust, icon: '/assets/resources/Dust.png' },
    { name: 'Lumber', token: 'LUMBER', price: stats.elementalPrices.lumber, icon: '/assets/resources/Lumber.png' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
      {/* 5 Elemental Market Prices */}
      {elements.map((el) => (
        <div
          key={el.token}
          className="rounded-2xl bg-[#141228] p-3 shadow-lg flex items-center justify-between group hover:bg-[#191732] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={el.icon}
              alt={el.name}
              className="w-7 h-7 object-contain drop-shadow"
              loading="lazy"
            />
            <div>
              <div className="text-[11px] font-medium text-slate-400">{el.name}</div>
              <div className="font-mono text-xs font-semibold text-slate-200">
                {formatCoin(el.price)} <span className="text-[10px] text-amber-400 font-normal">COIN</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Overview KPI Card: Profitable ratio */}
      <div className="rounded-2xl bg-[#141228] p-3 shadow-lg flex flex-col justify-center">
        <div className="text-[11px] font-medium text-slate-400 mb-1">Rentabilidad Global</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            +{stats.profitableCount}
          </span>
          <span className="font-mono text-xs font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
            -{stats.unprofitableCount}
          </span>
          <span className="text-[10px] text-slate-500 font-mono ml-auto">
            {stats.totalTracked} total
          </span>
        </div>
      </div>
    </div>
  );
};
