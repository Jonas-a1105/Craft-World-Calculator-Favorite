import type { WatchlistRule, TradingBotConfig } from '../types';

const WATCHLIST_STORAGE_KEY = 'craft_companion_trading_watchlist_v1';
const CONFIG_STORAGE_KEY = 'craft_companion_trading_config_v1';

const DEFAULT_WATCHLIST: WatchlistRule[] = [
  {
    id: 'rule-copper-dip',
    symbol: 'Copper',
    condition: 'BELOW',
    targetValue: 8.5,
    notes: 'Comprar para fundición masiva de lingotes',
    enabled: true,
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'rule-gold-spike',
    symbol: 'Gold',
    condition: 'ABOVE',
    targetValue: 135.0,
    notes: 'Liquidar reservas acumuladas al alcanzar pico',
    enabled: true,
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'rule-paperwrap-margin',
    symbol: 'Paperwrap',
    condition: 'MARGIN_ABOVE',
    targetValue: 30.0,
    notes: 'Arbitraje de embalaje industrial activo',
    enabled: true,
    createdAt: Date.now() - 3600000 * 6,
  },
];

const DEFAULT_CONFIG: TradingBotConfig = {
  autoScanIntervalSec: 30,
  minScoreThreshold: 65,
  discordWebhookUrl: '',
  discordAlertsEnabled: false,
  browserNotificationsEnabled: true,
  soundAlertsEnabled: false,
};

export function loadWatchlistRules(): WatchlistRule[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function saveWatchlistRules(rules: WatchlistRule[]): void {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.warn('[WatchlistStorage] Unable to save rules:', err);
  }
}

export function loadTradingBotConfig(): TradingBotConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveTradingBotConfig(config: TradingBotConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('[WatchlistStorage] Unable to save config:', err);
  }
}
