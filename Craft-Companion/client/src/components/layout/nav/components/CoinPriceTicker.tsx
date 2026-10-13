import React, { useEffect, useRef, useState } from 'react';
import {
  useCoinLivePrice,
  formatCoinPrice,
  formatPriceChange,
} from '../../../../services/coinPriceService';
import { CoinPriceModal } from './CoinPriceModal';
import { useTranslation } from '../../../../utils/i18n';

// Umbral relativo para considerar que el precio "cambió de verdad" y pulsar
// el indicador — evita el ping cosmético cada 5s cuando el precio no se movió.
const PRICE_CHANGED_REL_THRESHOLD = 0.0002; // 0.02%

export const CoinPriceTicker: React.FC = () => {
  const { data: coinData } = useCoinLivePrice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useTranslation();

  const hasData = Boolean(coinData && coinData.priceUsd > 0);
  const sourceLabel: 'live' | 'cache' | 'none' = !hasData
    ? 'none'
    : coinData!.source === 'cache'
      ? 'cache'
      : coinData!.source === 'default'
        ? 'none'
        : 'live';

  // Pulso SOLO cuando el precio cambia de forma perceptible (no en cada fetch).
  const [justUpdated, setJustUpdated] = useState(false);
  const prevPriceRef = useRef<number | null>(null);
  useEffect(() => {
    const price = coinData?.priceUsd;
    if (typeof price !== 'number' || price <= 0) return;
    const prev = prevPriceRef.current;
    if (prev !== null && prev > 0) {
      const relDelta = Math.abs(price - prev) / prev;
      if (relDelta >= PRICE_CHANGED_REL_THRESHOLD) {
        setJustUpdated(true);
        const timer = setTimeout(() => setJustUpdated(false), 1200);
        prevPriceRef.current = price;
        return () => clearTimeout(timer);
      }
    }
    prevPriceRef.current = price;
  }, [coinData?.priceUsd]);

  const priceFormatted = hasData ? formatCoinPrice(coinData!.priceUsd) : '—';
  const h1 = formatPriceChange(hasData ? coinData!.h1Change : 0);
  const h24 = formatPriceChange(hasData ? coinData!.h24Change : 0);

  const isEs = language === 'es';
  const statusText =
    sourceLabel === 'live'
      ? isEs ? 'Cotización en vivo de Katana V3' : 'Live Katana V3 quote'
      : sourceLabel === 'cache'
        ? isEs
          ? `Cotización en caché — última sync ${new Date(coinData!.updatedAt).toLocaleTimeString()}`
          : `Cached quote — last sync ${new Date(coinData!.updatedAt).toLocaleTimeString()}`
        : isEs ? 'Sin datos del mercado (reintentando)' : 'No market data (retrying)';

  const fullTitle = `COIN / WRON (Ronin Katana V3)\n${
    isEs ? 'Precio' : 'Price'
  }: ${priceFormatted}\n1h: ${hasData ? h1.text : '—'}\n24h: ${
    hasData ? h24.text : '—'
  }\n${isEs ? 'Fuente' : 'Source'}: ${statusText}\n${
    isEs ? 'Click para abrir gráfica de mercado y conversor' : 'Click to open market chart & converter'
  }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title={fullTitle}
        aria-label={`COIN ${priceFormatted}. ${statusText}`}
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-oled-pill hover:bg-oled-pillHover transition-all duration-150 text-xs shadow-none group select-none cursor-pointer border-0 outline-none shrink-0"
        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
      >
        {/* Coin Icon */}
        <img
          src="/assets/resources/Coin.png"
          alt=""
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block shrink-0 transition-transform group-hover:scale-110"
        />

        {/* Main Pair & Price */}
        <div className="flex items-center gap-1 font-mono leading-none">
          <span className="hidden sm:inline font-semibold text-white tracking-tight text-[11px] sm:text-xs">
            1 COIN =
          </span>
          <span className={`font-bold text-[11px] sm:text-xs ${hasData ? 'text-amber-400' : 'text-zinc-400'}`}>
            {priceFormatted}
          </span>
        </div>

        {hasData && (
          <>
            {/* Divider */}
            <span className="hidden sm:inline text-zinc-400 font-light select-none text-[11px] sm:text-xs">
              |
            </span>

            {/* 1h Change - Visible on desktop / tablet (md: >= 768px) */}
            <div className="hidden md:flex items-center gap-1 leading-none">
              <span className="text-slate-400 text-[11px] sm:text-[11px]">1h</span>
              <span
                className={`font-mono text-[11px] sm:text-[11px] font-semibold flex items-center ${
                  h1.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {h1.text}
              </span>
            </div>

            {/* 24h Change - Visible on screens >= 400px to keep mobile spacious */}
            <div className="hidden min-[400px]:flex items-center gap-1 leading-none">
              <span className="text-slate-400 text-[11px] sm:text-[11px]">24h</span>
              <span
                className={`font-mono text-[11px] sm:text-[11px] font-semibold flex items-center ${
                  h24.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {h24.text}
              </span>
            </div>
          </>
        )}

        {/* Data source trust dot: green live / amber cache / gray none,
            ping only when the price actually moved. */}
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
            sourceLabel === 'live'
              ? `bg-emerald-500/70 ${justUpdated ? 'animate-ping' : 'opacity-60 group-hover:opacity-100'}`
              : sourceLabel === 'cache'
                ? 'bg-amber-400/80'
                : 'bg-zinc-600'
          }`}
          title={statusText}
        />

        {/* Explicit source badge when not live — never pass stale as live */}
        {sourceLabel !== 'live' && (
          <span
            className={`hidden sm:inline px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wide ${
              sourceLabel === 'cache'
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-zinc-700/50 text-zinc-400'
            }`}
          >
            {sourceLabel === 'cache' ? (isEs ? 'Caché' : 'Cache') : (isEs ? 'Sin datos' : 'No data')}
          </span>
        )}
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
