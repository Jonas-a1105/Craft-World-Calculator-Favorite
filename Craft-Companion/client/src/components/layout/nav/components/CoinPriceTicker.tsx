import React, { useState } from 'react';
import {
  useCoinLivePrice,
  formatCoinPrice,
  formatPriceChange,
} from '../../../../services/coinPriceService';
import { CoinPriceModal } from './CoinPriceModal';

export const CoinPriceTicker: React.FC = () => {
  const { data: coinData, isFetching } = useCoinLivePrice();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const priceFormatted = formatCoinPrice(coinData?.priceUsd ?? 0.0002105);
  const h1 = formatPriceChange(coinData?.h1Change ?? 0.04);
  const h24 = formatPriceChange(coinData?.h24Change ?? -3.38);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title={`COIN / WRON (Ronin Katana V3)\nPrecio: ${priceFormatted}\n1h: ${h1.text}\n24h: ${h24.text}\nClick para abrir gráfica de mercado y conversor`}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#24252e] hover:bg-[#2d2f3a] transition-all duration-150 text-xs shadow-none group select-none cursor-pointer border-0 outline-none shrink-0"
        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
      >
        {/* Coin Icon */}
        <img
          src="/assets/resources/Coin.png"
          alt="COIN"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block shrink-0 transition-transform group-hover:scale-110"
        />

        {/* Main Pair & Price */}
        <div className="flex items-center gap-1 font-mono leading-none">
          <span className="hidden sm:inline font-semibold text-white tracking-tight text-[11px] sm:text-xs">
            1 COIN =
          </span>
          <span className="font-bold text-amber-400 text-[11px] sm:text-xs">
            {priceFormatted}
          </span>
        </div>

        {/* Divider */}
        <span className="hidden sm:inline text-zinc-600 font-light select-none text-[11px] sm:text-xs">
          |
        </span>

        {/* 1h Change - Visible on desktop / tablet (md: >= 768px) */}
        <div className="hidden md:flex items-center gap-1 leading-none">
          <span className="text-slate-400 text-[10px] sm:text-[11px]">1h</span>
          <span
            className={`font-mono text-[10px] sm:text-[11px] font-semibold flex items-center ${
              h1.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {h1.text}
          </span>
        </div>

        {/* 24h Change - Visible on screens >= 400px to keep mobile spacious */}
        <div className="hidden min-[400px]:flex items-center gap-1 leading-none">
          <span className="text-slate-400 text-[10px] sm:text-[11px]">24h</span>
          <span
            className={`font-mono text-[10px] sm:text-[11px] font-semibold flex items-center ${
              h24.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {h24.text}
          </span>
        </div>

        {/* Subtle Live Update Pulse Indicator */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-opacity ${
            isFetching
              ? 'bg-amber-400 animate-ping opacity-80'
              : 'bg-emerald-500/60 opacity-40 group-hover:opacity-100'
          }`}
          title={isFetching ? 'Actualizando cotización...' : 'Cotización en vivo'}
        />
      </button>

      {/* Interactive Modal (Chart + Filters + Bidirectional Converter) */}
      <CoinPriceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default CoinPriceTicker;
