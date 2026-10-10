import React from 'react';
import type { MaterialEntry } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';
import {
  CheckCircleBold,
  CartLargeBoldDuotone,
  BoltBoldDuotone,
  TagPriceBold,
} from 'solar-icon-set';

export interface MaterialCardProps {
  material: MaterialEntry;
  language: 'es' | 'en';
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  language,
}) => {
  const {
    symbol,
    stageIndex,
    isTarget,
    isRawElement,
    requiredQty,
    currentStock,
    missing,
    percentCovered,
    unitPrice,
    costOfMissing,
    tacticalAction,
    inputSymbol,
    inputRequiredQty,
    inputSellRevenue,
    targetBuyCost,
    arbitrageDelta,
    arbitrageBenefitPercent,
    directInputs,
    factoryName,
  } = material;

  const isEs = language === 'es';

  return (
    <div className="rounded-[32px] bg-[#18181b] hover:bg-[#1c1c20] p-5 shadow-xl transition-all duration-200 border-none select-none flex flex-col justify-between space-y-4">
      {/* 1. Header: Stage # + Icon + Title + Stage Badge + Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Stage Order Badge */}
          <div className="w-7 h-7 rounded-xl bg-zinc-800/80 text-zinc-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
            #{stageIndex || 1}
          </div>

          <div className="w-11 h-11 rounded-2xl bg-zinc-800/50 flex items-center justify-center shrink-0 shadow-inner">
            <ResourceIcon symbol={symbol} size={28} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-wider">
                {symbol}
              </h3>
              {isTarget && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase">
                  {isEs ? 'Meta Final' : 'Final Goal'}
                </span>
              )}
              {isRawElement && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                  {isEs ? 'Materia Base' : 'Raw Base'}
                </span>
              )}
            </div>

            {unitPrice > 0 && (
              <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                <span>~{formatNumber(unitPrice, unitPrice < 1 ? 4 : 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
                <span>/u</span>
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shrink-0 ${
            missing === 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {missing === 0 ? (
            <>
              <CheckCircleBold className="w-3.5 h-3.5" />
              <span>{isEs ? 'En Almacén' : 'In Stock'}</span>
            </>
          ) : (
            <span>
              {isEs ? `Faltan ${formatNumber(missing)}` : `Need ${formatNumber(missing)}`}
            </span>
          )}
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400 font-bold">
            {isEs ? 'Cobertura:' : 'Stock Coverage:'}
          </span>
          <span
            className={`font-mono font-black ${
              percentCovered >= 100
                ? 'text-emerald-400'
                : percentCovered >= 50
                  ? 'text-sky-400'
                  : 'text-amber-400'
            }`}
          >
            {percentCovered}%
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentCovered >= 100
                ? 'bg-emerald-500'
                : percentCovered >= 50
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
            }`}
            style={{ width: `${percentCovered}%` }}
          />
        </div>
      </div>

      {/* 3. Quantities Grid Subarea */}
      <div className="bg-zinc-800/50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
            {isEs ? 'Requerido' : 'Required'}
          </span>
          <span className="font-extrabold text-white font-mono mt-0.5 block">
            {formatNumber(requiredQty)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
            {isEs ? 'En Almacén' : 'In Stock'}
          </span>
          <span className="font-extrabold text-zinc-300 font-mono mt-0.5 block">
            {formatNumber(currentStock)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">
            {isEs ? 'Faltantes' : 'Missing'}
          </span>
          <span
            className={`font-mono font-extrabold mt-0.5 block ${
              missing === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatNumber(missing)}
          </span>
        </div>
      </div>

      {/* 4. Chain Arbitrage Decision Subcard (Vender Insumo vs Convertir en Fábrica) */}
      <div className="bg-zinc-900/60 p-3.5 rounded-2xl space-y-2.5 text-xs">
        {/* Tactical Verdict Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {tacticalAction === 'sell_input_buy_next' ? (
              <TagPriceBold className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : tacticalAction === 'convert_in_factory' ? (
              <BoltBoldDuotone className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <CartLargeBoldDuotone className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span
              className={`font-extrabold tracking-wide uppercase truncate ${
                tacticalAction === 'sell_input_buy_next'
                  ? 'text-emerald-300'
                  : tacticalAction === 'convert_in_factory'
                    ? 'text-cyan-300'
                    : 'text-amber-300'
              }`}
            >
              {tacticalAction === 'sell_input_buy_next'
                ? isEs
                  ? `VENDER ${inputSymbol} Y COMPRAR ${symbol}`
                  : `SELL ${inputSymbol} & BUY ${symbol}`
                : tacticalAction === 'convert_in_factory'
                  ? isEs
                    ? 'CONVERTIR EN FÁBRICA'
                    : 'CONVERT IN FACTORY'
                  : isEs
                    ? 'INSUMO BASE (EXTRAER / COMPRAR)'
                    : 'BASE INPUT (HARVEST / BUY)'}
            </span>
          </div>

          {/* Arbitrage Benefit Badge */}
          {tacticalAction === 'sell_input_buy_next' && arbitrageDelta > 0 && (
            <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-emerald-500/20 text-emerald-300 shrink-0">
              +{formatNumber(arbitrageDelta, 2)} COIN (+{arbitrageBenefitPercent.toFixed(0)}%)
            </span>
          )}
          {tacticalAction === 'convert_in_factory' && Math.abs(arbitrageDelta) > 0 && (
            <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[11px] bg-cyan-500/20 text-cyan-300 shrink-0">
              {isEs ? 'Ahorras' : 'Save'} {formatNumber(Math.abs(arbitrageDelta), 2)} COIN
            </span>
          )}
        </div>

        {/* Pricing Comparison Breakdown */}
        {tacticalAction === 'sell_input_buy_next' && (
          <div className="space-y-1.5 pt-1.5 border-t border-white/[0.04] text-[11px]">
            <div className="flex justify-between items-center text-zinc-400">
              <span>
                {isEs ? 'Vender' : 'Sell'} {formatNumber(inputRequiredQty || 0)} {inputSymbol}:
              </span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span>+{formatNumber(inputSellRevenue || 0, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>
                {isEs ? 'Comprar' : 'Buy'} {formatNumber(requiredQty)} {symbol}:
              </span>
              <span className="font-mono font-bold text-zinc-300 flex items-center gap-1">
                <span>-{formatNumber(targetBuyCost || 0, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium italic pt-0.5">
              {isEs
                ? `Vender ${inputSymbol} te da más COIN de lo que cuesta comprar ${symbol} terminado. ¡Ganas dinero sin esperar el crafteo!`
                : `Selling ${inputSymbol} yields more COIN than buying finished ${symbol}. Save time and bank profit!`}
            </p>
          </div>
        )}

        {tacticalAction === 'convert_in_factory' && (
          <div className="space-y-1.5 pt-1.5 border-t border-white/[0.04] text-[11px]">
            <div className="flex justify-between items-center text-zinc-400">
              <span>
                {isEs ? 'Vender' : 'Sell'} {formatNumber(inputRequiredQty || 0)} {inputSymbol}:
              </span>
              <span className="font-mono font-bold text-zinc-300 flex items-center gap-1">
                <span>+{formatNumber(inputSellRevenue || 0, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span>
                {isEs ? 'Comprar' : 'Buy'} {formatNumber(requiredQty)} {symbol}:
              </span>
              <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
                <span>-{formatNumber(targetBuyCost || 0, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium italic pt-0.5">
              {isEs
                ? `No vendas ${inputSymbol}; transfórmalo en tu fábrica para evitar pagar sobreprecio en el mercado.`
                : `Don't sell ${inputSymbol}; transform it in your factory to avoid paying market premium.`}
            </p>
          </div>
        )}

        {tacticalAction === 'base_harvest' && (
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-zinc-400">
            <span>{isEs ? 'Punto de partida de la cadena' : 'Starting point of chain'}</span>
            {costOfMissing > 0 && (
              <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                <span>Faltantes: {formatNumber(costOfMissing, 2)}</span>
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3 h-3 object-contain inline-block" />
              </span>
            )}
          </div>
        )}

        {/* Direct Insumos consumed chips */}
        {directInputs && directInputs.length > 0 && (
          <div className="pt-1.5 border-t border-white/[0.04] flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">
              {factoryName ? `${factoryName}:` : isEs ? 'Consume:' : 'Requires:'}
            </span>
            {directInputs.map((inp) => (
              <span
                key={inp.token}
                className="bg-zinc-800/70 text-zinc-300 px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1"
              >
                <ResourceIcon symbol={inp.token} size={13} />
                <span>
                  {formatNumber(inp.amountPerUnit, inp.amountPerUnit < 1 ? 2 : 0)}x {inp.token}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
