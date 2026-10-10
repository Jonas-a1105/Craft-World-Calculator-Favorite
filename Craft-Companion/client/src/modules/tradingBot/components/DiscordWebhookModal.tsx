import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CloseCircleLinear,
  ChatDotsBoldDuotone,
  Plain2BoldDuotone,
  CheckCircleBold,
  DangerTriangleBoldDuotone,
  TuningBoldDuotone,
} from 'solar-icon-set';
import type { TradingBotConfig } from '../types';

interface DiscordWebhookModalProps {
  config: TradingBotConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (config: TradingBotConfig) => void;
  onTestWebhook: () => Promise<void>;
  webhookStatus: {
    loading: boolean;
    success?: boolean;
    message?: string;
  };
}

export const DiscordWebhookModal: React.FC<DiscordWebhookModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
  onTestWebhook,
  webhookStatus,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.discordWebhookUrl);
  const [discordAlertsEnabled, setDiscordAlertsEnabled] = useState(config.discordAlertsEnabled);
  const [minScoreThreshold, setMinScoreThreshold] = useState(config.minScoreThreshold);
  const [autoScanIntervalSec, setAutoScanIntervalSec] = useState(config.autoScanIntervalSec);

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

  const handleSave = () => {
    onSaveConfig({
      ...config,
      discordWebhookUrl: webhookUrl.trim(),
      discordAlertsEnabled,
      minScoreThreshold,
      autoScanIntervalSec,
    });
    onClose();
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#18181b] border-none rounded-[32px] p-6 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Glow ambient background accents (Blue & Orange only) */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <ChatDotsBoldDuotone size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Integración Discord Webhook
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Alertas automáticas de caídas de precios y arbitraje
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
        <div className="overflow-y-auto space-y-4 pr-1 py-1">
          {/* Webhook Input Card */}
          <div className="space-y-2 bg-[#141416] p-4 rounded-2xl shadow-inner">
            <label className="text-xs font-semibold text-zinc-300 block">
              Discord Webhook URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-[#18181b] border-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono shadow-inner"
              />
              <button
                type="button"
                onClick={onTestWebhook}
                disabled={webhookStatus.loading || !webhookUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-40 cursor-pointer border-none active:scale-98"
              >
                <Plain2BoldDuotone size={14} className={webhookStatus.loading ? 'animate-pulse' : ''} />
                <span>{webhookStatus.loading ? 'Enviando...' : 'Probar'}</span>
              </button>
            </div>

            {/* Test Status Feedback */}
            {webhookStatus.message && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 mt-2 ${
                  webhookStatus.success
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {webhookStatus.success ? (
                  <CheckCircleBold size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <DangerTriangleBoldDuotone size={16} className="text-rose-400 shrink-0" />
                )}
                <span className="font-semibold">{webhookStatus.message}</span>
              </div>
            )}
          </div>

          {/* Alert Automation Controls */}
          <div className="p-4 rounded-2xl bg-[#141416] space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Alertas automáticas</div>
                <div className="text-[11px] text-zinc-400">
                  Emitir aviso a Discord al detectar oportunidades relevantes
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDiscordAlertsEnabled(!discordAlertsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center border-none ${
                  discordAlertsEnabled
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 justify-end'
                    : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800/60">
              {/* Min score threshold - Natural casing, not uppercase */}
              <div>
                <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                  Score mínimo requerido
                </label>
                <select
                  value={minScoreThreshold}
                  onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                  className="w-full bg-[#18181b] border-none rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner font-semibold"
                >
                  <option value={0}>Todos los scores (&gt;= 0)</option>
                  <option value={70}>Score &gt;= 70 (Tier B o superior)</option>
                  <option value={80}>Score &gt;= 80 (Tier A o superior)</option>
                  <option value={88}>Score &gt;= 88 (Solo Tier S)</option>
                </select>
              </div>

              {/* Scan interval - Natural casing */}
              <div>
                <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                  Frecuencia de escaneo
                </label>
                <select
                  value={autoScanIntervalSec}
                  onChange={(e) => setAutoScanIntervalSec(Number(e.target.value))}
                  className="w-full bg-[#18181b] border-none rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner font-semibold"
                >
                  <option value={30}>Cada 30 segundos</option>
                  <option value={60}>Cada 1 minuto (Recomendado)</option>
                  <option value={120}>Cada 2 minutos</option>
                  <option value={300}>Cada 5 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discord Setup Guide */}
          <div className="p-3.5 rounded-2xl bg-[#141416] space-y-1 text-xs text-zinc-400 shadow-inner">
            <div className="font-bold text-blue-400 flex items-center gap-1.5 text-[11px]">
              <TuningBoldDuotone size={14} />
              ¿Cómo obtener el webhook de tu canal?
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400 pt-1 font-normal leading-relaxed">
              <li>Abre los <b>Ajustes del Canal</b> en Discord donde quieres las alertas.</li>
              <li>Entra en <b>Integraciones</b> &gt; <b>Webhooks</b>.</li>
              <li>Haz clic en <b>Crear Webhook</b> o <b>Nuevo Webhook</b>.</li>
              <li>Copia la URL generada y pégala arriba.</li>
            </ol>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 shrink-0 border-t border-zinc-800/60 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-2xl bg-[#141416] hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-all cursor-pointer border-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer border-none active:scale-98"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
