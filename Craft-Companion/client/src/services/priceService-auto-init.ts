
import { initializeAdvancedPriceSystem } from './advancedPriceIntegration';

// AUTO-INICIO SOLO EN NAVEGADOR.
// Este módulo arranca agentes con timers de polling (PriceSyncAgent, AutoUpdater).
// Bajo Node (tests unitarios) esos timers mantendrían vivo el event loop y
// colgarían `node --test` para siempre. La app real (Vite) siempre tiene window.
if (typeof window !== 'undefined') {
  console.log('[priceService-auto-init] Iniciando sistema avanzado automáticamente en la app...');

  initializeAdvancedPriceSystem()
    .then((result) => console.log('[priceService-auto-init] Sistema iniciado:', result ? 'ÉXITO' : 'FALLÓ'))
    .catch((e) => console.error('[priceService-auto-init] Error:', e));
} else {
  console.log('[priceService-auto-init] Entorno sin navegador detectado: sistema avanzado no auto-iniciado.');
}
