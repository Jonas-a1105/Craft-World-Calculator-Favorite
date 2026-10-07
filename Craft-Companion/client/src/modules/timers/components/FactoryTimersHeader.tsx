import React from 'react';

interface FactoryTimersHeaderProps {
  language: string;
  activeCount: number;
  readyCount: number;
  notifPermission: string;
  onToggleNotification: () => void;
}

export const FactoryTimersHeader: React.FC<FactoryTimersHeaderProps> = ({
  language,
  activeCount,
  readyCount,
  notifPermission,
  onToggleNotification,
}) => {
  return (
    <>
      <div className="text-center mt-4 mb-2">
        <h1
          className="text-xl sm:text-2xl font-title font-bold text-white tracking-wider uppercase"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)' }}
        >
          {language === 'es' ? 'Temporizadores de Fábricas' : 'Factory Timers'}
        </h1>
        <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
          {language === 'es'
            ? 'Monitorea el tiempo restante y progreso de tus producciones en tiempo real.'
            : 'Monitor remaining time and live progress of your active runs.'}
        </p>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="font-extrabold text-white text-base sm:text-lg font-main flex items-center gap-2">
            <span>⏱️</span>
            <span>
              {language === 'es'
                ? `Producciones Activas (${activeCount})`
                : `Active Runs (${activeCount})`}
            </span>
          </h2>
          {activeCount > 0 && (
            <span className="text-xs text-zinc-400 font-mono">
              {readyCount} {language === 'es' ? 'listas' : 'ready'}
            </span>
          )}
        </div>

        {/* Quick Actions: Bell Notification Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleNotification}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
              notifPermission === 'granted'
                ? 'bg-[#18181b] hover:bg-[#222226] text-white'
                : 'bg-[#18181b] hover:bg-[#222226] text-zinc-400'
            }`}
            title={
              notifPermission === 'granted'
                ? language === 'es'
                  ? 'Notificaciones activas (Click para desactivar)'
                  : 'Notifications active (Click to disable)'
                : language === 'es'
                  ? 'Activar notificaciones'
                  : 'Enable notifications'
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {notifPermission === 'granted' ? (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10b981] text-black flex items-center justify-center text-[10px] font-black shadow-sm">
                ✓
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500/90 text-white flex items-center justify-center text-[9px] font-black shadow-sm">
                ✕
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
