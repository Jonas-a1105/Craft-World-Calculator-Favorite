import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useCoinLivePrice,
  GECKOTERMINAL_POOL_URL,
} from '../../../../services/coinPriceService';
import { CoinMarketTab } from './coin-modal/CoinMarketTab';
import { CoinConverterTab } from './coin-modal/CoinConverterTab';

interface CoinPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinPriceModal: React.FC<CoinPriceModalProps> = ({ isOpen, onClose }) => {
  const { data: marketData, isFetching: isRefreshingPrice } = useCoinLivePrice();
  const [activeTab, setActiveTab] = useState<'chart' | 'converter'>('chart');
  const basePrice = marketData?.priceUsd ?? 0.0002105;

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Full Viewport Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card (Centered in viewport, matte dark, no borders) */}
      <div
        className="relative w-full max-w-xl sm:max-w-2xl bg-[#141416] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 z-10 max-h-[92vh] overflow-y-auto overflow-x-hidden border-0 outline-none route-view"
        style={{ border: 'none', outline: 'none' }}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#24252e] flex items-center justify-center shrink-0">
              <img
                src="/assets/resources/Coin.png"
                alt="COIN"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Dyno Coin
                </h2>
                <span className="text-[11px] font-mono font-bold bg-[#24252e] text-amber-400 px-2 py-0.5 rounded-md shrink-0">
                  COIN
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Red Ronin • Katana V3 DEX • Oficial de Craft World
              </p>
            </div>
          </div>

          {/* Action buttons: Link & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={GECKOTERMINAL_POOL_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en GeckoTerminal"
              className="w-8 h-8 rounded-full bg-[#24252e] hover:bg-[#2e303a] text-zinc-300 hover:text-white flex items-center justify-center transition-colors border-0 outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={onClose}
              title="Cerrar ventana"
              className="w-8 h-8 rounded-full bg-[#24252e] hover:bg-[#2e303a] text-zinc-300 hover:text-white flex items-center justify-center transition-colors border-0 outline-none cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Segmented Tab Switcher (Gráfica / Conversor) */}
        <div className="grid grid-cols-2 p-1 bg-[#1c1c20] rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 outline-none cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'chart'
                ? 'bg-[#282932] text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <span>Gráfica & Mercado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-0 outline-none cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'converter'
                ? 'bg-[#282932] text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>Conversor COIN</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chart' ? (
          <CoinMarketTab
            marketData={marketData}
            basePrice={basePrice}
            isRefreshingPrice={isRefreshingPrice}
          />
        ) : (
          <CoinConverterTab marketData={marketData} basePrice={basePrice} />
        )}
      </div>
    </div>,
    document.body,
  );
};
