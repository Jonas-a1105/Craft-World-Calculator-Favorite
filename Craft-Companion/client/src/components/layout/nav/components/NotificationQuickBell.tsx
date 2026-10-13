import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellBingBold, BellOffBold, MoonSleepBold, SettingsBold } from 'solar-icon-set';
import { useTranslation } from '../../../../utils/i18n';
import {
  useNotificationPrefs,
  snoozeNotifications,
  snoozeNotificationsUntilEndOfDay,
  clearSnooze,
  isSnoozed,
  getSnoozeRemainingMs,
} from '../../../../services/notificationPrefs';

/**
 * Campana rápida de la navbar (QW4): muestra el estado de las alertas de
 * ciclos y permite silenciar (1h / hoy) sin entrar en Ajustes.
 */
export const NotificationQuickBell: React.FC = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const prefs = useNotificationPrefs();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isEs = language === 'es';
  const snoozed = isSnoozed(prefs);
  const remainMin = Math.ceil(getSnoozeRemainingMs(prefs) / 60000);
  const remainLabel =
    remainMin >= 60 ? `${Math.floor(remainMin / 60)}h ${remainMin % 60}m` : `${remainMin}m`;

  // Cerrar al hacer click fuera o pulsar Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const statusText = !prefs.master
    ? isEs
      ? 'Alertas desactivadas'
      : 'Alerts disabled'
    : snoozed
      ? isEs
        ? `Silenciado por ${remainLabel}`
        : `Muted for ${remainLabel}`
      : isEs
        ? 'Alertas activas'
        : 'Alerts active';

  const bellColorClass = !prefs.master
    ? 'text-zinc-400'
    : snoozed
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${isEs ? 'Alertas de ciclos' : 'Cycle alerts'} — ${statusText}`}
        aria-label={`${isEs ? 'Configurar alertas de ciclos' : 'Configure cycle alerts'}. ${statusText}`}
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-8 h-8 flex items-center justify-center rounded-xl bg-oled-pill hover:bg-oled-pillHover transition-colors cursor-pointer border-0 outline-none"
      >
        {prefs.master && !snoozed ? (
          <BellBingBold size={16} className={`${bellColorClass} w-4 h-4`} />
        ) : (
          <BellOffBold size={16} className={`${bellColorClass} w-4 h-4`} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={isEs ? 'Opciones de alertas' : 'Alert options'}
          className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-oled-850/98 backdrop-blur-md shadow-2xl p-2 z-[9999] border-0"
        >
          <div className="px-3 py-2">
            <p className="text-xs font-bold text-white truncate">
              {isEs ? 'Alertas de ciclos' : 'Cycle alerts'}
            </p>
            <p className={`text-[11px] font-mono mt-0.5 ${bellColorClass}`}>{statusText}</p>
          </div>

          <div className="h-px bg-white/[0.06] my-1" />

          {!snoozed ? (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  snoozeNotifications(60);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer border-0 outline-none text-left"
              >
                <MoonSleepBold size={14} className="w-4 h-4 text-amber-400 shrink-0" />
                {isEs ? 'Silenciar 1 hora' : 'Mute for 1 hour'}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  snoozeNotificationsUntilEndOfDay();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer border-0 outline-none text-left"
              >
                <MoonSleepBold size={14} className="w-4 h-4 text-purple-400 shrink-0" />
                {isEs ? 'Silenciar hasta mañana' : 'Mute until tomorrow'}
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                clearSnooze();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer border-0 outline-none text-left"
            >
              <BellBingBold size={14} className="w-4 h-4 text-emerald-400 shrink-0" />
              {isEs ? 'Reactivar ahora' : 'Resume now'}
            </button>
          )}

          <div className="h-px bg-white/[0.06] my-1" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate('/settings');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer border-0 outline-none text-left"
          >
            <SettingsBold size={14} className="w-4 h-4 text-zinc-400 shrink-0" />
            {isEs ? 'Abrir ajustes de alertas' : 'Open alert settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationQuickBell;
