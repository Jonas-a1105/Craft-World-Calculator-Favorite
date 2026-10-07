import React from 'react';
import type { ComparisonVerdict } from '../types';
import { formatNumber, formatCompactNumber } from '../../../utils/formatters';

export interface CompareVerdictCardProps {
  verdict: ComparisonVerdict;
  language: 'es' | 'en';
}

export const CompareVerdictCard: React.FC<CompareVerdictCardProps> = ({
  verdict,
  language,
}) => {
  return (
    <div className="bg-[#18181b] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border-none space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
          VS
        </div>
        <div>
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
            {language === 'es' ? 'Veredicto de Comparación' : 'Comparison Verdict'}
          </h3>
          <span className="text-xs text-zinc-400">
            {verdict.profitWinner === 'TIE'
              ? language === 'es'
                ? 'Ambas opciones generan la misma rentabilidad diaria.'
                : 'Both options yield equal daily profits.'
              : language === 'es'
                ? `La Opción ${verdict.profitWinner} es la más rentable con +${formatNumber(verdict.profitDiffAbs)} COIN extra al día.`
                : `Option ${verdict.profitWinner} is more profitable with +${formatNumber(verdict.profitDiffAbs)} COIN extra per day.`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Metric 1: Profit Diff */}
        <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Diferencia de Ganancia' : 'Profit Difference'}
          </span>
          <div className="font-mono font-extrabold text-base flex items-baseline">
            <span
              className={
                verdict.profitWinner === 'A'
                  ? 'text-sky-400'
                  : verdict.profitWinner === 'B'
                    ? 'text-amber-400'
                    : 'text-zinc-400'
              }
            >
              {verdict.profitWinner === 'TIE'
                ? 'Iguales'
                : `Opción ${verdict.profitWinner} (+${formatNumber(verdict.profitDiffAbs)})`}
            </span>
            {verdict.profitWinner !== 'TIE' && (
              <span className="text-amber-400 text-xs ml-1 font-bold">
                COIN/día
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Output Diff */}
        <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Volumen de Producción' : 'Production Volume'}
          </span>
          <div className="font-mono font-extrabold text-base text-zinc-200">
            {verdict.outputWinner === 'TIE'
              ? language === 'es'
                ? 'Mismo volumen'
                : 'Equal output'
              : `Opción ${verdict.outputWinner} (+${formatNumber(verdict.outputDiffDay)}/día)`}
          </div>
        </div>

        {/* Metric 3: XP Diff */}
        <div className="bg-[#141416] rounded-[22px] p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
            {language === 'es' ? 'Experiencia (XP)' : 'Experience (XP)'}
          </span>
          <div className="font-mono font-extrabold text-base text-amber-300">
            {verdict.xpWinner === 'TIE'
              ? language === 'es'
                ? 'Misma XP'
                : 'Equal XP'
              : `Opción ${verdict.xpWinner} (+${formatCompactNumber(verdict.xpDiffDay)} XP)`}
          </div>
        </div>
      </div>
    </div>
  );
};
