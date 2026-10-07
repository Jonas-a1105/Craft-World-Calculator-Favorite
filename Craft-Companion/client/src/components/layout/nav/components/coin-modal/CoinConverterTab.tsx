import React, { useState, useMemo } from 'react';
import {
  convertEcosystemCurrency,
  formatCoinPrice,
  formatCurrencyAmount,
  ECOSYSTEM_CURRENCIES,
  type EcosystemCurrency,
  type CoinMarketData,
} from '../../../../../services/coinPriceService';

interface CoinConverterTabProps {
  marketData?: CoinMarketData | null;
  basePrice: number;
}

export const CoinConverterTab: React.FC<CoinConverterTabProps> = ({ marketData, basePrice }) => {
  const [convertAmount, setConvertAmount] = useState<string>('10000');
  const [fromCurrency, setFromCurrency] = useState<EcosystemCurrency>('COIN');
  const [toCurrency, setToCurrency] = useState<EcosystemCurrency>('USD');

  const numericAmount = parseFloat(convertAmount) || 0;
  const convertedResult = useMemo(() => {
    return convertEcosystemCurrency(numericAmount, fromCurrency, toCurrency, marketData);
  }, [numericAmount, fromCurrency, toCurrency, marketData]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (convertedResult > 0) {
      setConvertAmount(
        toCurrency === 'COIN'
          ? Math.round(convertedResult).toString()
          : convertedResult < 1
          ? convertedResult.toFixed(4)
          : convertedResult.toFixed(2),
      );
    }
  };

  return (
    <div className="bg-[#1c1c21] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-150 overflow-hidden">
      {/* Top Header of Converter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
          Conversor del Ecosistema Ronin
        </span>
        <span className="text-[11px] text-zinc-400 font-mono">
          1 COIN ≈ {formatCoinPrice(basePrice)}
        </span>
      </div>

      {/* Symmetrical Dual Conversion Cards */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2.5 sm:gap-3 w-full min-w-0">
        {/* Card De (From) */}
        <div className="flex-1 w-full min-w-0 bg-[#141416] p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between gap-2.5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 w-7">
              De:
            </span>
            <div className="grid grid-cols-4 gap-0.5 bg-[#1f2026] p-0.5 rounded-xl w-[172px] shrink-0">
              {ECOSYSTEM_CURRENCIES.map((cur) => {
                const isSelected = fromCurrency === cur.id;
                return (
                  <button
                    key={cur.id}
                    type="button"
                    onClick={() => setFromCurrency(cur.id)}
                    className={`h-7 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all border-0 outline-none cursor-pointer flex items-center justify-center whitespace-nowrap leading-none ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white hover:bg-[#282934]'
                    }`}
                  >
                    {cur.symbol}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="number"
            min="0"
            step="any"
            value={convertAmount}
            onChange={(e) => setConvertAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-white focus:outline-none placeholder-zinc-700 min-w-0 h-9 sm:h-10 leading-none"
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center items-center py-0.5 sm:py-0 shrink-0">
          <button
            type="button"
            onClick={handleSwapCurrencies}
            title="Invertir dirección de conversión"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#24252e] hover:bg-[#2e303a] active:scale-95 text-amber-400 flex items-center justify-center transition-all cursor-pointer border-0 outline-none shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
        </div>

        {/* Card A (To) */}
        <div className="flex-1 w-full min-w-0 bg-[#141416] p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between gap-2.5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 w-7">
              A:
            </span>
            <div className="grid grid-cols-4 gap-0.5 bg-[#1f2026] p-0.5 rounded-xl w-[172px] shrink-0">
              {ECOSYSTEM_CURRENCIES.map((cur) => {
                const isSelected = toCurrency === cur.id;
                return (
                  <button
                    key={cur.id}
                    type="button"
                    onClick={() => setToCurrency(cur.id)}
                    className={`h-7 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all border-0 outline-none cursor-pointer flex items-center justify-center whitespace-nowrap leading-none ${
                      isSelected
                        ? 'bg-amber-400 text-black shadow-sm font-black'
                        : 'text-zinc-400 hover:text-white hover:bg-[#282934]'
                    }`}
                  >
                    {cur.symbol}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full bg-transparent text-2xl sm:text-3xl font-mono font-bold text-amber-400 truncate flex items-center min-w-0 h-9 sm:h-10 leading-none">
            {formatCurrencyAmount(convertedResult, toCurrency)}
          </div>
        </div>
      </div>

      {/* Quick Presets & Right-Aligned 1 RON Reference */}
      <div className="pt-2 border-t border-white/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Quick Amount Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">Rápido:</span>
            {(fromCurrency === 'COIN'
              ? ['1000', '10000', '50000', '100000']
              : ['1', '10', '50', '100']
            ).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setConvertAmount(preset)}
                className="px-2.5 py-1 rounded-lg bg-[#24252e] hover:bg-[#2d2f3a] text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors border-0 outline-none cursor-pointer"
              >
                +{Number(preset).toLocaleString('en-US')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setConvertAmount('0')}
              className="px-2.5 py-1 rounded-lg bg-[#24252e] hover:bg-[#2d2f3a] text-xs font-mono font-medium text-zinc-400 hover:text-rose-400 transition-colors border-0 outline-none cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          {/* 1 RON Reference - Strictly Pinned to the Right */}
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-end self-end sm:self-auto shrink-0 ml-auto">
            <span>1 RON ≈&nbsp;</span>
            <span className="text-white font-semibold">
              {(marketData?.ronInCoin ?? 295.03).toFixed(1)} COIN
            </span>
            <span className="text-zinc-500 ml-1.5">
              (${marketData?.quotePriceUsd?.toFixed(4) ?? '0.0633'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
