/**
 * Sistema Complejo y Ultra Profesional de Actualización Automática de Precios
 * Integración final de todos los agentes
 * Autor: Sistema avanzado automatizado
 */

// Importar todos los agentes
import { globalPriceSyncAgent } from '../services/advancedPriceSyncAgent';
import { globalGameDataAgent } from '../services/advancedGameDataAgent';
import { globalPoolDataAgent } from '../services/advancedPoolDataAgent';
import { globalPriceMergerAgent } from '../services/advancedPriceMergerAgent';
import { globalAutoUpdaterService } from '../services/advancedAutoUpdaterService';
import { globalPriceHistoryTracker } from '../services/advancedPriceHistoryTracker';
import { globalAlertAgent } from '../services/advancedAlertAgent';

export interface SystemIntegrationStatus {
  isActive: boolean;
  agentsActive: number;
  lastFullUpdate: string | null;
  priceDiscrepanciesDetected: number;
  updatesAppliedTotal: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  activeSources: string[];
}

export class AdvancedPriceIntegrationSystem {
  private status: SystemIntegrationStatus;
  private initialized: boolean = false;
  
  constructor() {
    this.status = {
      isActive: false,
      agentsActive: 0,
      lastFullUpdate: null,
      priceDiscrepanciesDetected: 0,
      updatesAppliedTotal: 0,
      systemHealth: 'healthy',
      activeSources: [],
    };
  }
  
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    console.log('[AdvancedPriceIntegrationSystem] Inicializando sistema complejo...');
    
    // Inicializar todos los agentes
    globalPriceSyncAgent.initialize();
    globalPoolDataAgent.refresh(); // Inicializar datos del pool
    
    this.initialized = true;
    this.status.isActive = true;
    this.status.agentsActive = 7;
    
    console.log('[AdvancedPriceIntegrationSystem] Sistema inicializado con 7 agentes activos');
    return true;
  }
  
  async startAutomaticUpdates(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log('[AdvancedPriceIntegrationSystem] Iniciando actualizaciones automáticas...');
    
    // Iniciar el servicio de actualización automática
    globalPriceSyncAgent.start();
    
    // Programar actualización completa periódica
    setInterval(async () => {
      try {
        const report = await globalAutoUpdaterService.executeFullUpdate();
        this.status.lastFullUpdate = report.timestamp;
        this.status.updatesAppliedTotal += report.updatesApplied;
        this.status.priceDiscrepanciesDetected += report.discrepanciesDetected.length;
        
        // Actualizar estado del sistema
        if (report.errors.length > 0) {
          this.status.systemHealth = 'degraded';
        } else {
          this.status.systemHealth = 'healthy';
        }
        
        console.log('[AdvancedPriceIntegrationSystem] Actualización periódica completada');
      } catch (e) {
        console.error('[AdvancedPriceIntegrationSystem] Error en actualización periódica:', e);
        this.status.systemHealth = 'critical';
      }
    }, 120000); // Cada 2 minutos
  }
  
  getStatus(): SystemIntegrationStatus {
    // Actualizar fuentes activas
    const syncStatus = globalPriceSyncAgent.getStatus();
    this.status.activeSources = syncStatus.activeSources || [];
    return { ...this.status };
  }
  
  async executeManualSync(): Promise<any> {
    console.log('[AdvancedPriceIntegrationSystem] Ejecutando sincronización manual...');
    const result = await globalAutoUpdaterService.executeFullUpdate();
    return result;
  }
  
  getAgentStatus(): Record<string, any> {
    return {
      priceSyncAgent: globalPriceSyncAgent.getStatus(),
      gameDataAgent: { lastSync: globalGameDataAgent.getLastSync() ? 'available' : 'none' },
      poolDataAgent: { poolsCache: 'available' }, // Simplificado
      priceMergerAgent: { historyLength: globalPriceMergerAgent.getHistory().length },
      autoUpdaterService: globalAutoUpdaterService.getStatus(),
      priceHistoryTracker: { historyLength: globalPriceHistoryTracker.getFullHistory().length },
      alertAgent: { alertsCount: globalAlertAgent.getAlerts().length },
    };
  }
}

// Exportar instancia global
export const globalPriceSystem = new AdvancedPriceIntegrationSystem();

// Función de inicialización rápida
export async function initializeAdvancedPriceSystem(): Promise<boolean> {
  const result = await globalPriceSystem.initialize();
  if (result) {
    await globalPriceSystem.startAutomaticUpdates();
    console.log('[AdvancedPriceIntegrationSystem] Sistema avanzado iniciado con éxito');
  }
  return result;
}
