import React from 'react';
import { useTranslation } from '../utils/i18n';
import { usePriceTrust } from '../services/priceTrust';

/**
 * Banner global de confianza de precios (QW2). Autocontenido: lee el estado
 * `usePriceTrust()` y se oculta solo cuando los datos están en vivo y frescos.
 * Cualquier módulo que muestre o calcule con precios debe montarlo una vez,
 * normalmente bajo su cabecera.
 */
export const PriceTrustBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language } = useTranslation();
  const trust = usePriceTrust();
  const isEs = language === 'es';

  if (trust.isClean) return null;

  const syncedLabel = trust.syncedAt
    ? new Date(trust.syncedAt).toLocaleString()
    : null;

  const content: { tone: 'amber' | 'rose'; text: string } = (() => {
    switch (trust.kind) {
      case 'stale':
        return {
          tone: 'amber',
          text: syncedLabel
            ? isEs
              ? `Precios del juego desactualizados (última sync: ${syncedLabel}) — pueden diferir del juego en vivo.`
              : `Game prices are outdated (last sync: ${syncedLabel}) — they may differ from the live game.`
            : isEs
              ? 'Precios del juego desactualizados — pueden diferir del juego en vivo.'
              : 'Game prices are outdated — they may differ from the live game.',
        };
      case 'cache':
        return {
          tone: 'amber',
          text: syncedLabel
            ? isEs
              ? `Mostrando precios guardados en caché del servidor (última sync: ${syncedLabel}).`
              : `Showing server-cached prices (last sync: ${syncedLabel}).`
            : isEs
              ? 'Mostrando precios guardados en caché del servidor.'
              : 'Showing server-cached prices.',
        };
      case 'auth-error':
        return {
          tone: 'rose',
          text: isEs
            ? 'Sesión caducada — revincula tu cuenta para volver a sincronizar tus datos en vivo.'
            : 'Session expired — relink your account to sync live data again.',
        };
      case 'network-error':
      case 'server-error':
      case 'unknown-error':
        return {
          tone: 'rose',
          text: isEs
            ? 'No se pudo sincronizar con el servidor — los datos mostrados pueden ser antiguos. Se reintenta en segundo plano.'
            : 'Could not sync with the server — displayed data may be outdated. Retrying in background.',
        };
      case 'missing':
      default:
        return {
          tone: 'amber',
          text: isEs
            ? 'Sin precios del juego (sin sesión activa) — usando benchmark + DEX. Inicia sesión para sincronizar.'
            : 'No game prices (no active session) — using benchmark + DEX. Sign in to sync.',
        };
    }
  })();

  return (
    <div
      role={content.tone === 'rose' ? 'alert' : 'status'}
      className={`flex items-center justify-center gap-2 w-full max-w-2xl mx-auto px-3 py-2 rounded-2xl text-[11px] sm:text-xs font-mono shadow-md ${
        content.tone === 'rose'
          ? 'bg-rose-500/10 text-rose-300'
          : 'bg-amber-500/10 text-amber-300'
      } ${className}`}
    >
      <span aria-hidden="true">⚠</span>
      <span className="text-center leading-relaxed">{content.text}</span>
    </div>
  );
};

export default PriceTrustBanner;
