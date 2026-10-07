import React from 'react';
import { Combobox } from '../../../components/ui/Combobox';
import type { FactoryBoostMode } from '../types';

export interface MatrixSettingsBarProps {
  adBoost2x: boolean;
  setAdBoost2x: (val: boolean | ((prev: boolean) => boolean)) => void;
  buySlippage: boolean;
  setBuySlippage: (val: boolean | ((prev: boolean) => boolean)) => void;
  sellSlippage: boolean;
  setSellSlippage: (val: boolean | ((prev: boolean) => boolean)) => void;
  factoryBoost: FactoryBoostMode;
  setFactoryBoost: (boost: FactoryBoostMode) => void;
  boostOptions: Array<{ value: string; label: string }>;
  powerPrice: number;
  setPowerPrice: (price: number) => void;
}

export const MatrixSettingsBar: React.FC<MatrixSettingsBarProps> = ({
  adBoost2x,
  setAdBoost2x,
  buySlippage,
  setBuySlippage,
  sellSlippage,
  setSellSlippage,
  factoryBoost,
  setFactoryBoost,
  boostOptions,
  powerPrice,
  setPowerPrice,
}) => {
  return (
    <div className="bg-[#18181b] p-3 rounded-[24px] border-none shadow-md">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:flex-wrap gap-2 sm:gap-2.5 text-xs select-none">
        {/* x2 Ad Boost */}
        <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
          <div
            className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
              adBoost2x
                ? 'bg-emerald-400 text-black shadow-sm'
                : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
            }`}
          >
            <svg
              className="w-2.5 h-2.5 stroke-[3.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={adBoost2x}
            onChange={(e) => setAdBoost2x(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`text-xs font-bold truncate transition-colors ${
              adBoost2x ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
            }`}
          >
            x2 ad boost
          </span>
        </label>

        {/* Buy Slippage */}
        <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
          <div
            className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
              buySlippage
                ? 'bg-emerald-400 text-black shadow-sm'
                : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
            }`}
          >
            <svg
              className="w-2.5 h-2.5 stroke-[3.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={buySlippage}
            onChange={(e) => setBuySlippage(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`text-xs font-bold truncate transition-colors ${
              buySlippage ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
            }`}
          >
            Buy slippage
          </span>
        </label>

        {/* Sell Slippage */}
        <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
          <div
            className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
              sellSlippage
                ? 'bg-emerald-400 text-black shadow-sm'
                : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
            }`}
          >
            <svg
              className="w-2.5 h-2.5 stroke-[3.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={sellSlippage}
            onChange={(e) => setSellSlippage(e.target.checked)}
            className="sr-only"
          />
          <span
            className={`text-xs font-bold truncate transition-colors ${
              sellSlippage ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
            }`}
          >
            Sell slippage
          </span>
        </label>

        {/* Factory Boost Combobox */}
        <div className="bg-[#141416] p-1.5 px-2.5 rounded-2xl flex items-center justify-between gap-1.5 min-w-0">
          <span className="text-zinc-400 font-bold text-xs flex-shrink-0">
            Boost:
          </span>
          <div className="flex-1 min-w-0">
            <Combobox
              value={factoryBoost}
              onChange={(val) => setFactoryBoost(val as FactoryBoostMode)}
              options={boostOptions}
              className="w-full !py-1.5 !px-2.5 bg-[#202024] hover:bg-[#28282e] rounded-xl text-xs font-bold text-white shadow-inner justify-between"
              menuClassName="w-full min-w-[130px] max-h-48"
              align="left"
            />
          </div>
        </div>

        {/* Power Price */}
        <div className="col-span-2 sm:col-span-1 lg:col-auto bg-[#141416] p-2 px-3 rounded-2xl flex items-center justify-between sm:justify-start gap-2">
          <span className="text-zinc-400 font-bold text-xs flex-shrink-0">
            Power:
          </span>
          <div className="flex items-center bg-[#202024] rounded-xl px-2.5 py-1 shadow-inner">
            <input
              type="number"
              min="0"
              value={powerPrice}
              onChange={(e) =>
                setPowerPrice(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-10 bg-transparent text-white text-xs font-mono font-bold focus:outline-none text-right pr-1 border-none"
            />
            <span className="text-[10px] text-zinc-500 font-mono">/ 100k</span>
          </div>
        </div>
      </div>
    </div>
  );
};
