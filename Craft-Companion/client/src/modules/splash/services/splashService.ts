/**
 * Service helpers for Splash screen loading states and redirect resolutions.
 */

export interface SplashStatusMessage {
  es: string;
  en: string;
}

export const SPLASH_STAGES: Array<{ threshold: number; message: SplashStatusMessage }> = [
  {
    threshold: 0.3,
    message: {
      es: 'Iniciando protocolos de Craft World...',
      en: 'Initializing Craft World protocols...',
    },
  },
  {
    threshold: 0.65,
    message: {
      es: 'Sincronizando fábricas y cadena de valor...',
      en: 'Synchronizing factories & value chains...',
    },
  },
  {
    threshold: 0.95,
    message: {
      es: 'Conectando cotizaciones y red Ronin...',
      en: 'Connecting real-time quotes & Ronin network...',
    },
  },
  {
    threshold: 1.0,
    message: {
      es: '¡Ecosistema listo! Entrando...',
      en: 'Ecosystem ready! Entering...',
    },
  },
];

export function getSplashStatusText(progress: number, language: string = 'es'): string {
  const isEs = language === 'es';
  const clamped = Math.max(0, Math.min(1, progress));

  for (const stage of SPLASH_STAGES) {
    if (clamped <= stage.threshold) {
      return isEs ? stage.message.es : stage.message.en;
    }
  }

  return isEs ? '¡Ecosistema listo! Entrando...' : 'Ecosystem ready! Entering...';
}

export function resolveSplashRedirect(
  isAuthenticated: boolean,
  customRedirect?: string | null,
): string {
  if (customRedirect && customRedirect.startsWith('/') && !customRedirect.startsWith('//') && !customRedirect.startsWith('/splash')) {
    return customRedirect;
  }

  return isAuthenticated ? '/home' : '/';
}
