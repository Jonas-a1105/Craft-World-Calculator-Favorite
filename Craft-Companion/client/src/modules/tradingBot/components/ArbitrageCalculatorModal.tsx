import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CloseCircleLinear,
  CopyBold,
  CheckCircleBold,
  BoxBold,
  DollarBoldDuotone,
  StopwatchBoldDuotone,
} from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { TradingOpportunity } from '../types';

interface ArbitrageCalculatorModalProps {
  opportunity: TradingOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArbitrageCalculatorModal: React.FC<ArbitrageCalculatorModalProps> = ({
  opportunity,
  isOpen,
  onClose,
}) => {
  const [batchCount, setBatchCount] = useState<number>(100);
  const [copied, setCopied] = useState(false);

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !opportunity) return null;

  const isCraft = opportunity.type === 'CRAFT_ARBITRAGE';
  const unitPrice = opportunity.currentPrice;

  // Calculation parameters
  const unitsToCraftOrBuy = batchCount;
  const grossSellRevenue = unitsToCraftOrBuy * unitPrice;
  const marketplaceFee = grossSellRevenue * 0.05; // 5% marketplace fee
  const netRevenueAfterFee = grossSellRevenue - marketplaceFee;

  let totalCost = 0;
  if (isCraft && opportunity.ingredients && opportunity.ingredients.length > 0) {
    const singleCraftCost = opportunity.ingredients.reduce(
      (sum, ing) => sum + ing.totalCostCoin,
      0
    );
    totalCost = singleCraftCost * unitsToCraftOrBuy;
  } else {
    totalCost = unitsToCraftOrBuy * unitPrice;
  }

  // Net Profit
  const netProfit = isCraft
    ? netRevenueAfterFee - totalCost
    : netRevenueAfterFee * (opportunity.potentialMarginPercent / 100);

  const roiPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  const handleCopySummary = () => {
    const text = [
      `📊 Operación: ${opportunity.name} (${opportunity.type})`,
      `📦 Cantidad: ${unitsToCraftOrBuy} unidades`,
      `💰 Costo Total Inversión: ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} COIN`,
      `🏦 Ingreso Venta Bruta: ${grossSellRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })} COIN`,
      `📉 Tarifa Mercado (5%): -${marketplaceFee.toLocaleString(undefined, { maximumFractionDigits: 2 })} COIN`,
      `🚀 Ganancia Neta Estimada: +${netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} COIN (${roiPercent.toFixed(1)}% ROI)`,
      `⚡ Calculado en Craft Companion Trading Bot`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-[#18181b] border-none rounded-[32px] p-6 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Glow ambient background accents (Orange and Blue only) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#141416] flex items-center justify-center shrink-0 p-2 shadow-inner">
              <ResourceIcon symbol={opportunity.symbol} size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-game font-impostor text-white tracking-wider uppercase">
                  {opportunity.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Tier {opportunity.tier}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Simulador de Inversión • Score {opportunity.score}/100
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border-none"
            title="Cerrar"
          >
            <CloseCircleLinear className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto space-y-3.5 pr-1 py-1">
          {/* Batch Size Selector */}
          <div className="space-y-2.5 bg-[#141416] p-4 rounded-2xl shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Cantidad de unidades:</span>
              <span className="text-amber-400 text-sm font-bold">{unitsToCraftOrBuy} unidades</span>
            </div>

            <input
              type="range"
              min={10}
              max={2000}
              step={10}
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="w-full h-2 bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            {/* Quick presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[50, 100, 250, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBatchCount(preset)}
                  className={`flex-1 py-1 px-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                    batchCount === preset
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20'
                      : 'bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Insumos breakdown if Craft Arbitrage */}
          {isCraft && opportunity.ingredients && opportunity.ingredients.length > 0 && (
            <div className="space-y-2 bg-[#141416] p-4 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                <span className="flex items-center gap-2">
                  <BoxBold size={15} className="text-amber-400" />
                  Insumos necesarios
                </span>
                <span className="text-[11px] text-zinc-400">Costo total</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {opportunity.ingredients.map((ing) => {
                  const totalIngQty = ing.qtyNeeded * unitsToCraftOrBuy;
                  const totalIngCost = totalIngQty * ing.marketPriceCoin;
                  return (
                    <div
                      key={ing.symbol}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#18181b] border-none"
                    >
                      <div className="flex items-center gap-2">
                        <ResourceIcon symbol={ing.symbol} size={18} className="w-4 h-4 object-contain" />
                        <span className="font-bold text-amber-400">{totalIngQty}x</span>
                        <span className="font-medium text-white">{ing.symbol}</span>
                        <span className="text-[10px] text-zinc-500">
                          (@{ing.marketPriceCoin.toFixed(2)}c)
                        </span>
                      </div>
                      <span className="font-semibold text-zinc-200">
                        {totalIngCost.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                        <span className="text-amber-400 text-[10px]">COIN</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Financial Summary Breakdown: Natural labels, no uppercase */}
          <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-[#141416] shadow-inner">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Costo de inversión</div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                <span className="text-xs text-amber-400">COIN</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Fee de mercado (5%)</div>
              <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
                -{marketplaceFee.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                <span className="text-xs text-zinc-400">COIN</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Venta bruta estimada</div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {grossSellRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                <span className="text-xs text-amber-400">COIN</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Retorno estimado (ROI)</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                +{roiPercent.toFixed(1)}% ROI
              </div>
            </div>
          </div>

          {/* Net Profit Banner Highlight */}
          <div className="p-4 rounded-2xl bg-[#141416] flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20">
                <DollarBoldDuotone size={24} />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-400">
                  Ganancia neta limpia
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  +{netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                  <span className="text-xs text-emerald-400 font-semibold">COIN</span>
                </div>
              </div>
            </div>

            {opportunity.cycleTimeMinutes && (
              <div className="text-right flex items-center gap-1.5 text-xs text-zinc-400">
                <StopwatchBoldDuotone size={15} className="text-amber-400" />
                <span>{opportunity.cycleTimeMinutes} min/ciclo</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 shrink-0 border-t border-zinc-800/60 mt-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-2xl bg-[#141416] hover:bg-zinc-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border-none cursor-pointer shadow-md active:scale-98"
          >
            {copied ? (
              <>
                <CheckCircleBold size={15} className="text-emerald-400" />
                <span className="text-emerald-300">¡Copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <CopyBold size={15} className="text-amber-400" />
                <span>Copiar resumen de operación</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-all cursor-pointer border-none"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
