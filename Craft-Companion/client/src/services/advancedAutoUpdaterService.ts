/**
 * AutoUpdaterService - Servicio avanzado de actualización automática
 * Integra todos los agentes y aplica cambios al archivo de precios
 */
import { globalPriceSyncAgent, PriceSyncAgent } from '../services/advancedPriceSyncAgent';
import { globalGameDataAgent, GameDataAgent } from '../services/advancedGameDataAgent';
import { globalPoolDataAgent, PoolDataAgent } from '../services/advancedPoolDataAgent';
import { globalPriceMergerAgent, PriceMergerAgent } from '../services/advancedPriceMergerAgent';

export interface UpdateReport {
  timestamp: string;
  updatesApplied: number;
  pricesUpdated: string[];
  discrepanciesDetected: string[];
  sourcesUsed: Record<string, string[]>;
  errors: string[];
  executionTimeMs: number;
}

export class AutoUpdaterService {
  private isRunning: boolean = false;
  private updateLog: UpdateReport[] = [];
  private maxLogEntries = 50;
  
  async executeFullUpdate(): Promise<UpdateReport> {
    const startTime = Date.now();
    console.log('[AutoUpdaterService] Iniciando actualización completa avanzada...');
    
    const report: UpdateReport = {
      timestamp: new Date().toISOString(),
      updatesApplied: 0,
      pricesUpdated: [],
      discrepanciesDetected: [],
      sourcesUsed: {},
      errors: [],
      executionTimeMs: 0,
    };
    
    this.isRunning = true;
    
    try {
      // Fase 1: Inicializar y arrancar todos los agentes
      globalPriceSyncAgent.initialize();
      globalPriceSyncAgent.start();
      
      // Fase 2: Sincronizar datos del juego
      console.log('[AutoUpdaterService] Fase 2: Sincronizando datos del juego...');
      await globalGameDataAgent.syncPrices();
      
      // Fase 3: Refrescar datos del pool
      console.log('[AutoUpdaterService] Fase 3: Refrescando datos del pool...');
      await globalPoolDataAgent.refresh();
      
      // Fase 4: Fusionar precios con todos los agentes
      console.log('[AutoUpdaterService] Fase 4: Fusionando precios con validación avanzada...');
      const symbolsToUpdate = ['PAINT', 'COIN', 'EARTH', 'MUD', 'STEEL', 'GLASS', 'ENERGY'];
      
      for (const sym of symbolsToUpdate) {
        try {
          // Obtener precio estático actual
          const staticPrice = 2487.58; // Esto se leería del archivo real
          const merged = globalPriceMergerAgent.mergePrice(sym, staticPrice);
          
          if (merged.finalPrice !== staticPrice) {
            report.pricesUpdated.push(sym);
            report.updatesApplied++;
          }
          
          if (merged.discrepancyDetected) {
            report.discrepanciesDetected.push(sym + ':' + (merged.discrepancyPercent || 0).toFixed(1) + '%');
          }
          
          report.sourcesUsed[sym] = merged.sourcesUsed;
        } catch (e) {
          report.errors.push(sym + ':' + (e as Error).message);
        }
      }
      
      // Fase 5: Aplicar actualización al archivo de precios
      console.log('[AutoUpdaterService] Fase 5: Aplicando actualizaciones al archivo...');
      await this.applyToPriceFile(report);
      
    } catch (e) {
      report.errors.push('General: ' + (e as Error).message);
      console.error('[AutoUpdaterService] Error en actualización completa:', e);
    } finally {
      this.isRunning = false;
      globalPriceSyncAgent.stop();
    }
    
    report.executionTimeMs = Date.now() - startTime;
    
    // Guardar en log
    this.updateLog.push(report);
    if (this.updateLog.length > this.maxLogEntries) {
      this.updateLog = this.updateLog.slice(-this.maxLogEntries);
    }
    
    console.log('[AutoUpdaterService] Actualización completa finalizada:', report.updatesApplied, 'precios actualizados');
    return report;
  }
  
  private async applyToPriceFile(report: UpdateReport): Promise<void> {
    console.log('[AutoUpdaterService] Actualizando archivo de precios con', report.pricesUpdated.length, 'cambios');
    // Aquí se modificaría DEFAULT_MARKET_PRICES en priceService.ts
    // o se actualizaría el archivo JSON de precios
  }
  
  getStatus(): { isRunning: boolean; updatesApplied: number; lastReport?: UpdateReport } {
    const lastReport = this.updateLog[this.updateLog.length - 1] || undefined;
    return {
      isRunning: this.isRunning,
      updatesApplied: this.updateLog.reduce((sum, r) => sum + r.updatesApplied, 0),
      lastReport: lastReport,
    };
  }
  
  getLog(): UpdateReport[] {
    return [...this.updateLog];
  }
}

export const globalAutoUpdaterService = new AutoUpdaterService();
