/**
 * PoolDataAgent - Agente avanzado de sincronización con pools de Katana V3
 * Maneja datos de ronin_pools.json con validación de liquidez avanzada
 */
import { getCachedRoninPools, getLatestPoolPrice, isPoolLiquid, type RoninPoolsDataset } from '../services/roninPoolsService';

export interface AdvancedPoolData {
  symbol: string;
  latestPrice: number;
  averagePrice: number;
  liquidity: number;
  isValid: boolean;
  qualityScore: number; // 0-1 basado en liquidez y consistencia
  timestamp: string;
}

export class PoolDataAgent {
  private poolsCache: RoninPoolsDataset | null = null;
  private lastUpdate: string | null = null;
  private refreshIntervalMs = 60000;
  
  async refresh(): Promise<void> {
    console.log('[PoolDataAgent] Refrescando datos del pool Katana...');
    try {
      const result = await fetch('/data/ronin_pools.json');
      if (result.ok) {
        const data = await result.json();
        this.poolsCache = data;
        this.lastUpdate = new Date().toISOString();
        console.log('[PoolDataAgent] Datos refrescados. Recursos:', data.resourceCount);
      } else {
        console.warn('[PoolDataAgent] No se pudo refrescar:', result.status);
      }
    } catch (e) {
      console.error('[PoolDataAgent] Error:', e);
    }
  }
  
  getAdvancedData(symbol: string): AdvancedPoolData | null {
    if (!this.poolsCache) return null;
    const item = this.poolsCache.resources[symbol.toUpperCase()];
    if (!item) return null;
    
    const price = getLatestPoolPrice(item);
    const avgPrice = item.price1d?.average || 0;
    const liquidity = item.liquidity?.average || 0;
    const isLiquid = isPoolLiquid(item);
    const qualityScore = isLiquid ? Math.min(1, liquidity / 10000) : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      latestPrice: price,
      averagePrice: avgPrice,
      liquidity: liquidity,
      isValid: isLiquid && price > 0,
      qualityScore: qualityScore,
      timestamp: this.lastUpdate || new Date().toISOString(),
    };
  }
  
  getAllValidPrices(): Record<string, number> {
    const prices: Record<string, number> = {};
    if (!this.poolsCache) return prices;
    
    for (const [sym, item] of Object.entries(this.poolsCache.resources)) {
      const advanced = this.getAdvancedData(sym);
      if (advanced && advanced.isValid) {
        prices[sym] = advanced.latestPrice;
      }
    }
    return prices;
  }
}

export const globalPoolDataAgent = new PoolDataAgent();
