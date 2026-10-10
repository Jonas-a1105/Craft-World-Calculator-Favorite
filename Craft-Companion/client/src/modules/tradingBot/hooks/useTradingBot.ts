import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCraftworldHomeQuery, useFactoryDataQuery } from '../../../services/queries/useCraftworldQueries';
import { fetchRoninPoolsData, type RoninPoolsDataset } from '../../../services/roninPoolsService';
import type { MarketPriceItem } from '../../prices/types';
import type {
  TradingOpportunity,
  WatchlistRule,
  TradingBotConfig,
  TradingBotStats,
  OpportunityFilter,
} from '../types';
import {
  generateTradingOpportunities,
  filterOpportunities,
  computeTradingBotStats,
} from '../services/tradingSignalsService';
import {
  loadWatchlistRules,
  saveWatchlistRules,
  loadTradingBotConfig,
  saveTradingBotConfig,
} from '../services/watchlistStorageService';
import {
  sendTestDiscordWebhook,
  sendOpportunityToDiscord,
} from '../services/discordWebhookService';

export function useTradingBot() {
  const { data: home, isLoading: isHomeLoading, refetch: refetchHome } = useCraftworldHomeQuery();
  const { data: factoryRows, isLoading: isFactoriesLoading } = useFactoryDataQuery();

  const [poolsDataset, setPoolsDataset] = useState<RoninPoolsDataset | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistRule[]>(() => loadWatchlistRules());
  const [config, setConfig] = useState<TradingBotConfig>(() => loadTradingBotConfig());

  const [filter, setFilter] = useState<OpportunityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'SCORE' | 'MARGIN' | 'PRICE'>('SCORE');

  const [selectedOpportunity, setSelectedOpportunity] = useState<TradingOpportunity | null>(null);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedAt, setLastScannedAt] = useState<number>(Date.now());
  const [webhookStatus, setWebhookStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Load ronin pools historical data once
  useEffect(() => {
    let mounted = true;
    fetchRoninPoolsData().then((data) => {
      if (mounted && data) {
        setPoolsDataset(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Market prices from home query
  const marketPrices: MarketPriceItem[] = useMemo(() => {
    if (!home?.priceList?.prices) return [];
    return home.priceList.prices
      .filter((p): p is typeof p & { referenceSymbol: string } => Boolean(p.referenceSymbol))
      .map((p) => ({
        referenceSymbol: p.referenceSymbol,
        amount: p.amount ?? 0,
        recommendation: p.recommendation ?? '',
      }));
  }, [home]);

  // Generate raw opportunities whenever inputs change
  const rawOpportunities = useMemo(() => {
    if (marketPrices.length === 0) return [];
    return generateTradingOpportunities({
      marketPrices,
      factoryRows: factoryRows || [],
      poolsDataset,
      watchlist,
    });
  }, [marketPrices, factoryRows, poolsDataset, watchlist]);

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let list = filterOpportunities(rawOpportunities, filter, searchQuery);

    // Apply min score threshold from config
    if (config.minScoreThreshold > 0) {
      list = list.filter((item) => item.score >= config.minScoreThreshold);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'SCORE') {
        return b.score - a.score;
      }
      if (sortBy === 'MARGIN') {
        return b.potentialMarginPercent - a.potentialMarginPercent;
      }
      if (sortBy === 'PRICE') {
        return a.currentPrice - b.currentPrice;
      }
      return 0;
    });
  }, [rawOpportunities, filter, searchQuery, config.minScoreThreshold, sortBy]);

  // Compute summary stats
  const stats: TradingBotStats = useMemo(() => {
    const s = computeTradingBotStats(rawOpportunities);
    return {
      ...s,
      botStatus: isScanning ? 'SCANNING' : 'IDLE',
    };
  }, [rawOpportunities, isScanning]);

  // Manual rescan trigger
  const triggerScan = useCallback(async () => {
    setIsScanning(true);
    await refetchHome();
    const freshPools = await fetchRoninPoolsData();
    if (freshPools) setPoolsDataset(freshPools);
    setLastScannedAt(Date.now());
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  }, [refetchHome]);

  // Auto scan timer based on config
  useEffect(() => {
    if (!config.autoScanIntervalSec || config.autoScanIntervalSec < 10) return;
    const interval = setInterval(() => {
      refetchHome();
      setLastScannedAt(Date.now());
    }, config.autoScanIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [config.autoScanIntervalSec, refetchHome]);

  // Watchlist Handlers
  const handleAddWatchlistRule = useCallback((rule: Omit<WatchlistRule, 'id' | 'createdAt'>) => {
    const newRule: WatchlistRule = {
      ...rule,
      id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    };
    setWatchlist((prev) => {
      const next = [newRule, ...prev];
      saveWatchlistRules(next);
      return next;
    });
  }, []);

  const handleDeleteWatchlistRule = useCallback((ruleId: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((r) => r.id !== ruleId);
      saveWatchlistRules(next);
      return next;
    });
  }, []);

  const handleToggleWatchlistRule = useCallback((ruleId: string) => {
    setWatchlist((prev) => {
      const next = prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
      saveWatchlistRules(next);
      return next;
    });
  }, []);

  // Config Handlers
  const handleSaveConfig = useCallback((newConfig: TradingBotConfig) => {
    setConfig(newConfig);
    saveTradingBotConfig(newConfig);
  }, []);

  // Discord Handlers
  const handleTestDiscord = useCallback(async () => {
    if (!config.discordWebhookUrl) {
      setWebhookStatus({
        loading: false,
        success: false,
        message: 'Por favor ingresa una URL válida de Webhook de Discord.',
      });
      return;
    }
    setWebhookStatus({ loading: true });
    const result = await sendTestDiscordWebhook(config.discordWebhookUrl);
    setWebhookStatus({
      loading: false,
      success: result.success,
      message: result.success
        ? '¡Mensaje de prueba enviado con éxito a Discord!'
        : result.error || 'Error al conectar con Discord',
    });
  }, [config.discordWebhookUrl]);

  const handleSendOpportunityToDiscord = useCallback(
    async (opp: TradingOpportunity) => {
      if (!config.discordWebhookUrl) {
        setIsDiscordModalOpen(true);
        return { success: false, message: 'Configura un Webhook primero' };
      }
      const result = await sendOpportunityToDiscord(config.discordWebhookUrl, opp);
      return {
        success: result.success,
        message: result.success
          ? '¡Alerta enviada a Discord!'
          : result.error || 'Error de envío',
      };
    },
    [config.discordWebhookUrl]
  );

  const openCalculator = useCallback((opp: TradingOpportunity) => {
    setSelectedOpportunity(opp);
    setIsCalculatorModalOpen(true);
  }, []);

  return {
    loading: isHomeLoading && marketPrices.length === 0,
    isFactoriesLoading,
    opportunities: filteredOpportunities,
    rawOpportunities,
    stats,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    watchlist,
    config,
    isScanning,
    lastScannedAt,
    selectedOpportunity,
    setSelectedOpportunity,
    isCalculatorModalOpen,
    setIsCalculatorModalOpen,
    isDiscordModalOpen,
    setIsDiscordModalOpen,
    isWatchlistModalOpen,
    setIsWatchlistModalOpen,
    webhookStatus,
    triggerScan,
    handleAddWatchlistRule,
    handleDeleteWatchlistRule,
    handleToggleWatchlistRule,
    handleSaveConfig,
    handleTestDiscord,
    handleSendOpportunityToDiscord,
    openCalculator,
  };
}
