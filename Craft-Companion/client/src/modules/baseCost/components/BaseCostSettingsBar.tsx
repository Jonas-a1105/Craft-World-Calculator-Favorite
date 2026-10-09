import React from 'react';
import type { BaseCostSettings, CategoryKey } from '../types';
import { BASE_COST_CATEGORIES } from '../data/baseCostCatalog';
import {
  MagniferLinear,
  CloseCircleBoldDuotone,
  BatteryChargeBoldDuotone,
} from 'solar-icon-set';

interface BaseCostSettingsBarProps {
  settings: BaseCostSettings;
  search: string;
  selectedCategory: CategoryKey;
  onUpdateSettings: (partial: Partial<BaseCostSettings>) => void;
  onSearchChange: (search: string) => void;
  onSelectCategory: (category: CategoryKey) => void;
}

export const BaseCostSettingsBar: React.FC<BaseCostSettingsBarProps> = ({
  settings,
  search,
  selectedCategory,
  onUpdateSettings,
  onSearchChange,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] sm:rounded-[32px] bg-[#1c1c22] p-4 sm:p-5 shadow-xl shadow-black/25 select-none border-none">
      {/* Top Row: Financial parameters (Slippages & Power) - Expands Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 w-full">
        {/* Buy Slippage */}
        <label className="flex items-center justify-between cursor-pointer select-none bg-[#131316] hover:bg-[#17171c] px-3.5 py-2.5 rounded-2xl w-full transition-colors shadow-inner">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.buySlippage}
              onChange={(e) => onUpdateSettings({ buySlippage: e.target.checked })}
              className="w-4 h-4 rounded bg-[#1c1c22] border-none text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
            <span className="text-slate-300 text-xs font-mono font-medium">Buy slippage</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1c1c22] px-3 py-1 rounded-xl ring-1 ring-white/10 font-mono text-xs shadow-sm">
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={settings.buySlippagePct}
              onChange={(e) =>
                onUpdateSettings({
                  buySlippagePct: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-12 bg-transparent text-center text-slate-100 font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-slate-400 font-semibold">%</span>
          </div>
        </label>

        {/* Sell Slippage */}
        <label className="flex items-center justify-between cursor-pointer select-none bg-[#131316] hover:bg-[#17171c] px-3.5 py-2.5 rounded-2xl w-full transition-colors shadow-inner">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.sellSlippage}
              onChange={(e) => onUpdateSettings({ sellSlippage: e.target.checked })}
              className="w-4 h-4 rounded bg-[#1c1c22] border-none text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
            <span className="text-slate-300 text-xs font-mono font-medium">Sell slippage</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1c1c22] px-3 py-1 rounded-xl ring-1 ring-white/10 font-mono text-xs shadow-sm">
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={settings.sellSlippagePct}
              onChange={(e) =>
                onUpdateSettings({
                  sellSlippagePct: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-12 bg-transparent text-center text-slate-100 font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-slate-400 font-semibold">%</span>
          </div>
        </label>

        {/* Power Price */}
        <div className="flex items-center justify-between bg-[#131316] px-3.5 py-2.5 rounded-2xl w-full sm:col-span-2 lg:col-span-1 shadow-inner">
          <div className="flex items-center gap-2">
            <BatteryChargeBoldDuotone size={18} className="text-cyan-400 shrink-0" />
            <span className="text-slate-300 text-xs font-mono font-medium">Power:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#1c1c22] px-3 py-1 rounded-xl ring-1 ring-white/10 font-mono text-xs shadow-sm">
            <input
              type="number"
              min={0}
              step={0.001}
              placeholder="0"
              value={settings.powerPricePer100k === 0 ? '' : settings.powerPricePer100k}
              onChange={(e) =>
                onUpdateSettings({
                  powerPricePer100k: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-16 bg-transparent text-center text-cyan-300 font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[11px] text-slate-400">COIN/100k</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Search bar & Horizontal Category Tabs Carousel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Instant Search Bar */}
        <div className="relative w-full md:w-64 shrink-0">
          <MagniferLinear
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar recurso..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#131316] text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400/50 shadow-inner ring-1 ring-white/10"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <CloseCircleBoldDuotone size={14} />
            </button>
          )}
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-amber-400 text-black font-bold shadow-amber-400/20'
                : 'bg-[#131316] text-slate-400 hover:bg-[#202026] hover:text-slate-200 ring-1 ring-white/5'
            }`}
          >
            Todos ({48})
          </button>

          {BASE_COST_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shadow-sm ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-amber-400/20'
                    : 'bg-[#131316] text-slate-400 hover:bg-[#202026] hover:text-slate-200 ring-1 ring-white/5'
                }`}
              >
                {cat.labelEs} ({cat.resources.length})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
