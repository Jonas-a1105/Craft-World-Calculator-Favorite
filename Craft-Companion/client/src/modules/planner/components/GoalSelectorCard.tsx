import React from 'react';
import type { PlannerKpiStats } from '../types';
import { useTranslation } from '../../../utils/i18n';
import { formatNumber } from '../../../utils/formatters';
import { Combobox } from '../../../components/ui/Combobox';
import {
  BoltBoldDuotone,
  CartLargeBoldDuotone,
  CheckCircleBold,
  BoxBold,
} from 'solar-icon-set';

export interface GoalSelectorCardProps {
  targetToken: string;
  setTargetToken: (tok: string) => void;
  targetAmount: number;
  setTargetAmount: (val: number | ((prev: number) => number)) => void;
  tokenOptions: Array<{ value: string; label: string; icon: React.ReactNode }>;
  userResources: Record<string, number>;
  kpiStats: PlannerKpiStats;
}

export const GoalSelectorCard: React.FC<GoalSelectorCardProps> = ({
  targetToken,
  setTargetToken,
  targetAmount,
  setTargetAmount,
  tokenOptions,
  userResources,
  kpiStats,
}) => {
  const { language } = useTranslation();

  const isEs = language === 'es';
  const currentStock = userResources[targetToken] || 0;

  return (
    <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-7 shadow-xl border-none space-y-6 select-none">
      {/* 1. Header of Goal Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <BoltBoldDuotone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {isEs ? 'Meta de Producción' : 'Production Goal'}
            </h2>
            <span className="text-xs text-zinc-400">
              {isEs
                ? 'Selecciona el artículo final y la cantidad a fabricar'
                : 'Choose final product and quantity to craft'}
            </span>
          </div>
        </div>

        {/* Current in Storage Indicator */}
        <div className="flex items-center gap-2 bg-zinc-800/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-300 self-start sm:self-auto">
          <BoxBold className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400">
            {isEs ? 'En almacén:' : 'In storage:'}
          </span>
          <span className="text-emerald-400 font-mono font-bold">
            {formatNumber(currentStock)}
          </span>
        </div>
      </div>

      {/* 2. Interactive Inputs: Target Combobox & Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-end">
        {/* Target Resource Combobox */}
        <div className="md:col-span-6 space-y-2 min-w-0">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
            {isEs ? 'Recurso Objetivo' : 'Target Resource'}
          </label>
          <Combobox
            value={targetToken}
            onChange={(val) => setTargetToken(val as string)}
            options={tokenOptions}
            placeholder={isEs ? 'Seleccionar recurso...' : 'Select resource...'}
            className="w-full !py-3 !px-4.5 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-2xl text-sm font-bold text-white shadow-inner border-none transition-colors"
            menuClassName="w-full max-h-72"
          />
        </div>

        {/* Target Amount Input & Quick Presets */}
        <div className="md:col-span-6 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
              {isEs ? 'Cantidad Deseada' : 'Desired Amount'}
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              {[1, 5, 10, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetAmount(preset)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer border-none shrink-0 ${
                    targetAmount === preset
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full min-w-0">
            <button
              type="button"
              onClick={() => setTargetAmount((prev) => Math.max(1, prev - 1))}
              disabled={targetAmount <= 1}
              className="w-10 h-10 shrink-0 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-300 hover:text-white flex items-center justify-center font-black text-lg transition-colors cursor-pointer border-none"
              title="-1"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={targetAmount}
              onChange={(e) =>
                setTargetAmount(Math.max(1, Number(e.target.value) || 1))
              }
              className="flex-1 min-w-0 w-full bg-zinc-800/50 text-white text-center font-mono font-bold text-base py-2.5 px-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
            <button
              type="button"
              onClick={() => setTargetAmount((prev) => prev + 1)}
              className="w-10 h-10 shrink-0 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center font-black text-lg transition-colors cursor-pointer border-none"
              title="+1"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 3. Production Strategy & Chain Arbitrage Banner */}
      {kpiStats.marketBuyTotalCost > 0 && (
        <div
          className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
            kpiStats.totalArbitrageProfit > 0
              ? 'bg-emerald-500/10 border-none'
              : 'bg-cyan-500/10 border-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                kpiStats.totalArbitrageProfit > 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {kpiStats.totalArbitrageProfit > 0 ? (
                <BoltBoldDuotone className="w-5 h-5" />
              ) : (
                <CartLargeBoldDuotone className="w-5 h-5" />
              )}
            </div>
            <div>
              <div
                className={`text-xs font-black tracking-wide uppercase ${
                  kpiStats.totalArbitrageProfit > 0
                    ? 'text-emerald-300'
                    : 'text-cyan-300'
                }`}
              >
                {kpiStats.totalArbitrageProfit > 0
                  ? isEs
                    ? 'ESTRATEGIA HÍBRIDA: VENDER INSUMOS Y COMPRAR SIGUIENTE'
                    : 'HYBRID STRATEGY: ARBITRAGE ACTIVE'
                  : isEs
                    ? 'ESTRATEGIA DIRECTA: CONVERTIR EN FÁBRICAS'
                    : 'DIRECT STRATEGY: CONVERT IN FACTORIES'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {kpiStats.totalArbitrageProfit > 0
                  ? isEs
                    ? `Te sobran +${formatNumber(kpiStats.totalArbitrageProfit, 2)} COIN en el plano vendiendo insumos con sobreprecio para comprar los siguientes listos en mercado`
                    : `Save +${formatNumber(kpiStats.totalArbitrageProfit, 2)} COIN across stages by selling overpriced inputs to buy next intermediates finished`
                  : isEs
                    ? `Toda la cadena es más rentable procesándola en fábricas que vendiendo y recomprando en mercado`
                    : `Full vertical factory conversion is more efficient than selling and repurchasing`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/60 p-2.5 rounded-xl shrink-0 text-right justify-between md:justify-end">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                {isEs ? 'Valor Venta Meta' : 'Goal Market Value'}
              </span>
              <span className="text-xs font-mono font-extrabold text-white flex items-center gap-1 justify-end">
                <span>{formatNumber(kpiStats.marketBuyTotalCost, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
            <div className="w-[1px] h-7 bg-white/10" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                {isEs ? 'Beneficio Arbitraje' : 'Arbitrage Profit'}
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                <span>+{formatNumber(kpiStats.totalArbitrageProfit, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick Summary Strip (4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Etapas del Plano */}
        <div className="bg-zinc-800/50 rounded-2xl p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {isEs ? 'Etapas del Plano' : 'Blueprint Stages'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-white font-mono">
              {kpiStats.totalTypes}
            </span>
            <span className="text-xs text-zinc-500">
              {isEs ? 'etapas' : 'stages'}
            </span>
          </div>
        </div>

        {/* KPI 2: Cobertura */}
        <div className="bg-zinc-800/50 rounded-2xl p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {isEs ? 'En Inventario' : 'In Stock'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.canCraftInstantly
                  ? 'text-emerald-400'
                  : kpiStats.completionPercent >= 50
                    ? 'text-sky-400'
                    : 'text-amber-400'
              }`}
            >
              {kpiStats.readyTypes}/{kpiStats.totalTypes}
            </span>
            <span className="text-xs text-zinc-400 font-bold">
              ({kpiStats.completionPercent}%)
            </span>
          </div>
        </div>

        {/* KPI 3: Faltantes */}
        <div className="bg-zinc-800/50 rounded-2xl p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {isEs ? 'Faltantes' : 'Missing'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.totalMissingItems === 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {formatNumber(kpiStats.totalMissingItems)}
            </span>
            <span className="text-xs text-zinc-500">
              {isEs ? 'unidades' : 'units'}
            </span>
          </div>
        </div>

        {/* KPI 4: Costo de Mercado Estimado de Faltantes */}
        <div className="bg-zinc-800/50 rounded-2xl p-3.5 flex flex-col justify-between space-y-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
            {isEs ? 'Costo Faltantes' : 'Deficit Cost'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-extrabold font-mono ${
                kpiStats.totalMissingCost === 0
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {kpiStats.totalMissingCost === 0
                ? '0'
                : formatNumber(kpiStats.totalMissingCost, 2)}
            </span>
            <img src="/assets/resources/Coin.png" alt="COIN" className="w-3.5 h-3.5 object-contain inline-block" />
          </div>
        </div>
      </div>
    </div>
  );
};
