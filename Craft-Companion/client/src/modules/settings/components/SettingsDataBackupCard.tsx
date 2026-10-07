import React from 'react';

export interface SettingsDataBackupCardProps {
  copied: boolean;
  onCopyJson: () => void;
  showImportBox: boolean;
  setShowImportBox: (val: boolean | ((prev: boolean) => boolean)) => void;
  importJson: string;
  setImportJson: (val: string) => void;
  onApplyImport: () => void;
  confirmReset: boolean;
  onResetConfig: () => void;
  language: 'es' | 'en';
}

export const SettingsDataBackupCard: React.FC<SettingsDataBackupCardProps> = ({
  copied,
  onCopyJson,
  showImportBox,
  setShowImportBox,
  importJson,
  setImportJson,
  onApplyImport,
  confirmReset,
  onResetConfig,
  language,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
        {language === 'es' ? 'Datos y Respaldo' : 'Data & Backup'}
      </span>

      <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
        {/* Row 1: Copy JSON */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es' ? 'Copiar Ajustes JSON' : 'Copy JSON Settings'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Exporta tu configuración al portapapeles'
                  : 'Export config to clipboard'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCopyJson}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex-shrink-0 shadow-sm active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white'
            }`}
          >
            {copied
              ? language === 'es'
                ? '✓ Copiado'
                : '✓ Copied'
              : language === 'es'
                ? 'Copiar'
                : 'Copy'}
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 2: Import Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es'
                  ? 'Importar Configuración'
                  : 'Import Settings'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Restaura tus datos desde texto JSON'
                  : 'Restore from JSON text'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowImportBox(!showImportBox)}
            className="px-4 py-2 rounded-full bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm"
          >
            {showImportBox
              ? language === 'es'
                ? 'Cerrar'
                : 'Close'
              : language === 'es'
                ? 'Importar'
                : 'Import'}
          </button>
        </div>

        {/* Import Box */}
        {showImportBox && (
          <div className="p-4 space-y-3">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={
                language === 'es'
                  ? 'Pega el código JSON de respaldo aquí...'
                  : 'Paste backup JSON code here...'
              }
              className="w-full min-h-[90px] rounded-2xl bg-[#141416] p-3 font-mono text-xs text-emerald-400 focus:outline-none border-none resize-none"
            />
            <button
              type="button"
              onClick={onApplyImport}
              className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              {language === 'es' ? 'Aplicar Importación' : 'Apply Import'}
            </button>
          </div>
        )}

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 3: Reset All Defaults */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es'
                  ? 'Restablecer Valores'
                  : 'Reset All Defaults'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Borra configuraciones guardadas'
                  : 'Wipes custom local preferences'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetConfig}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm ${
              confirmReset
                ? 'bg-rose-600 text-white font-bold animate-pulse'
                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200'
            }`}
          >
            {confirmReset
              ? language === 'es'
                ? '¿Confirmar?'
                : 'Confirm?'
              : language === 'es'
                ? 'Restablecer'
                : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};
