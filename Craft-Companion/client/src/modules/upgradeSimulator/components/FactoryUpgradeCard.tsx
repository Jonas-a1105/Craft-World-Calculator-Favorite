import React from 'react';
import { CartLarge2Bold, CartLarge2Linear } from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import { ResourceRequirementBadge } from './ResourceRequirementBadge';
import { CustomLevelSelect } from './CustomLevelSelect';
import type { FactoryUpgradeRow } from '../types';

interface FactoryUpgradeCardProps {
  row: FactoryUpgradeRow;
  onFromChange: (token: string, from: number) => void;
  onToChange: (token: string, to: number) => void;
  onQtyChange: (token: string, qty: number) => void;
  onToggleCart: (token: string) => void;
  baseSymbol: string;
  language: string;
}

function formatCostCoin(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toFixed(1);
}

export const FactoryUpgradeCard: React.FC<FactoryUpgradeCardProps> = ({
  row,
  onFromChange,
  onToChange,
  onQtyChange,
  onToggleCart,
  baseSymbol,
  language,
}) => {
  const isEs = language === 'es';
  const name = isEs ? row.nameEs : row.nameEn;

  // Generate available level options for FROM (1..maxLevel - 1)
  const fromOptions: number[] = [];
  for (let l = 1; l < row.maxLevel; l++) {
    fromOptions.push(l);
  }

  // Generate available level options for TO (fromLevel..maxLevel)
  const toOptions: number[] = [];
  for (let l = row.fromLevel; l <= row.maxLevel; l++) {
    toOptions.push(l);
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-3xl bg-[#1c1c22] hover:bg-[#22222a] transition-all shadow-xl shadow-black/25 border-none outline-none select-none space-y-3 relative ${
        row.inCart ? 'ring-1 ring-amber-500/40 bg-[#1e1e26]' : ''
      }`}
    >
      {/* 1. Top Row: Factory Identity on Left, QTY & Cart on Right */}
      <div className="flex items-center justify-between gap-3">
        {/* Factory Icon + Localized Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#131316] flex items-center justify-center shrink-0 shadow-inner">
            <ResourceIcon symbol={row.token} size={22} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              {name}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-medium block uppercase mt-0.5">
              {row.token}
            </span>
          </div>
        </div>

        {/* Controls Aligned to the Right: QTY Stepper & Cart Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* QTY Stepper */}
          <div className="inline-flex items-center rounded-xl bg-[#131316] p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => onQtyChange(row.token, Math.max(1, row.qty - 1))}
              disabled={row.qty <= 1}
              className="w-5 h-5 rounded-lg bg-[#202028] hover:bg-[#2c2c36] disabled:opacity-30 text-slate-300 font-bold text-xs flex items-center justify-center transition-colors border-none cursor-pointer"
              title={isEs ? 'Disminuir cantidad' : 'Decrease quantity'}
            >
              -
            </button>
            <span className="w-6 text-center text-xs font-mono font-bold text-slate-200">
              {row.qty}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(row.token, row.qty + 1)}
              className="w-5 h-5 rounded-lg bg-[#202028] hover:bg-[#2c2c36] text-slate-300 font-bold text-xs flex items-center justify-center transition-colors border-none cursor-pointer"
              title={isEs ? 'Aumentar cantidad' : 'Increase quantity'}
            >
              +
            </button>
          </div>

          {/* Cart Button with Active State */}
          <button
            type="button"
            onClick={() => onToggleCart(row.token)}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
              row.inCart
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                : 'bg-[#131316] text-slate-400 hover:text-white hover:bg-[#202028]'
            }`}
            title={row.inCart ? (isEs ? 'Quitar del carrito' : 'Remove from cart') : (isEs ? 'Añadir al carrito' : 'Add to cart')}
          >
            {row.inCart ? <CartLarge2Bold size={15} /> : <CartLarge2Linear size={15} />}
          </button>
        </div>
      </div>

      {/* 2. Middle Row: Custom Dropdown Selects Expanded Across Available Space */}
      <div className="flex items-center gap-2.5 w-full">
        <div className="flex-1 min-w-0">
          <CustomLevelSelect
            label={isEs ? 'DE' : 'FROM'}
            value={row.fromLevel}
            options={fromOptions}
            onChange={(lvl) => onFromChange(row.token, lvl)}
            accentColor="white"
          />
        </div>

        <span className="text-slate-500 text-xs font-mono px-0.5 shrink-0">➔</span>

        <div className="flex-1 min-w-0">
          <CustomLevelSelect
            label={isEs ? 'A' : 'TO'}
            value={row.toLevel}
            options={toOptions}
            onChange={(lvl) => onToChange(row.token, lvl)}
            accentColor="amber"
          />
        </div>
      </div>

      {/* 3. Third Row: Required Resources Badges Horizontal Scroll */}
      <div className="w-full overflow-x-auto pb-1.5 pt-0.5 flex items-center gap-1.5 scrollbar-thin">
        {row.requiredResources.length > 0 ? (
          row.requiredResources.map((req) => (
            <ResourceRequirementBadge
              key={req.token}
              resource={req}
              baseSymbol={baseSymbol}
              language={language}
            />
          ))
        ) : (
          <span className="text-xs font-mono text-slate-400 italic py-1">
            {isEs ? 'Sin costo para el rango seleccionado' : 'No upgrade needed for selected range'}
          </span>
        )}
      </div>

      {/* 4. Bottom Row: Total Upgrade Cost in COIN on the Right */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-medium">
          {isEs ? 'Costo Total:' : 'Total Cost:'}
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-sm sm:text-base font-black text-amber-300">
            {formatCostCoin(row.totalCostCoin)}
          </span>
          <ResourceIcon symbol="COIN" size={16} />
        </div>
      </div>
    </div>
  );
};
