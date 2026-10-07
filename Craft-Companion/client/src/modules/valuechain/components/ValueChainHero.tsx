import React from 'react';
import type { ValueChainMode } from '../types';
import { BoltBoldDuotone, LeafBoldDuotone, CartLargeBoldDuotone } from 'solar-icon-set';

interface ValueChainHeroProps {
  mode: ValueChainMode;
  selectedLevel: number;
  onModeChange: (m: ValueChainMode) => void;
  onLevelChange: (lvl: number) => void;
  language: string;
}

export const ValueChainHero: React.FC<ValueChainHeroProps> = ({
  mode,
  selectedLevel,
  onModeChange,
  onLevelChange,
  language,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1c1c20] via-slate-900 to-indigo-950 border-none p-6 md:p-8 rounded-3xl shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border-none px-3 py-1 rounded-full w-fit mb-3">
            <BoltBoldDuotone className="w-4 h-4 text-emerald-400" />
            <span>ANALIZADOR DE CADENA INDUSTRIAL</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {language === 'es'
              ? 'Mapa de Valor y Transformación'
              : 'Value Chain & Transformation Map'}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
            {language === 'es'
              ? 'Calcula exactamente cuánto dinero ganas al procesar tus materias primas paso a paso en lugar de vender la tierra cruda en la bolsa.'
              : 'Calculate exactly how much profit you make processing raw materials step-by-step instead of selling raw earth on the market.'}
          </p>
        </div>

        {/* Mode & Level Selection Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#151518] p-2 rounded-2xl border-none">
          <div className="flex items-center bg-[#202024] p-1 rounded-xl">
            <button
              onClick={() => onModeChange('self_crafted')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'self_crafted'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LeafBoldDuotone className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Farmeo Propio ($0)' : 'Self-farmed ($0)'}</span>
            </button>
            <button
              onClick={() => onModeChange('market_buy')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'market_buy'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CartLargeBoldDuotone className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Mercado' : 'Market Buy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#202024] rounded-xl border-none">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'es' ? 'Nivel:' : 'Level:'}
            </span>
            <input
              type="number"
              min="1"
              max="40"
              value={selectedLevel}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              className="w-12 bg-[#151518] border-none rounded-lg text-center text-xs font-extrabold text-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
