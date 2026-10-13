// Aplicación: emisión de notificaciones de ciclo de fábrica.
// Cada canal (campana Web Audio, toast in-app, push del navegador) se gobierna
// por separado desde `notificationPrefs` (QW4). El silencio programado apaga
// solo los canales invasivos (sonido + push); el toast in-app sigue llegando.
import { notifyInfo } from './sileoNotifications';
import {
  getNotificationPrefs,
  isFactoryMuted,
  isSnoozed,
  type NotificationPrefs,
} from '../services/notificationPrefs';

type WindowWithAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

export interface FactoryNotificationOptions {
  /** Token de fábrica para respetar mute por fábrica (LP5). */
  factoryToken?: string;
  /** Override de prefs (por tests/llamadas controladas). */
  prefs?: NotificationPrefs;
}

// Audio notification chime using Web Audio API (cross-browser, works without external mp3 files)
export function playNotificationSound(volumeOverride?: number) {
  try {
    const audioWin = window as WindowWithAudio;
    const AudioCtx = window.AudioContext || audioWin.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const volume =
      typeof volumeOverride === 'number'
        ? Math.max(0, Math.min(1, volumeOverride))
        : getNotificationPrefs().volume;

    // Play a friendly pleasant 2-tone chime (E5 -> A5)
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.15 * volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.18 * volume, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (e) {
    // Audio context might be restricted before user gesture
  }
}

/**
 * Envía una alerta de fin de ciclo respetando el interruptor maestro, los
 * canales individuales, el silencio programado y el mute por fábrica.
 */
export function sendFactoryNotification(
  title: string,
  body: string,
  icon?: string,
  options?: FactoryNotificationOptions,
) {
  const prefs = options?.prefs ?? getNotificationPrefs();

  if (!prefs.master) return;
  if (options?.factoryToken && isFactoryMuted(options.factoryToken, prefs)) return;

  const snoozed = isSnoozed(prefs);

  // Canal: toast in-app (sobrevive al snooze — silencio solo para avisos invasivos)
  if (prefs.toast) {
    notifyInfo(title, body);
  }

  if (snoozed) return;

  // Canal: campana sonora
  if (prefs.sound) {
    playNotificationSound(prefs.volume);
  }

  // Canal: push del navegador
  if (!prefs.push) return;
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'craftworld-timer',
      silent: false, // Allow system sound if configured in Windows
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.error('Error dispatching browser notification:', err);
  }
}
