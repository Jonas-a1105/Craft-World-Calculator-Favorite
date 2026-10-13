// Dominio: preferencias granulares de notificación (QW4).
// Razón de cambio única: qué canal (sonido / toast in-app / push del navegador)
// dispara cada aviso de ciclo de fábrica, con qué volumen, y cuándo está en
// silencio programado o la fábrica está muteada.
import { useEffect, useState } from 'react';

export const NOTIF_KEYS = {
  master: 'craftworld.notificationsEnabled',
  sound: 'craftworld.notif.sound',
  toast: 'craftworld.notif.toast',
  push: 'craftworld.notif.push',
  volume: 'craftworld.notif.volume',
  snoozeUntil: 'craftworld.notif.snoozeUntil',
  mutedFactories: 'craftworld.notif.mutedFactories',
} as const;

export const NOTIF_PREFS_EVENT = 'craftworld:notif-prefs-changed';

export interface NotificationPrefs {
  /** Interruptor maestreo existente (Settings). */
  master: boolean;
  sound: boolean;
  toast: boolean;
  push: boolean;
  /** 0..1 */
  volume: number;
  /** Timestamp epoch ms hasta el que están silenciadas las alertas invasivas. */
  snoozeUntil: number;
  /** Tokens de fábrica con notificaciones silenciadas (LP5). */
  mutedFactories: string[];
}

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
}

function readNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function getNotificationPrefs(): NotificationPrefs {
  return {
    master: readBool(NOTIF_KEYS.master, false),
    sound: readBool(NOTIF_KEYS.sound, true),
    toast: readBool(NOTIF_KEYS.toast, true),
    push: readBool(NOTIF_KEYS.push, true),
    volume: Math.max(0, Math.min(1, readNumber(NOTIF_KEYS.volume, 0.8))),
    snoozeUntil: readNumber(NOTIF_KEYS.snoozeUntil, 0),
    mutedFactories: readStringArray(NOTIF_KEYS.mutedFactories),
  };
}

function persist(partial: Partial<NotificationPrefs>): void {
  try {
    for (const [k, v] of Object.entries(partial)) {
      if (k === 'mutedFactories') {
        localStorage.setItem(NOTIF_KEYS.mutedFactories, JSON.stringify(v));
      } else if (typeof v === 'boolean') {
        localStorage.setItem((NOTIF_KEYS as Record<string, string>)[k], String(v));
      } else if (typeof v === 'number') {
        localStorage.setItem((NOTIF_KEYS as Record<string, string>)[k], String(v));
      }
    }
  } catch {
    // storage quota
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(NOTIF_PREFS_EVENT));
  }
}

export function setNotificationPref<K extends keyof NotificationPrefs>(
  key: K,
  value: NotificationPrefs[K],
): void {
  persist({ [key]: value } as Partial<NotificationPrefs>);
}

/** Silencio programado activo (sonido + push; el toast in-app sigue llegando). */
export function isSnoozed(prefs: NotificationPrefs = getNotificationPrefs()): boolean {
  return prefs.snoozeUntil > Date.now();
}

export function getSnoozeRemainingMs(prefs: NotificationPrefs = getNotificationPrefs()): number {
  return Math.max(0, prefs.snoozeUntil - Date.now());
}

export function snoozeNotifications(minutes: number): number {
  const until = Date.now() + Math.max(1, minutes) * 60 * 1000;
  persist({ snoozeUntil: until });
  return until;
}

export function snoozeNotificationsUntilEndOfDay(): number {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  persist({ snoozeUntil: end.getTime() });
  return end.getTime();
}

export function clearSnooze(): void {
  persist({ snoozeUntil: 0 });
}

export function isFactoryMuted(token: string, prefs?: NotificationPrefs): boolean {
  return (prefs ?? getNotificationPrefs()).mutedFactories.includes(token);
}

export function toggleFactoryMute(token: string): boolean {
  const prefs = getNotificationPrefs();
  const muted = prefs.mutedFactories.includes(token);
  const next = muted
    ? prefs.mutedFactories.filter((t) => t !== token)
    : [...prefs.mutedFactories, token];
  persist({ mutedFactories: next });
  return !muted;
}

/** Hook React: prefs reactivas que se re-evalúan al cambiar otra pestaña o componente. */
export function useNotificationPrefs(): NotificationPrefs {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => getNotificationPrefs());

  useEffect(() => {
    const refresh = () => setPrefs(getNotificationPrefs());
    window.addEventListener(NOTIF_PREFS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(NOTIF_PREFS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return prefs;
}
