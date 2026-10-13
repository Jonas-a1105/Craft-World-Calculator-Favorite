import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { BaseCostSettings, CategoryKey } from '../types';
import { BASE_COST_CATEGORIES } from '../data/baseCostCatalog';
import {
  MagniferLinear,
  CloseCircleBoldDuotone,
  BatteryChargeBoldDuotone,
  BoltBoldDuotone,
  CartLargeBoldDuotone,
  QuestionCircleBoldDuotone,
} from 'solar-icon-set';
import { useTranslation } from '../../../utils/i18n';
import { useModalA11y } from '../../../hooks/useModalA11y';

interface BaseCostSettingsBarProps {
  settings: BaseCostSettings;
  search: string;
  selectedCategory: CategoryKey;
  strategyFilter: 'all' | 'craft' | 'buy';
  onUpdateSettings: (partial: Partial<BaseCostSettings>) => void;
  onSearchChange: (search: string) => void;
  onSelectCategory: (category: CategoryKey) => void;
  onStrategyFilterChange: (filter: 'all' | 'craft' | 'buy') => void;
}

export const BaseCostSettingsBar: React.FC<BaseCostSettingsBarProps> = ({
  settings,
  search,
  selectedCategory,
  strategyFilter,
  onUpdateSettings,
  onSearchChange,
  onSelectCategory,
  onStrategyFilterChange,
}) => {
  const [showMasteryHelp, setShowMasteryHelp] = useState(false);
  const { language } = useTranslation();
  const isEs = language === 'es';
  const masteryDialogRef = useModalA11y(showMasteryHelp);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showMasteryHelp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMasteryHelp]);

  // Close on ESC key
  useEffect(() => {
    if (!showMasteryHelp) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMasteryHelp(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMasteryHelp]);

  return (
    <div className="flex flex-col gap-4 rounded-[28px] sm:rounded-[32px] bg-oled-card p-4 sm:p-5 shadow-md select-none border-none">
      {/* Top Row: Financial parameters (Slippages & Power) - Expands Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
        {/* Buy Slippage */}
        <label className="flex items-center justify-between cursor-pointer select-none bg-oled-cardInner hover:bg-[#17171c] px-3.5 py-2.5 rounded-2xl w-full transition-colors shadow-inner">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.buySlippage}
              onChange={(e) => onUpdateSettings({ buySlippage: e.target.checked })}
              className="w-4 h-4 rounded bg-oled-cardInner border-none text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
            <span className="text-slate-300 text-xs font-mono font-medium">Buy slippage</span>
          </div>
          <div className="flex items-center gap-1.5 bg-oled-cardInner px-3 py-1 rounded-xl font-mono text-xs shadow-sm">
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
        <label className="flex items-center justify-between cursor-pointer select-none bg-oled-cardInner hover:bg-[#17171c] px-3.5 py-2.5 rounded-2xl w-full transition-colors shadow-inner">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.sellSlippage}
              onChange={(e) => onUpdateSettings({ sellSlippage: e.target.checked })}
              className="w-4 h-4 rounded bg-oled-cardInner border-none text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
            />
            <span className="text-slate-300 text-xs font-mono font-medium">Sell slippage</span>
          </div>
          <div className="flex items-center gap-1.5 bg-oled-cardInner px-3 py-1 rounded-xl font-mono text-xs shadow-sm">
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

        {/* Market / DEX Fee (5%) */}
        <label className="flex items-center justify-between cursor-pointer select-none bg-oled-cardInner hover:bg-[#17171c] px-3.5 py-2.5 rounded-2xl w-full transition-colors shadow-inner">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={settings.marketFee ?? true}
              onChange={(e) => onUpdateSettings({ marketFee: e.target.checked })}
              className="w-4 h-4 rounded bg-oled-cardInner border-none text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
            />
            <span className="text-slate-300 text-xs font-mono font-medium">Market fee</span>
          </div>
          <div className="flex items-center gap-1.5 bg-oled-cardInner px-3 py-1 rounded-xl font-mono text-xs shadow-sm">
            <input
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={settings.marketFeePct ?? 5}
              onChange={(e) =>
                onUpdateSettings({
                  marketFeePct: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-10 bg-transparent text-center text-emerald-300 font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-slate-400 font-semibold">%</span>
          </div>
        </label>

        {/* Power Price */}
        <div className="flex items-center justify-between bg-oled-cardInner px-3.5 py-2.5 rounded-2xl w-full shadow-inner">
          <div className="flex items-center gap-2">
            <BatteryChargeBoldDuotone size={18} className="text-cyan-400 shrink-0" />
            <span className="text-slate-300 text-xs font-mono font-medium">Power:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-oled-cardInner px-3 py-1 rounded-xl font-mono text-xs shadow-sm">
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

      {/* Middle Row: Filters & Calculation Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
        {/* Left: Strategy Segmented Control (All / Best Craft / Best Buy) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
            {isEs ? 'Estrategia:' : 'Strategy:'}
          </span>
          <div className="flex items-center gap-1.5 bg-oled-cardInner p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => onStrategyFilterChange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                strategyFilter === 'all'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEs ? 'Todos' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => onStrategyFilterChange('craft')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                strategyFilter === 'craft'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BoltBoldDuotone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEs ? 'Mejor Craftear' : 'Best Craft'}</span>
            </button>
            <button
              type="button"
              onClick={() => onStrategyFilterChange('buy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                strategyFilter === 'buy'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CartLargeBoldDuotone className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEs ? 'Mejor Comprar' : 'Best Buy'}</span>
            </button>
          </div>
        </div>

        {/* Right: Mastery Mode Selector (Individual / Chain) + Help Popover Button */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
            {isEs ? 'Modo Maestría:' : 'Mastery Mode:'}
          </span>
          <div className="flex items-center gap-1.5 bg-oled-cardInner p-1 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => onUpdateSettings({ masteryMode: 'individual' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                (settings.masteryMode ?? 'individual') === 'individual'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isEs
                ? 'Calcula según el nivel y maestría individual real de cada fábrica en tu cuenta'
                : 'Calculates using the real individual level and mastery of each factory in your account'}
            >
              <span>{isEs ? 'Cuenta Real' : 'Real Account'}</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ masteryMode: 'chain' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                settings.masteryMode === 'chain'
                  ? 'bg-amber-400 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isEs
                ? 'Simula la cadena completa: la maestría del recurso seleccionado se hereda a todos sus ingredientes previos'
                : 'Simulates the full chain: the mastery of the selected resource is inherited by all its previous ingredients'}
            >
              <span>{isEs ? 'Cadena Completa' : 'Full Chain'}</span>
            </button>
          </div>

          {/* Help Question Popover Trigger */}
          <button
            type="button"
            onClick={() => setShowMasteryHelp(true)}
            className="p-1.5 rounded-xl bg-oled-cardInner text-amber-400/80 hover:text-amber-400 hover:bg-oled-pillHover transition-all cursor-pointer shadow-inner"
            title={isEs
              ? '¿Cuál es la diferencia entre Cuenta Real y Cadena Completa?'
              : 'What is the difference between Real Account and Full Chain?'}
          >
            <QuestionCircleBoldDuotone size={18} />
          </button>
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
            placeholder={isEs ? 'Buscar recurso...' : 'Search resource...'}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-oled-cardInner text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none shadow-inner border-none"
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
                : 'bg-oled-cardInner text-slate-400 hover:bg-oled-pillHover hover:text-slate-200'
            }`}
          >
            {isEs ? 'Todos' : 'All'} ({48})
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
                    : 'bg-oled-cardInner text-slate-400 hover:bg-oled-pillHover hover:text-slate-200'
                }`}
              >
                {isEs ? cat.labelEs : cat.labelEn} ({cat.resources.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Help Popover / Modal (Portal mounted to document.body) */}
      {showMasteryHelp && typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pb-28 sm:pb-32 select-none animate-in fade-in duration-200">
            {/* Full Viewport Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => setShowMasteryHelp(false)}
              aria-hidden="true"
            />

            {/* Modal Card - 2 Column Grid, sleek dark tokens, zero borders */}
            <div
              ref={masteryDialogRef}
              tabIndex={-1}
              className="relative w-full max-w-xl sm:max-w-2xl bg-[#161619] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl flex flex-col gap-4 z-10 max-h-[85vh] overflow-y-auto overflow-x-hidden border-none outline-none select-text"
              style={{ border: 'none', outline: 'none' }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={isEs ? 'Modos de cálculo de maestría' : 'Mastery calculation modes'}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-400/10 text-amber-400 shrink-0">
                    <QuestionCircleBoldDuotone size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-base sm:text-lg font-bold">
                      {isEs ? 'Modos de Cálculo de Maestría' : 'Mastery Calculation Modes'}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      {isEs
                        ? 'Elige cómo se aplica el bono de maestría en las recetas de producción'
                        : 'Choose how the mastery bonus is applied to production recipes'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMasteryHelp(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-none"
                >
                  <CloseCircleBoldDuotone size={22} />
                </button>
              </div>

              {/* 2 Comparison Cards (Side-by-side on desktop so it doesn't stretch vertically) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option 1: Cuenta Real */}
                <div className="bg-[#111114] p-4 rounded-2xl border-none shadow-inner flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                        🏭 {isEs ? 'Cuenta Real' : 'Real Account'}
                      </span>
                      <span className="bg-amber-400/10 text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                        {isEs ? 'Recomendado' : 'Recommended'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isEs
                        ? <>Calcula con la <strong className="text-white font-semibold">maestría individual real</strong> que tiene cada fábrica en tu cuenta o lo que configures en cada tarjeta.</>
                        : <>Uses the <strong className="text-white font-semibold">real individual mastery</strong> each factory has in your account or whatever you set per card.</>}
                    </p>
                  </div>
                  <div className="bg-oled-card p-2.5 rounded-xl text-[11px] text-slate-400 leading-relaxed border-none">
                    <span className="text-slate-200 font-semibold block mb-0.5">{isEs ? 'Ejemplo Arena:' : 'Sand example:'}</span>
                    {isEs
                      ? <>Si Arena está en M10 pero Arcilla está en M0, solo Arena recibe bono (<span className="text-amber-400 font-semibold font-mono">85.5 Earth</span>). Refleja tus costos exactos de hoy.</>
                      : <>If Sand is M10 but Clay is M0, only Sand gets the bonus (<span className="text-amber-400 font-semibold font-mono">85.5 Earth</span>). Reflects your exact costs today.</>}
                  </div>
                </div>

                {/* Option 2: Cadena Completa */}
                <div className="bg-[#111114] p-4 rounded-2xl border-none shadow-inner flex flex-col justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold text-sm flex items-center gap-1.5">
                        🔗 {isEs ? 'Cadena Completa' : 'Full Chain'}
                      </span>
                      <span className="bg-cyan-400/10 text-cyan-300 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                        {isEs ? 'Heredada' : 'Inherited'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {isEs
                        ? <>Simula que <strong className="text-white font-semibold">todos los ingredientes previos</strong> de la receta heredan la misma maestría que el recurso final.</>
                        : <>Simulates that <strong className="text-white font-semibold">all previous ingredients</strong> in the recipe inherit the same mastery as the final resource.</>}
                    </p>
                  </div>
                  <div className="bg-oled-card p-2.5 rounded-xl text-[11px] text-slate-400 leading-relaxed border-none">
                    <span className="text-slate-200 font-semibold block mb-0.5">{isEs ? 'Ejemplo Arena:' : 'Sand example:'}</span>
                    {isEs
                      ? <>Arena M10 hereda M10 a Arcilla y Barro (<span className="text-cyan-400 font-semibold font-mono">77.2 Earth</span>). Ideal para saber el costo mínimo al maximizar la industria.</>
                      : <>Sand M10 passes M10 to Clay and Mud (<span className="text-cyan-400 font-semibold font-mono">77.2 Earth</span>). Ideal to know the minimum cost when maximizing industry.</>}
                  </div>
                </div>
              </div>

              {/* Note on M0 */}
              <div className="bg-[#111114] px-3.5 py-2.5 rounded-2xl text-[11px] sm:text-xs text-slate-400 leading-relaxed flex items-center gap-2.5 shadow-inner border-none">
                <span className="text-amber-400 text-base shrink-0">💡</span>
                <span>
                  {isEs ? (
                    <>
                      <strong className="text-slate-200">Nota:</strong> Si una tarjeta está en <span className="text-amber-400 font-semibold">M0</span>, ambos modos muestran lo mismo (0% heredado es 0%). Para notar la diferencia, sube cualquier tarjeta a <span className="text-white font-semibold">M1–M10</span>.
                    </>
                  ) : (
                    <>
                      <strong className="text-slate-200">Note:</strong> If a card is at <span className="text-amber-400 font-semibold">M0</span>, both modes show the same (0% inherited is 0%). To see the difference, raise any card to <span className="text-white font-semibold">M1–M10</span>.
                    </>
                  )}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-none">
                <span className="text-[11px] text-slate-400 font-sans">
                  {isEs
                    ? 'Alterna entre ambos modos en cualquier momento.'
                    : 'Switch between both modes at any time.'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMasteryHelp(false)}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer border-none"
                >
                  {isEs ? 'Entendido' : 'Got it'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
