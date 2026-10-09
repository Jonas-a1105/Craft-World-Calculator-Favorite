import React, { useState } from 'react';
import { CopyBold, CheckCircleBold, CartLarge2Bold } from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { ShoppingListItem, ConsolidatedResource } from '../types';

interface ShoppingListSectionProps {
  items: ShoppingListItem[];
  consolidated: ConsolidatedResource[];
  totalCoin: number;
  baseSymbol: string;
  language: string;
  onClearCart?: () => void;
}

function formatAmount(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(2)}K`;
  }
  return val % 1 === 0 ? val.toString() : val.toFixed(1);
}

function formatCoin(val: number): string {
  if (!Number.isFinite(val) || val === 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toFixed(1);
}

export const ShoppingListSection: React.FC<ShoppingListSectionProps> = ({
  items,
  consolidated,
  totalCoin,
  baseSymbol,
  language,
}) => {
  const isEs = language === 'es';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (consolidated.length === 0) return;
    const textLines = [
      `🛒 ${isEs ? 'Lista de Compras Craft World' : 'Craft World Shopping List'}`,
      `💰 Total: ${formatCoin(totalCoin)} ${baseSymbol}`,
      '',
      isEs ? 'Materiales necesarios:' : 'Materials needed:',
      ...consolidated.map(
        (c) => `- ${c.token}: ${formatAmount(c.totalAmount)} (~${formatCoin(c.totalCostCoin)} ${baseSymbol})`,
      ),
    ];
    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-3xl bg-[#1c1c22] shadow-xl shadow-black/25 space-y-4 border-none outline-none select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wider uppercase">
            {isEs ? 'LISTA DE COMPRAS' : 'SHOPPING LIST'}
          </h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            {isEs
              ? 'Materiales consolidados para las mejoras agregadas al carrito.'
              : 'Consolidated materials for upgrades added to the cart.'}
          </p>
        </div>

        {/* Grand Total Coin */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#131316] font-mono shadow-inner">
            <span className="text-xs text-slate-400 font-medium">{isEs ? 'Total:' : 'Total:'}</span>
            <span className="text-sm font-bold text-amber-300">
              {formatCoin(totalCoin)}
            </span>
            <ResourceIcon symbol="COIN" size={14} />
          </div>

          {consolidated.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#25252e] hover:bg-[#30303c] text-xs font-mono font-bold transition-all border-none outline-none cursor-pointer flex items-center"
            >
              {copied ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <CheckCircleBold size={14} className="shrink-0" />
                  <span>{isEs ? '¡Copiado!' : 'Copied!'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-200">
                  <CopyBold size={14} className="shrink-0 text-slate-400" />
                  <span>{isEs ? 'Copiar' : 'Copy'}</span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {items.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-[#131316]">
          <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
            <span>
              {isEs
                ? 'No hay mejoras añadidas al carrito. Usa el botón de'
                : 'No upgrade costs for the selected range. Use the'}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#202028] text-amber-300 font-semibold">
              <CartLarge2Bold size={13} className="shrink-0" />
              <span>{isEs ? 'carrito' : 'cart'}</span>
            </span>
            <span>
              {isEs
                ? 'en las filas para acumular materiales.'
                : 'button on rows to add upgrades.'}
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Consolidated Materials Grid */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
              {isEs ? 'Materiales Totales a Comprar' : 'Total Materials to Purchase'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {consolidated.map((c) => (
                <div
                  key={c.token}
                  className="p-2.5 rounded-2xl bg-[#131316] flex items-center justify-between gap-2 font-mono shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ResourceIcon symbol={c.token} size={20} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {formatAmount(c.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase truncate">
                        {c.token}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-1">
                    <span className="text-[10px] text-amber-300 font-bold block">
                      {formatCoin(c.totalCostCoin)}
                    </span>
                    <ResourceIcon symbol="COIN" size={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Added Facilities Breakdown List */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
              {isEs ? 'Fábricas en Carrito' : 'Facilities in Cart'} ({items.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((it) => (
                <div
                  key={it.token}
                  className="px-2.5 py-1 rounded-xl bg-[#131316] flex items-center gap-2 text-xs font-mono"
                >
                  <ResourceIcon symbol={it.token} size={15} />
                  <span className="text-white font-bold">{it.name}</span>
                  <span className="text-amber-300">
                    (L{it.fromLevel}➔L{it.toLevel})
                  </span>
                  {it.qty > 1 && <span className="text-slate-400">×{it.qty}</span>}
                  <div className="flex items-center gap-1 text-slate-400 ml-1">
                    <span>{formatCoin(it.totalCostCoin)}</span>
                    <ResourceIcon symbol="COIN" size={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
