import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CloseCircleLinear,
  BellBingBoldDuotone,
  TrashBinTrashBold,
  CheckCircleBold,
} from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { WatchlistRule } from '../types';

interface WatchlistManagerModalProps {
  watchlist: WatchlistRule[];
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: Omit<WatchlistRule, 'id' | 'createdAt'>) => void;
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
}

export const WatchlistManagerModal: React.FC<WatchlistManagerModalProps> = ({
  watchlist,
  isOpen,
  onClose,
  onAddRule,
  onDeleteRule,
  onToggleRule,
}) => {
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<'BELOW' | 'ABOVE' | 'MARGIN_ABOVE'>('BELOW');
  const [targetValue, setTargetValue] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetValue);
    if (!symbol.trim() || isNaN(val) || val <= 0) return;

    onAddRule({
      symbol: symbol.trim().toUpperCase(),
      condition,
      targetValue: val,
      notes: notes.trim() || undefined,
      enabled: true,
    });

    setSymbol('');
    setTargetValue('');
    setNotes('');
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#18181b] border-none rounded-[32px] p-6 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Glow ambient background accents (Orange and Blue only) */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <BellBingBoldDuotone size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Gestor de Alertas & Watchlist
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Monitoreo continuo para compras, ventas y márgenes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 border-none"
            title="Cerrar"
          >
            <CloseCircleLinear className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto space-y-3.5 pr-1 py-1">
          {/* Add New Rule Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#141416] space-y-3 shadow-inner">
            <div className="text-xs font-bold text-white">
              Crear nueva alerta
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Symbol */}
              <div>
                <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                  Recurso (símbolo)
                </label>
                <input
                  type="text"
                  placeholder="Ej. BREAD"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#18181b] border-none rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold uppercase shadow-inner"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                  Condición
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-[#18181b] border-none rounded-xl px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer shadow-inner"
                >
                  <option value="BELOW">Precio menor a</option>
                  <option value="ABOVE">Precio mayor a</option>
                  <option value="MARGIN_ABOVE">Margen superior a</option>
                </select>
              </div>

              {/* Target Value */}
              <div>
                <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                  {condition === 'MARGIN_ABOVE' ? 'Margen (%)' : 'Precio (COIN)'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-[#18181b] border-none rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold shadow-inner"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Nota u objetivo táctico (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#18181b] border-none rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner font-normal"
              />
            </div>

            <button
              type="submit"
              disabled={!symbol.trim() || !targetValue}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none active:scale-98"
            >
              + Guardar Alerta en Watchlist
            </button>
          </form>

          {/* Existing Rules List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
              <span>Alertas activas ({watchlist.length})</span>
            </div>

            {watchlist.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-[#141416] rounded-2xl shadow-inner">
                No tienes alertas configuradas. Añade una para recibir avisos automáticos en el radar.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {watchlist.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-2xl border-none flex items-center justify-between transition-all ${
                      rule.enabled
                        ? 'bg-[#141416] shadow-sm'
                        : 'bg-[#141416]/50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleRule(rule.id)}
                        className="cursor-pointer border-none bg-transparent p-0"
                        title={rule.enabled ? 'Desactivar alerta' : 'Activar alerta'}
                      >
                        <CheckCircleBold
                          size={20}
                          className={rule.enabled ? 'text-emerald-400' : 'text-zinc-600'}
                        />
                      </button>

                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#18181b] flex items-center justify-center p-1 shrink-0">
                          <ResourceIcon symbol={rule.symbol} size={22} className="w-5 h-5 object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {rule.symbol}
                            </span>
                            <span className="text-xs font-semibold text-amber-400">
                              {rule.condition === 'BELOW' && `< ${rule.targetValue} COIN`}
                              {rule.condition === 'ABOVE' && `> ${rule.targetValue} COIN`}
                              {rule.condition === 'MARGIN_ABOVE' && `Margen > ${rule.targetValue}%`}
                            </span>
                          </div>
                          {rule.notes && (
                            <p className="text-[11px] text-zinc-400 font-normal mt-0.5">{rule.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer border-none"
                      title="Eliminar regla"
                    >
                      <TrashBinTrashBold size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 flex justify-end shrink-0 border-t border-zinc-800/60 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer border-none"
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
