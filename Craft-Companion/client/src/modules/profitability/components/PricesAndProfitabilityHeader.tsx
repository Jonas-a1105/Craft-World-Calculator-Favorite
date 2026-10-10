import React from 'react';
import {
  BoltBold,
  SettingsBoldDuotone,
  BatteryChargeBoldDuotone,
} from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';
import type { GlobalProfitabilitySettings } from '../types';

interface PricesAndProfitabilityHeaderProps {
  settings: GlobalProfitabilitySettings;
  onUpdateSettings: <K extends keyof GlobalProfitabilitySettings>(
    key: K,
    val: GlobalProfitabilitySettings[K],
  ) => void;
  hasActiveAccount: boolean;
  onResetAccount: () => void;
}

export const PricesAndProfitabilityHeader: React.FC<PricesAndProfitabilityHeaderProps> = ({
  settings,
  onUpdateSettings,
  hasActiveAccount,
  onResetAccount,
}) => {
  const { language } = useTranslation();
  const isEs = language === 'es';

  return (
    <div className="w-full space-y-4">
      {/* Module Title with Game Typography (.font-game .font-impostor) & Subtitle */}
      <div className="text-center space-y-1.5 max-w-2xl mx-auto px-4 select-none">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-game font-impostor text-white tracking-wider uppercase drop-shadow-md">
          {isEs ? 'Precios y Rentabilidad' : 'Prices & Profitability'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {isEs
            ? 'Monitorea precios del mercado Ronin en vivo y simula la rentabilidad horaria de tus fábricas activas.'
            : 'Track live Ronin market prices and estimate your factory hourly profitability based on your setup.'}
        </p>
      </div>

      {/* Global Settings Card (Rounded 32px, Borderless, Clean Icons) */}
      <div className="bg-[#18181b] rounded-[32px] p-5 sm:p-6 shadow-xl space-y-4">
        {/* Top Header of Settings: Title + Account Sync & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/40 pb-3">
          <div className="flex items-center gap-2">
            <SettingsBoldDuotone className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
              {isEs ? 'Ajustes Globales de Simulación' : 'Global Simulation Settings'}
            </h2>
          </div>

          {hasActiveAccount && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-[11px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {isEs ? 'Datos de tu cuenta activos' : 'Account data active'}
              </span>
              <button
                type="button"
                onClick={onResetAccount}
                className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 hover:text-white font-bold transition-colors cursor-pointer"
                title={isEs ? 'Restablecer valores a tu cuenta real' : 'Reset values to your actual account'}
              >
                {isEs ? 'Restablecer' : 'Reset'}
              </button>
            </div>
          )}
        </div>

        {/* Settings Controls: Responsive Grid without weird wrapping on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. x2 Ad Boost */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800/80 cursor-pointer select-none transition-colors">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <BoltBold className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{isEs ? 'Boost Anuncios x2' : 'x2 Ad Boost'}</span>
            </span>
            <input
              type="checkbox"
              checked={settings.adBoost2x}
              onChange={(e) => onUpdateSettings('adBoost2x', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
          </label>

          {/* 2. Buy Slippage */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800/80 cursor-pointer select-none transition-colors">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              <span>{isEs ? 'Slippage Compra (1%)' : 'Buy Slippage (1%)'}</span>
            </span>
            <input
              type="checkbox"
              checked={settings.buySlippage}
              onChange={(e) => onUpdateSettings('buySlippage', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
          </label>

          {/* 3. Sell Slippage */}
          <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800/80 cursor-pointer select-none transition-colors">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{isEs ? 'Slippage Venta (1%)' : 'Sell Slippage (1%)'}</span>
            </span>
            <input
              type="checkbox"
              checked={settings.sellSlippage}
              onChange={(e) => onUpdateSettings('sellSlippage', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
          </label>

          {/* 4. Supply Mode Segmented Selector */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-zinc-800/50">
            <button
              type="button"
              onClick={() => onUpdateSettings('inputSupplyMode', 'market')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                settings.inputSupplyMode === 'market'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isEs ? 'Mercado' : 'Market'}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings('inputSupplyMode', 'self_crafted')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                settings.inputSupplyMode === 'self_crafted'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isEs ? 'Base Propia' : 'Self-Craft'}
            </button>
          </div>
        </div>

        {/* Secondary Row: Power Price Input */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/20 p-3 sm:p-3.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <BatteryChargeBoldDuotone className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-300">
              {isEs ? 'Precio de Energía Eléctrica:' : 'Electricity Power Price:'}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full">
              <input
                type="number"
                min="0"
                step="1"
                value={settings.powerPriceCoin}
                onChange={(e) =>
                  onUpdateSettings('powerPriceCoin', Math.max(0, Number(e.target.value) || 0))
                }
                className="w-16 bg-transparent text-center font-black text-xs text-white outline-none"
              />
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <img src="/assets/resources/Coin.png" alt="COIN" className="w-3.5 h-3.5 object-contain" />
                / 100k kW
              </span>
            </div>
            {settings.powerPriceCoin === 0 && (
              <span className="text-[10px] text-zinc-500 hidden sm:inline">
                {isEs ? '(Costo 0 kW activado)' : '(Zero cost enabled)'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
