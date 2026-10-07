import React from 'react';
import type { MaterialEntry } from '../types';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatNumber } from '../../../utils/formatters';

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
    requiredQty,
    currentStock,
    missing,
    percentCovered,
    unitPrice,
    costOfMissing,
  } = material;

  return (
    <div className="p-5 rounded-[24px] bg-[#141416] hover:bg-[#18181c] transition-all space-y-4 flex flex-col justify-between shadow-md">
      {/* Top: Icon + Title + Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#1b1b1f] flex items-center justify-center flex-shrink-0 shadow-inner">
            <ResourceIcon symbol={symbol} size={30} />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-wider">
              {symbol}
            </h3>
            {unitPrice > 0 && (
              <span className="text-[11px] text-zinc-400 font-mono">
                ~{formatNumber(unitPrice)} COIN/u
              </span>
            )}
          </div>
        </div>

        {/* Deficit Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0 ${
            missing === 0
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {missing === 0 ? (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{language === 'es' ? 'Listo' : 'Ready'}</span>
            </>
          ) : (
            <span>
              {language === 'es'
                ? `Faltan ${formatNumber(missing)}`
                : `Need ${formatNumber(missing)}`}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400 font-medium">
            {language === 'es' ? 'Disponibilidad:' : 'Availability:'}
          </span>
          <span
            className={`font-mono font-bold ${
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

        <div className="w-full h-2 rounded-full bg-[#202024] overflow-hidden">
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

      {/* Bottom: Quantities Grid */}
      <div className="bg-[#1b1b1f] rounded-[18px] p-3 space-y-1.5 text-xs font-main">
        <div className="flex justify-between items-center text-zinc-400">
          <span>{language === 'es' ? 'Requerido:' : 'Required:'}</span>
          <span className="text-white font-mono font-bold">
            {formatNumber(requiredQty)}
          </span>
        </div>
        <div className="flex justify-between items-center text-zinc-400">
          <span>{language === 'es' ? 'En Inventario:' : 'In Stock:'}</span>
          <span className="text-zinc-300 font-mono font-bold">
            {formatNumber(currentStock)}
          </span>
        </div>

        {missing > 0 && costOfMissing > 0 && (
          <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/[0.05]">
            <span>{language === 'es' ? 'Costo faltante:' : 'Missing cost:'}</span>
            <span className="text-amber-400 font-mono font-bold">
              ~{formatNumber(Math.round(costOfMissing))} COIN
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
