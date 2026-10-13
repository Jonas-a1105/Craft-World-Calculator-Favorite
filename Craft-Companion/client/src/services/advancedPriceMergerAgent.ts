/**
 * PriceMergerAgent - Agente avanzado de fusión inteligente de precios
 * Combina datos del juego, pool y estáticos con validación avanzada
 */
import { globalGameDataAgent, type GamePriceData } from '../services/advancedGameDataAgent';
import { globalPoolDataAgent } from '../services/advancedPoolDataAgent';

export interface MergedPriceResult {
  symbol: string;
  finalPrice: number;
  sourcesUsed: string[];
  confidence: number;
  discrepancyDetected: boolean;
  discrepancyPercent?: number;
  recommendation: 'use_final' | 'use_game' | 'use_pool' | 'use_static' | 'manual_review';
  timestamp: string;
}

export class PriceMergerAgent {
  private discrepancyThreshold = 0.05; // 5%
  private history: MergedPriceResult[] = [];
  private maxHistory = 100;
  
  mergePrice(symbol: string, staticPrice: number): MergedPriceResult {
    const sourcesUsed: string[] = [];
    const prices: number[] = [];
    
    // 1. Intentar datos del juego
    const gameData = globalGameDataAgent.getLastSync();
    if (gameData && gameData.prices.length > 0) {
      // getRecommendedPrices() es método del agente (GamePriceData es solo datos);
      // antes se llamaba sobre el objeto de datos → TypeError en runtime.
      const recommended = globalGameDataAgent.getRecommendedPrices();
      const gamePrice = recommended[symbol.toUpperCase()];
      if (gamePrice !== undefined && gamePrice > 0) {
        prices.push(gamePrice);
        sourcesUsed.push('game');
      }
    }
    
    // 2. Intentar datos del pool
    const poolData = globalPoolDataAgent.getAdvancedData(symbol);
    if (poolData && poolData.isValid) {
      prices.push(poolData.latestPrice);
      sourcesUsed.push('pool');
    }
    
    // 3. Datos estáticos como referencia
    prices.push(staticPrice);
    sourcesUsed.push('static');
    
    // 4. Fusionar con lógica avanzada
    let finalPrice = staticPrice;
    let confidence = 0.5;
    let discrepancyDetected = false;
    let discrepancyPercent: number | undefined = undefined;
    let recommendation: MergedPriceResult['recommendation'] = 'use_final';
    
    if (prices.length > 1) {
      // Si hay datos del juego y del pool, calcular discrepancia
      const gamePrice = prices.find((_, i) => sourcesUsed[i] === 'game');
      const poolPrice = prices.find((_, i) => sourcesUsed[i] === 'pool');
      
      if (gamePrice !== undefined && poolPrice !== undefined) {
        const diff = Math.abs(gamePrice - poolPrice) / Math.max(gamePrice, poolPrice);
        if (diff > this.discrepancyThreshold) {
          discrepancyDetected = true;
          discrepancyPercent = diff * 100;
          recommendation = 'manual_review';
          // Usar el precio del juego como preferencia si hay alta confianza
          finalPrice = gamePrice;
          confidence = 0.7;
        } else {
          // Precios consistentes: usar promedio ponderado
          finalPrice = (gamePrice * 0.6 + poolPrice * 0.4);
          confidence = 0.9;
        }
      } else if (gamePrice !== undefined) {
        finalPrice = gamePrice;
        confidence = 0.85;
      } else if (poolPrice !== undefined) {
        finalPrice = poolPrice;
        confidence = poolData?.qualityScore || 0.7;
      }
    }
    
    const result: MergedPriceResult = {
      symbol: symbol.toUpperCase(),
      finalPrice: finalPrice,
      sourcesUsed: sourcesUsed,
      confidence: confidence,
      discrepancyDetected: discrepancyDetected,
      discrepancyPercent: discrepancyPercent,
      recommendation: recommendation,
      timestamp: new Date().toISOString(),
    };
    
    // Guardar en historial
    this.history.push(result);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
    
    console.log('[PriceMergerAgent] Fusionado:', symbol, 'Precio final:', finalPrice.toFixed(4), 'Fuentes:', sourcesUsed.join('+'), 'Recomendación:', recommendation);
    return result;
  }
  
  getHistory(): MergedPriceResult[] {
    return [...this.history];
  }
  
  getAveragePriceForSymbol(symbol: string): number | null {
    const entries = this.history.filter(h => h.symbol === symbol.toUpperCase());
    if (entries.length === 0) return null;
    const sum = entries.reduce((acc, e) => acc + e.finalPrice, 0);
    return sum / entries.length;
  }
}

export const globalPriceMergerAgent = new PriceMergerAgent();
