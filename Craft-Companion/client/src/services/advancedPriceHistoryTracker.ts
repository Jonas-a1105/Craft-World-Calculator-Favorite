/**
 * PriceHistoryTracker - Registro avanzado de historial de precios
 * Permite análisis de tendencias y detección de anomalías
 */
export interface PriceHistoryEntry {
  timestamp: string;
  symbol: string;
  price: number;
  source: string;
  changePercentFromPrevious?: number;
  isAnomaly: boolean;
  confidenceScore: number;
}

export class PriceHistoryTracker {
  private history: PriceHistoryEntry[] = [];
  private maxEntriesPerSymbol = 100;
  private anomalyThresholdPercent = 20; // 20% de cambio = anomalía
  
  record(entry: PriceHistoryEntry): void {
    const previous = this.getPreviousForSymbol(entry.symbol);
    if (previous) {
      entry.changePercentFromPrevious = ((entry.price - previous.price) / previous.price) * 100;
      entry.isAnomaly = Math.abs(entry.changePercentFromPrevious || 0) > this.anomalyThresholdPercent;
    } else {
      entry.changePercentFromPrevious = undefined;
      entry.isAnomaly = false;
    }
    
    this.history.push(entry);
    
    // Limpiar historial antiguo
    const symbolHistory = this.history.filter(h => h.symbol === entry.symbol);
    if (symbolHistory.length > this.maxEntriesPerSymbol) {
      const toKeep = symbolHistory.slice(-this.maxEntriesPerSymbol);
      this.history = this.history.filter(h => h.symbol !== entry.symbol).concat(toKeep);
    }
    
    console.log('[PriceHistoryTracker] Registrado:', entry.symbol, entry.price, 'Anomalía:', entry.isAnomaly);
  }
  
  private getPreviousForSymbol(symbol: string): PriceHistoryEntry | null {
    const entries = this.history.filter(h => h.symbol === symbol);
    return entries.length > 0 ? entries[entries.length - 1] : null;
  }
  
  getTrendAnalysis(symbol: string): { average: number; max: number; min: number; volatility: number; trend: 'up' | 'down' | 'stable' } | null {
    const entries = this.history.filter(h => h.symbol === symbol);
    if (entries.length < 2) return null;
    
    const prices = entries.map(e => e.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    
    // Volatilidad como desviación estándar relativa
    const mean = avg;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const volatility = mean > 0 ? stdDev / mean : 0;
    
    const first = entries[0].price;
    const last = entries[entries.length - 1].price;
    const changePercent = ((last - first) / first) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 5) trend = 'up';
    else if (changePercent < -5) trend = 'down';
    
    return { average: avg, max: max, min: min, volatility: volatility, trend: trend };
  }
  
  getAnomalies(): PriceHistoryEntry[] {
    return this.history.filter(h => h.isAnomaly);
  }
  
  getFullHistory(): PriceHistoryEntry[] {
    return [...this.history];
  }
}

export const globalPriceHistoryTracker = new PriceHistoryTracker();
