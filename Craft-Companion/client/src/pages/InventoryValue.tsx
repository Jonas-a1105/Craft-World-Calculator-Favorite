import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon } from '../components/GameIcon';
import { formatNumber } from '../utils/formatters';
import {
  loadPriceHistory,
  savePriceSnapshots,
  getResourceMarketDelta,
  PriceSnapshot,
} from '../services/priceHistory';

export default function InventoryValue() {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [homeData, setHomeData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCraftworldHome()
      .then((home) => {
        setHomeData(home);
        setPrices(extractPriceMap(home));
        if (home?.priceList?.prices && Array.isArray(home.priceList.prices)) {
          const snapshots: PriceSnapshot[] = home.priceList.prices.map((p: any) => ({
            symbol: String(p.referenceSymbol || '').toUpperCase(),
            sellPriceCoin: p.amount,
            buyPriceCoin: p.amount,
            timestamp: new Date().toISOString(),
            source: 'game',
            stale: false,
          }));
          savePriceSnapshots(snapshots);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const resources = homeData?.craftWorld?.resources || [];

  // Map recommendations by symbol
  const recMap: Record<string, string> = {};
  if (homeData?.priceList?.prices && Array.isArray(homeData.priceList.prices)) {
    homeData.priceList.prices.forEach((p: any) => {
      if (p.referenceSymbol && p.recommendation) {
        recMap[p.referenceSymbol.toUpperCase()] = p.recommendation;
      }
    });
  }

  const toggleExpand = (symbol: string) => {
    setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  const history = loadPriceHistory();

  // Calculate total inventory value in COIN
  let totalValue = 0;
  const valuedItems = resources.map((r: any) => {
    const sym = (r.symbol || '').toUpperCase();
    const unitPrice = prices[sym] || 0;
    const itemValue = (r.amount || 0) * unitPrice;
    totalValue += itemValue;
    const delta = getResourceMarketDelta(history, sym, recMap[sym]);
    return {
      symbol: r.symbol,
      amount: r.amount || 0,
      unitPrice,
      totalValue: itemValue,
      recommendation: recMap[sym] || '',
      delta,
    };
  });

  valuedItems.sort((a: any, b: any) => b.totalValue - a.totalValue);

  // Category branches matching the game filter buttons
  const CATEGORY_FILTERS = [
    {
      id: 'earth',
      label: 'Tierra',
      icon: '/assets/resources/Earth.png',
      tokens: ['EARTH', 'MUD', 'CLAY', 'SAND', 'COPPER', 'WIRE', 'STEEL', 'SCREWS', 'BOLTS'],
    },
    {
      id: 'water',
      label: 'Agua',
      icon: '/assets/resources/Water.png',
      tokens: ['WATER', 'SEAWATER', 'ALGAE', 'OXYGEN', 'GAS', 'FUEL', 'OIL'],
    },
    {
      id: 'fire',
      label: 'Fuego',
      icon: '/assets/resources/Fire.png',
      tokens: ['FIRE', 'HEAT', 'LAVA', 'GLASS', 'SULFUR', 'FIBERGLASS'],
    },
    {
      id: 'combined',
      label: 'Compuestos / T3',
      icon: '/assets/resources/Earth.png',
      tokens: [
        'SALT',
        'CERAMICS',
        'GLASS',
        'STONE',
        'STEAM',
        'CEMENT',
        'ACID',
        'SULFUR',
        'PLASTICS',
        'PLASTIC',
        'FIBERGLASS',
        'ENERGY',
        'HYDROGEN',
        'DYNAMITE',
      ],
    },
    {
      id: 'blueprints',
      label: 'Llaves y Pernos',
      icon: '/assets/resources/Hammer.png',
      tokens: ['BOLTS', 'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'],
    },
    {
      id: 'workers',
      label: 'Nidos y Estudios',
      icon: '/assets/resources/Coin.png',
      tokens: [
        'DUST',
        'WIRE',
        'NEST',
        'WETNEST',
        'WARMNEST',
        'DYNONEST',
        'PAPERWRAP',
        'SANDWRAP',
        'STEAMWRAP',
        'BOOK',
        'ARTICLE',
        'DIPLOMA',
      ],
    },
    {
      id: 'banner',
      label: 'Construcción / Estandarte',
      icon: '/assets/resources/Coin.png',
      tokens: ['LUMBER', 'BEAM', 'BRICK', 'TILE', 'NAIL', 'PAINT'],
    },
  ];

  // Filter items by active category branch
  const filteredItems = valuedItems.filter((item: any) => {
    if (!activeCategory) return true;
    const cat = CATEGORY_FILTERS.find((c) => c.id === activeCategory);
    if (!cat) return true;
    return cat.tokens.includes((item.symbol || '').toUpperCase());
  });

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6 pt-2">
        {/* Centered Total Value directly on canvas without cards */}
        <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
          <div className="flex items-center gap-2.5">
            <ResourceIcon symbol="Coin" size={30} />
            <span className="text-base sm:text-lg text-slate-300 font-semibold tracking-wide">
              {language === 'es' ? 'Valor total estimado' : 'Total estimated value'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-normal text-amber-400 font-title tracking-tight py-2 select-none">
            {formatNumber(totalValue)} <span className="text-base sm:text-lg md:text-xl font-normal text-amber-500 ml-2">COIN</span>
          </div>
          <div className="pt-0.5">
            <span className="bg-[#202024] px-3.5 py-1 rounded-full text-slate-300 font-bold text-xs">
              {resources.length} {language === 'es' ? 'recursos distintos' : 'distinct resources'}
            </span>
          </div>
        </div>

        {/* Resource Category Filter Bar matching game UI */}
        <div className="flex flex-col items-center gap-2 pt-1 pb-2">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(isSelected ? null : cat.id)}
                  title={cat.label}
                  style={{ padding: 0 }}
                  className={`relative w-11 h-11 min-w-[44px] min-h-[44px] !p-0 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 outline-none select-none ${
                    isSelected
                      ? 'bg-[#292930] scale-105 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25'
                      : 'bg-[#1c1c20] hover:bg-[#25252b] hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Category Pixel Icon - Exactly 26px matching resource cards */}
                  {cat.id === 'earth' && <ResourceIcon symbol="Earth" size={26} />}
                  {cat.id === 'water' && <ResourceIcon symbol="Water" size={26} />}
                  {cat.id === 'fire' && <ResourceIcon symbol="Fire" size={26} />}
                  {cat.id === 'combined' && (
                    <div className="relative w-[26px] h-[26px] flex items-center justify-center shrink-0 pointer-events-none">
                      <div className="absolute top-0"><ResourceIcon symbol="Earth" size={15} /></div>
                      <div className="absolute bottom-0 -left-1"><ResourceIcon symbol="Water" size={15} /></div>
                      <div className="absolute bottom-0 -right-1"><ResourceIcon symbol="Fire" size={15} /></div>
                    </div>
                  )}
                  {cat.id === 'blueprints' && (
                    <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="20" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                      <rect x="5" y="5" width="6" height="5" stroke="#e0f2fe" strokeWidth="1.2" strokeDasharray="1 1" fill="none" />
                      <line x1="14" y1="6" x2="19" y2="6" stroke="#e0f2fe" strokeWidth="1.2" />
                      <line x1="14" y1="9" x2="18" y2="9" stroke="#e0f2fe" strokeWidth="1.2" />
                      <line x1="5" y1="13" x2="19" y2="13" stroke="#bae6fd" strokeWidth="1" strokeDasharray="1.5 1" />
                      <line x1="5" y1="16" x2="12" y2="16" stroke="#e0f2fe" strokeWidth="1.2" />
                      <line x1="15" y1="16" x2="19" y2="16" stroke="#e0f2fe" strokeWidth="1.2" />
                      <line x1="5" y1="19" x2="16" y2="19" stroke="#e0f2fe" strokeWidth="1.2" />
                    </svg>
                  )}
                  {cat.id === 'workers' && (
                    <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M4 8C4 5 7 3 12 3C17 3 20 5 20 8H4Z" fill="#ef4444" />
                      <path d="M3 8H21V10H3V8Z" fill="#dc2626" />
                      <rect x="4" y="9" width="16" height="12" rx="2" fill="#fbbf24" />
                      <rect x="5" y="10" width="6" height="4" rx="1" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                      <rect x="13" y="10" width="6" height="4" rx="1" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                      <line x1="11" y1="12" x2="13" y2="12" stroke="#0f172a" strokeWidth="1.2" />
                      <rect x="6" y="16" width="12" height="4" rx="1" fill="#ffffff" stroke="#1f2937" strokeWidth="0.8" />
                      <line x1="9" y1="16" x2="9" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                      <line x1="12" y1="16" x2="12" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                      <line x1="15" y1="16" x2="15" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                    </svg>
                  )}
                  {cat.id === 'banner' && (
                    <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="2.5" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
                      <circle cx="2.5" cy="4.25" r="1.5" fill="#d97706" />
                      <circle cx="21.5" cy="4.25" r="1.5" fill="#d97706" />
                      <path d="M5 5.5H19V19L12 16L5 19V5.5Z" fill="#d946ef" stroke="#86198f" strokeWidth="1" />
                      <circle cx="12" cy="10.5" r="2.5" fill="#ffffff" />
                    </svg>
                  )}

                  {/* Active Green Checkmark Badge on Selected */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black rounded-full flex items-center justify-center text-[10px] font-black shadow-md">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {/* Clear Filter button if active */}
            {activeCategory && (
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                title={language === 'es' ? 'Quitar filtro' : 'Clear filter'}
                style={{ padding: 0 }}
                className="w-10 h-10 min-w-[40px] min-h-[40px] !p-0 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center text-sm font-black transition-all ml-1 shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Valued Inventory Grid floating directly on background */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-title text-xs md:text-sm text-white tracking-wide uppercase">
              {language === 'es' ? 'Recursos y Valor Individual' : 'Resources & Individual Value'}
            </h3>
            {activeCategory && (
              <span className="text-xs text-emerald-400 font-semibold">
                {filteredItems.length} {language === 'es' ? 'filtrados' : 'filtered'}
              </span>
            )}
          </div>

          {filteredItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {filteredItems.map((item: any, idx: number) => {
                const isExpanded = expandedSymbol === item.symbol;
                const rec = (item.recommendation || '').toUpperCase();

                return (
                  <div
                    key={item.symbol || idx}
                    onClick={() => toggleExpand(item.symbol)}
                    className={`group bg-[#202024] hover:bg-[#28282e] p-2.5 pr-4 rounded-[28px] transition-[background-color,transform,box-shadow] duration-200 cursor-pointer select-none shadow-md overflow-hidden ${
                      isExpanded ? 'bg-[#24242a]' : 'hover:scale-[1.015]'
                    }`}
                  >
                    {/* Top Row: Avatar, Info, Total, and Arrow */}
                    <div className="flex items-center justify-between">
                      {/* Left: Circular Avatar & Name + Amount */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                          <ResourceIcon symbol={item.symbol} size={26} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                            {item.symbol}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                            {formatNumber(item.amount)} {language === 'es' ? 'uds' : 'units'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Total Value in COIN & Expand Arrow */}
                      <div className="flex items-center gap-2.5 shrink-0 ml-2">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono block">
                            {formatNumber(item.totalValue)}
                          </span>
                          <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">
                            COIN
                          </span>
                        </div>

                        <div
                          className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90 text-amber-400 bg-amber-400/10' : ''
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Smooth Slide-down Details (Price & Badges) */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-200 ease-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-white/5' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-between px-2.5 py-1.5 text-xs bg-[#151518]/70 rounded-2xl">
                          {/* Clean Formatted Price */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium text-[11px]">
                              Price:
                            </span>
                            <span className="text-slate-200 font-bold font-mono">
                              {formatNumber(item.unitPrice, item.unitPrice < 0.01 ? 4 : 2)} COIN
                            </span>
                          </div>

                          {/* Badges and Activity Link in the slide-down drawer */}
                          <div className="flex items-center gap-2">
                            {/* Market Variation Badge (Clickable to view detail) */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resource/${encodeURIComponent(item.symbol)}`);
                              }}
                              role="button"
                              title={language === 'es' ? 'Ver detalles de mercado' : 'View market details'}
                              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border-none cursor-pointer hover:scale-105 active:scale-95 transition-transform select-none ${
                                item.delta?.isUp
                                  ? 'bg-[rgba(34,197,94,0.18)] text-[rgb(34,197,94)]'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              <span>{item.delta?.isUp ? '▲' : '▼'}</span>
                              <span>{item.delta?.percentStr}%</span>
                            </div>

                            {/* Recommendation Badge without border */}
                            {rec && (
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border-none select-none ${
                                  rec === 'BUY'
                                    ? 'bg-[rgba(34,197,94,0.2)] text-[rgb(34,197,94)]'
                                    : rec === 'SELL'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {rec}
                              </span>
                            )}

                            {/* Button to navigate to detailed resource page with green chevron only */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resource/${encodeURIComponent(item.symbol)}`);
                              }}
                              style={{ padding: 0 }}
                              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[rgb(34,197,94)] flex items-center justify-center font-bold text-sm transition-all border-none shrink-0 select-none !p-0 ml-0.5"
                              title={language === 'es' ? 'Ver detalles' : 'View details'}
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">
              {language === 'es'
                ? 'No se encontraron recursos en tu inventario.'
                : 'No resources found in your inventory.'}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
