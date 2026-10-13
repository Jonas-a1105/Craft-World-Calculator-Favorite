// Infraestructura: persistencia en localStorage del snapshot de mercado de COIN.
// Razón de cambio única: estrategia de caché (clave, formato, cuota).
// Devuelve null cuando no existe snapshot guardado: la UI debe poder distinguir
// "caché" de "sin datos" en vez de fabricar un precio de respaldo.
import { DEFAULT_COIN_DATA, LOCAL_STORAGE_KEY, type CoinMarketData } from './coinTypes';

export function getCachedCoinData(): CoinMarketData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.priceUsd !== 'number' || !Number.isFinite(parsed.priceUsd) || parsed.priceUsd <= 0) {
      return null;
    }
    return {
      ...DEFAULT_COIN_DATA,
      ...parsed,
      source: 'cache',
    };
  } catch {
    return null;
  }
}

export function setCachedCoinData(data: CoinMarketData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota
  }
}
