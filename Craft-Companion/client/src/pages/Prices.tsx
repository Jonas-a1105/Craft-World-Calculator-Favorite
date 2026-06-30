import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData } from '../services/factoryData';
import { fetchLiveTokenPrices, type LivePriceResult } from '../services/priceService';
import { getCraftworldQuote } from '../services/api';
import { SkeletonSingleColumn } from '../components/Skeleton';

function getResourceImage(symbol?: string) {
  if (!symbol) return '';
  const cleanSymbol = symbol.trim().toLowerCase();
  const formattedSymbol = cleanSymbol.charAt(0).toUpperCase() + cleanSymbol.slice(1);
  return `/assets/resources/${formattedSymbol}.png`;
}

function formatFactoryName(symbol: string, lang: string): string {
  const normalized = String(symbol || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'STEEL': return 'Acero';
      case 'WOOD': return 'Madera';
      case 'WATER': return 'Agua';
      case 'ALGAE': return 'Alga';
      case 'BOLTS': return 'Pernos';
      case 'BONESOUP': return 'Sopa de Huesos';
      case 'CEMENT': return 'Cemento';
      case 'CERAMICKEY': return 'Llave Cerámica';
      case 'CERAMICS': return 'Cerámicas';
      case 'CLAY': return 'Arcilla';
      case 'COPPER': return 'Cobre';
      case 'DYNAMITE': return 'Dinamita';
      case 'EARTH': return 'Tierra';
      case 'EXPLOSIVES': return 'Explosivos';
      case 'FERTILIZER': return 'Fertilizante';
      case 'FIRE': return 'Fuego';
      case 'FISH': return 'Pescado';
      case 'GLASS': return 'Vidrio';
      case 'GOLD': return 'Oro';
      case 'GRAIN': return 'Grano';
      case 'IRON': return 'Hierro';
      case 'LEATHER': return 'Cuero';
      case 'LIMESTONE': return 'Caliza';
      case 'MUD': return 'Lodo';
      case 'OXYGEN': return 'Oxígeno';
      case 'PAPER': return 'Papel';
      case 'PLASTIC': return 'Plástico';
      case 'SAND': return 'Arena';
      case 'SCREWS': return 'Tornillos';
      case 'SILICA': return 'Sílice';
      case 'STONE': return 'Piedra';
      case 'SULFUR': return 'Azufre';
      case 'TEXTILE': return 'Textil';
      case 'VEGETABLES': return 'Vegetales';
      case 'GAS': return 'Gas';
      case 'OIL': return 'Petróleo';
      case 'HEAT': return 'Calor';
      case 'ACID': return 'Ácido';
      case 'SEAWATER': return 'Agua de Mar';
      case 'FUEL': return 'Combustible';
      case 'COAL': return 'Carbón';
      case 'AIR': return 'Aire';
      default:
        return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
    }
  } else {
    return symbol.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }
}

function formatNumber(value: number, digits = 6) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

export default function Prices() {
  const { t, language } = useTranslation();
  const [tokens, setTokens] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, LivePriceResult>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('pricesViewMode') as 'list' | 'grid') || 'list';
  });
  
  // Auto-sync setting for COIN price
  const [autoSyncCoin, setAutoSyncCoin] = useState<boolean>(() => {
    const cached = localStorage.getItem('craftworld.autoSyncCoin');
    return cached ? cached === 'true' : true;
  });

  // COIN Price state (stored in localStorage)
  const [coinPrice, setCoinPrice] = useState<number>(() => {
    const cached = localStorage.getItem('craftworld.coinPriceUsd');
    return cached ? Number(cached) : 0.00035; 
  });

  // Countdown timer for automatic sync (60 seconds)
  const [countdown, setCountdown] = useState(60);
  const [lastSync, setLastSync] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal Calculator state
  const [showCalc, setShowCalc] = useState(false);
  const [calcCoin, setCalcCoin] = useState<string>('1000');
  const [calcUsd, setCalcUsd] = useState<string>('');

  // Initial load
  useEffect(() => {
    loadFactoryData().then((rows) => {
      const unique = Array.from(new Set(rows.map((row) => row.token).filter(Boolean))).sort();
      setTokens(unique);
    });
  }, []);

  // Real-time on-chain COIN price calculation directly from GeckoTerminal token contract API
  async function fetchRealCoinPrice(): Promise<number> {
    try {
      // Fetch direct token details for contract address 0x7dc167e270d5ef683ceaf4afcdf2efbdd667a9a7
      const response = await fetch('https://api.geckoterminal.com/api/v2/networks/ronin/tokens/0x7dc167e270d5ef683ceaf4afcdf2efbdd667a9a7');
      const json = await response.json();
      const calculated = Number(json?.data?.attributes?.price_usd || 0);
      if (calculated > 0) {
        localStorage.setItem('craftworld.coinPriceUsd', String(calculated));
        return calculated;
      }
    } catch (err) {
      console.warn('Auto-sync COIN price from GeckoTerminal failed, using fallback:', err);
    }
    return coinPrice;
  }

  // Fetch prices helper
  async function syncPrices(targetTokens: string[]) {
    if (targetTokens.length === 0) return;
    setIsSyncing(true);
    try {
      let activeCoinPrice = coinPrice;
      if (autoSyncCoin) {
        activeCoinPrice = await fetchRealCoinPrice();
        setCoinPrice(activeCoinPrice);
      }
      const latest = await fetchLiveTokenPrices(targetTokens);
      setPrices((prev) => ({ ...prev, ...latest }));
      setLastSync(new Date().toLocaleTimeString());
      setCountdown(60);
    } catch (e) {
      console.error('Failed to sync prices:', e);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }

  // Fetch prices on load
  useEffect(() => {
    if (tokens.length > 0) {
      syncPrices(tokens);
    }
  }, [tokens, autoSyncCoin]);

  // Countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          syncPrices(tokens);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tokens, autoSyncCoin, coinPrice]);

  // Update calculator fields
  useEffect(() => {
    if (showCalc) {
      const coinAmt = Number(calcCoin) || 0;
      setCalcUsd(formatNumber(coinAmt * coinPrice, 4));
    }
  }, [showCalc, coinPrice]);

  const handleCoinChange = (val: string) => {
    setCalcCoin(val);
    const num = Number(val) || 0;
    setCalcUsd(String(num * coinPrice));
  };

  const handleUsdChange = (val: string) => {
    setCalcUsd(val);
    const num = Number(val) || 0;
    setCalcCoin(coinPrice > 0 ? String(num / coinPrice) : '0');
  };

  const handleCoinPriceChange = (val: number) => {
    const validVal = Math.max(0, val);
    setCoinPrice(validVal);
    localStorage.setItem('craftworld.coinPriceUsd', String(validVal));
    // update USD calc based on current COIN value
    const coinAmt = Number(calcCoin) || 0;
    setCalcUsd(String(coinAmt * validVal));
  };

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      const localized = formatFactoryName(token, language).toLowerCase();
      const symbol = token.toLowerCase();
      const term = search.toLowerCase();
      return localized.includes(term) || symbol.includes(term);
    });
  }, [tokens, search, language]);

  if (loading) {
    return (
      <Layout>
        <SkeletonSingleColumn />
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
        .prices-container {
          background-color: rgba(10, 10, 10, 0.4) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border-radius: 12px;
        }
        .coin-price-card {
          transition: all 0.3s ease;
        }
        .coin-price-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          cursor: pointer;
        }
      `}</style>

      <div className="space-y-6 max-w-[1200px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            {t('prices.title')}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder={t('prices.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-[8px] border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-full md:w-64 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Top Cards: Independent Centered COIN Price and Sync Status */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Centered COIN Token Price Card (Independent) */}
          <div 
            onClick={() => setShowCalc(true)}
            className="coin-price-card rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center p-6 border-none"
            style={{ borderRadius: 'var(--radius-resource-item)' }}
          >
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-2">
              {t('prices.coinPriceCard')}
            </span>
            <div className="flex items-center gap-3">
              <img 
                src="/assets/resources/Coin.png" 
                alt="COIN" 
                className="h-10 w-10 object-contain animate-pulse" 
                onError={(e) => { e.currentTarget.src = getResourceImage('Coin') }}
              />
              <span className="text-3xl font-black text-white tracking-tight">
                1 COIN = ${coinPrice.toFixed(6)}
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-2 hover:text-emerald-300 transition-colors">
              {language === 'es' ? '⚡ Haz clic para abrir la calculadora' : '⚡ Click to open converter'}
            </span>
          </div>

          {/* Sync Timer Card */}
          <div 
            className="rounded-xl bg-slate-900/50 backdrop-blur-md p-6 flex flex-col justify-between border-none"
            style={{ borderRadius: 'var(--radius-resource-item)' }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('prices.updateTimer')}
                </span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {t('prices.nextUpdate')}: <span className="text-emerald-400">{countdown}s</span>
                </div>
              </div>
              <button
                disabled={isSyncing}
                onClick={() => syncPrices(tokens)}
                className={`rounded-[8px] px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${
                  isSyncing 
                    ? 'bg-slate-800 text-slate-500' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSyncing ? '...' : t('prices.syncNow')}
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-4">
              {t('prices.lastSync', { time: lastSync || 'Never' })}
            </div>
          </div>
        </div>

        <Card title={language === 'es' ? 'Precios de los Recursos' : 'Resource Prices'}>
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setViewMode('list'); localStorage.setItem('pricesViewMode', 'list'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                style={{ border: 'none' }}
              >
                {language === 'es' ? 'Lista' : 'List'}
              </button>
              <button 
                onClick={() => { setViewMode('grid'); localStorage.setItem('pricesViewMode', 'grid'); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                style={{ border: 'none' }}
              >
                {language === 'es' ? 'Tarjetas' : 'Cards'}
              </button>
            </div>

            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-slate-300">
                    <tr>
                      <th className="p-2 whitespace-nowrap">{t('prices.resourceName')}</th>
                      <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Precio Compra (COIN)' : 'Buy Price (COIN)'}</th>
                      <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Precio Venta (COIN)' : 'Sell Price (COIN)'}</th>
                      <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ref. Compra (USD)' : 'Ref. Buy (USD)'}</th>
                      <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ref. Venta (USD)' : 'Ref. Sell (USD)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((token) => {
                      const item = prices[token];
                      const buyVal = item?.buyPriceCoin || 0;
                      const sellVal = item?.sellPriceCoin || 0;
                      const img = getResourceImage(token);
                      const resourceName = formatFactoryName(token, language);
                      
                      return (
                        <tr key={token} className="border-t border-slate-800">
                          <td className="p-2 font-semibold whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {img && (
                                <img 
                                  src={img} 
                                  alt={token} 
                                  className="h-5 w-5 object-contain" 
                                  style={{ borderRadius: 'var(--radius-resource-item)' }}
                                />
                              )}
                              <span>{resourceName}</span>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap text-emerald-300">
                            {buyVal > 0 ? `${formatNumber(buyVal, 3)}` : '-'}
                          </td>
                          <td className="p-2 whitespace-nowrap text-emerald-300">
                            {sellVal > 0 ? `${formatNumber(sellVal, 3)}` : '-'}
                          </td>
                          <td className="p-2 whitespace-nowrap text-sky-400">
                            {buyVal > 0 ? `$${formatNumber(buyVal * coinPrice, 4)}` : '-'}
                          </td>
                          <td className="p-2 whitespace-nowrap text-sky-400">
                            {sellVal > 0 ? `$${formatNumber(sellVal * coinPrice, 4)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTokens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-2 text-slate-500 font-medium text-center py-8">
                          {language === 'es' ? 'No se encontraron recursos' : 'No resources found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                {filteredTokens.map((token) => {
                  const item = prices[token];
                  const buyVal = item?.buyPriceCoin || 0;
                  const sellVal = item?.sellPriceCoin || 0;
                  const img = getResourceImage(token);
                  const resourceName = formatFactoryName(token, language);
                  
                  return (
                    <div 
                      key={token} 
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius)',
                        padding: '16px',
                        border: 'none'
                      }}
                      className="flex flex-col gap-4 relative overflow-hidden"
                    >
                      {/* Header: Resource Image + Name */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 bg-slate-900/60 flex items-center justify-center p-1 shrink-0"
                          style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                        >
                          {img ? (
                            <img 
                              src={img} 
                              alt={token} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-xs font-black text-slate-500">{token.slice(0, 3)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-black text-slate-400">
                            {token}
                          </span>
                          <h3 className="text-sm font-black text-white truncate mt-0.5">
                            {resourceName}
                          </h3>
                        </div>
                      </div>

                      {/* Badges Container */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.03] justify-center">
                        <div 
                          className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                          style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Compra:' : 'Buy:'}</span>
                          <strong className="text-emerald-300">{buyVal > 0 ? `${formatNumber(buyVal, 3)} COIN` : '-'}</strong>
                        </div>

                        <div 
                          className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                          style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Venta:' : 'Sell:'}</span>
                          <strong className="text-emerald-300">{sellVal > 0 ? `${formatNumber(sellVal, 3)} COIN` : '-'}</strong>
                        </div>

                        <div 
                          className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                          style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ref. Compra USD:' : 'Ref. Buy USD:'}</span>
                          <strong className="text-sky-400">{buyVal > 0 ? `$${formatNumber(buyVal * coinPrice, 4)}` : '-'}</strong>
                        </div>

                        <div 
                          className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                          style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                        >
                          <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ref. Venta USD:' : 'Ref. Sell USD:'}</span>
                          <strong className="text-sky-400">{sellVal > 0 ? `$${formatNumber(sellVal * coinPrice, 4)}` : '-'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredTokens.length === 0 && (
                  <div className="text-slate-500 font-medium text-center py-8 w-full col-span-full">
                    {language === 'es' ? 'No se encontraron recursos' : 'No resources found'}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div 
            className="w-full max-w-[480px] bg-slate-950/95 border-none p-6 relative flex flex-col gap-4 prices-container"
            style={{ borderRadius: 'var(--radius-resource-item)' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
              <h3 className="text-lg font-black text-white">
                {t('prices.calcModalTitle')}
              </h3>
              <button 
                onClick={() => setShowCalc(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <p className="text-xs text-slate-400">
              {t('prices.calcDescription')}
            </p>

            <div className="space-y-3">
              {/* Auto Sync Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-slate-800/40">
                <input
                  type="checkbox"
                  checked={autoSyncCoin}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAutoSyncCoin(val);
                    localStorage.setItem('craftworld.autoSyncCoin', String(val));
                  }}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-900 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-white">
                  {language === 'es' ? 'Sincronizar precio real de COIN automáticamente' : 'Sync real COIN price automatically'}
                </span>
              </label>

              {/* COIN Price Edit field */}
              <label className="block space-y-1">
                <span className="text-xs text-emerald-400 font-bold">
                  {t('prices.coinPrice')}
                </span>
                <input
                  type="number"
                  step="0.00001"
                  min="0"
                  value={coinPrice}
                  disabled={autoSyncCoin}
                  onChange={(e) => handleCoinPriceChange(Number(e.target.value))}
                  className={`w-full rounded-[8px] border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 ${
                    autoSyncCoin ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </label>

              {/* COIN Amount Field */}
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">
                  {t('prices.enterCoin')}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={calcCoin}
                    onChange={(e) => handleCoinChange(e.target.value)}
                    className="w-full rounded-[8px] border border-slate-800 bg-slate-900 pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <img
                    src="/assets/resources/Coin.png"
                    alt="COIN"
                    className="absolute left-3 top-2 h-5 w-5 object-contain"
                    onError={(e) => { e.currentTarget.src = getResourceImage('Coin') }}
                  />
                </div>
              </label>

              {/* USD Amount Field */}
              <label className="block space-y-1">
                <span className="text-xs text-slate-300">
                  {t('prices.enterUsd')}
                </span>
                <div className="relative">
                  <input
                    type="number"
                    value={calcUsd}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    className="w-full rounded-[8px] border border-slate-800 bg-slate-900 pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute left-3 top-[7px] text-slate-400 font-bold text-sm">
                    $
                  </span>
                </div>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCalc(false)}
                className="rounded-[8px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 cursor-pointer transition-colors"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
