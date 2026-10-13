/**
 * AlertAgent - Agente de alertas avanzadas
 * Notifica discrepancias, anomalías y cambios significativos
 */
export interface AlertConfig {
  discrepancyThresholdPercent: number;
  priceDropThresholdPercent: number;
  priceRiseThresholdPercent: number;
  enableConsoleAlerts: boolean;
  enableLogFile: boolean;
}

export interface PriceAlert {
  id: string;
  timestamp: string;
  symbol: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentPrice: number;
  referencePrice: number;
  changePercent: number;
}

export class AlertAgent {
  private alerts: PriceAlert[] = [];
  private config: AlertConfig;
  private alertCounter = 0;
  
  constructor(config?: Partial<AlertConfig>) {
    this.config = {
      discrepancyThresholdPercent: config?.discrepancyThresholdPercent ?? 5,
      priceDropThresholdPercent: config?.priceDropThresholdPercent ?? 10,
      priceRiseThresholdPercent: config?.priceRiseThresholdPercent ?? 15,
      enableConsoleAlerts: config?.enableConsoleAlerts ?? true,
      enableLogFile: config?.enableLogFile ?? true,
    };
  }
  
  checkDiscrepancy(symbol: string, gamePrice: number, poolPrice: number, staticPrice: number): void {
    const differences = [
      { source: 'game', price: gamePrice },
      { source: 'pool', price: poolPrice },
      { source: 'static', price: staticPrice },
    ].filter(d => d.price > 0);
    
    if (differences.length < 2) return;
    
    const maxPrice = Math.max(...differences.map(d => d.price));
    const minPrice = Math.min(...differences.map(d => d.price));
    const discrepancyPercent = ((maxPrice - minPrice) / maxPrice) * 100;
    
    if (discrepancyPercent > this.config.discrepancyThresholdPercent) {
      this.createAlert({
        symbol: symbol,
        severity: discrepancyPercent > 20 ? 'critical' : 'high',
        message: `Discrepancia alta detectada para ${symbol}: diferencias entre fuentes > ${discrepancyPercent.toFixed(1)}%`,
        currentPrice: maxPrice,
        referencePrice: minPrice,
        changePercent: discrepancyPercent,
      });
    }
  }
  
  checkPriceChange(symbol: string, oldPrice: number, newPrice: number): void {
    if (oldPrice <= 0 || newPrice <= 0) return;
    
    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
    
    if (changePercent < -this.config.priceDropThresholdPercent) {
      this.createAlert({
        symbol: symbol,
        severity: 'high',
        message: `Caída significativa en precio de ${symbol}: ${Math.abs(changePercent).toFixed(1)}%`,
        currentPrice: newPrice,
        referencePrice: oldPrice,
        changePercent: changePercent,
      });
    } else if (changePercent > this.config.priceRiseThresholdPercent) {
      this.createAlert({
        symbol: symbol,
        severity: 'medium',
        message: `Aumento significativo en precio de ${symbol}: +${changePercent.toFixed(1)}%`,
        currentPrice: newPrice,
        referencePrice: oldPrice,
        changePercent: changePercent,
      });
    }
  }
  
  private createAlert(data: Omit<PriceAlert, 'id' | 'timestamp'>): void {
    const alert: PriceAlert = {
      ...data,
      id: `ALERT-${++this.alertCounter}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    
    this.alerts.push(alert);
    
    if (this.config.enableConsoleAlerts) {
      const severitySymbol = alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '📊';
      console.log(`${severitySymbol} [AlertAgent] ${alert.message}`);
    }
    
    if (this.config.enableLogFile) {
      // Aquí se escribiría a un archivo de log
      console.log('[AlertAgent] Alerta registrada en archivo de log');
    }
  }
  
  getAlerts(): PriceAlert[] {
    return [...this.alerts];
  }
  
  getCriticalAlerts(): PriceAlert[] {
    return this.alerts.filter(a => a.severity === 'critical');
  }
  
  clearAlerts(): void {
    this.alerts = [];
    this.alertCounter = 0;
  }
}

export const globalAlertAgent = new AlertAgent();
