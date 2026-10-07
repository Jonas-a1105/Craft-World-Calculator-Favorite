import React from 'react';

export interface SettingsNotificationsCardProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (val: boolean) => void;
  notificationPermissionState: string;
  onRequestPermission: () => void;
  onTestNotification: () => void;
  language: 'es' | 'en';
}

export const SettingsNotificationsCard: React.FC<SettingsNotificationsCardProps> = ({
  notificationsEnabled,
  onToggleNotifications,
  notificationPermissionState,
  onRequestPermission,
  onTestNotification,
  language,
}) => {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase px-4 block">
        {language === 'es'
          ? 'Notificaciones y Alertas'
          : 'Notifications & Alerts'}
      </span>

      <div className="bg-[#18181b] rounded-[32px] shadow-xl overflow-hidden">
        {/* Row 1: Notifications Master Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es' ? 'Alertas de Fábricas' : 'Factory Alerts'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Aviso sonoro al terminar ciclo'
                  : 'Push sound when cycle ends'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleNotifications(!notificationsEnabled)}
            className={`w-12 h-7 rounded-full transition-colors duration-200 p-0.5 flex items-center cursor-pointer flex-shrink-0 ${
              notificationsEnabled ? 'bg-emerald-500' : 'bg-[#27272a]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 2: Browser Permission Status */}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es'
                  ? 'Permiso del Navegador'
                  : 'Browser Permission'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {notificationPermissionState === 'granted'
                  ? language === 'es'
                    ? 'Permitido en este equipo'
                    : 'Allowed on this device'
                  : language === 'es'
                    ? 'Requiere autorización'
                    : 'Requires permission'}
              </span>
            </div>
          </div>

          {notificationPermissionState === 'granted' ? (
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
              <span>✓</span>
              <span>{language === 'es' ? 'Activo' : 'Active'}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onRequestPermission}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-md transition-colors flex-shrink-0"
            >
              {language === 'es' ? 'Permitir' : 'Allow'}
            </button>
          )}
        </div>

        {/* Subtle Divider */}
        <div className="h-px bg-white/[0.04]" />

        {/* Row 3: Test Chime Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {language === 'es'
                  ? 'Probar Campana de Alerta'
                  : 'Test Alert Chime'}
              </span>
              <span className="text-[11px] text-zinc-400 block truncate mt-0.5">
                {language === 'es'
                  ? 'Verificar audio Web Audio API'
                  : 'Verify audio tone and toast'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onTestNotification}
            className="px-4 py-2 rounded-full bg-[#27272e] hover:bg-[#32323a] text-zinc-100 hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-95 flex-shrink-0 shadow-sm"
          >
            {language === 'es' ? 'Probar' : 'Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
