import React from 'react';
import { StopwatchBoldDuotone, BellBold, CheckCircleBold, CloseCircleBold } from 'solar-icon-set';

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
            <StopwatchBoldDuotone className="w-5 h-5 text-cyan-400" />
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
            <BellBold className="w-5 h-5 shrink-0" />

            {notifPermission === 'granted' ? (
              <span className="absolute -top-1 -right-1 flex items-center justify-center text-emerald-400 bg-[#18181b] rounded-full shadow-sm">
                <CheckCircleBold className="w-4 h-4 shrink-0" />
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 flex items-center justify-center text-rose-400 bg-[#18181b] rounded-full shadow-sm">
                <CloseCircleBold className="w-4 h-4 shrink-0" />
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
