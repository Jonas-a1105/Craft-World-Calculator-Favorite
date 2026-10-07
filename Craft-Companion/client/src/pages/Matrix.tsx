import React, { useEffect, useState, useMemo, useRef } from 'react';
import Layout from '../components/Layout';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { getCraftworldHome } from '../services/api';
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { Combobox } from '../components/ui/Combobox';
import {
  calculateFactoryRuntime,
  calculateRevenue,
  calculateInputCost,
} from '../services/craftworldCalculations';

const MINUTES_PER_HOUR = 60;

// Categorías oficiales con colores para los botones de filtrado
const CATEGORIES: Record<string, { label: string; color: string; border: string; bg: string; resources: string[] }> = {
  Earth: {
    label: 'Earth',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    resources: ['EARTH', 'MUD', 'CLAY', 'SAND', 'COPPER', 'CERAMICS', 'STONE', 'CEMENT', 'BOLTS'],
  },
  Water: {
    label: 'Water',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10 hover:bg-blue-500/20',
    resources: ['WATER', 'SEAWATER', 'ALGAE', 'OXYGEN', 'HYDROGEN'],
  },
  Fire: {
    label: 'Fire',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    resources: ['FIRE', 'HEAT', 'LAVA', 'STEEL', 'GLASS', 'STEAM', 'ENERGY'],
  },
  Special: {
    label: 'Special',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10 hover:bg-purple-500/20',
    resources: ['GAS', 'FUEL', 'OIL', 'ACID', 'SULFUR', 'PLASTICS', 'FIBERGLASS', 'DYNAMITE'],
  },
  Keys: {
    label: 'Keys',
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    resources: ['KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'],
  },
  Nests: {
    label: 'Nests',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    resources: ['SCREWS', 'COPPERKEY'],
  },
  Wraps: {
    label: 'Wraps',
    color: 'text-lime-400',
    border: 'border-lime-500/30',
    bg: 'bg-lime-500/10 hover:bg-lime-500/20',
    resources: [],
  },
  Academy: {
    label: 'Academy',
    color: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    resources: [],
  },
  Construction: {
    label: 'Construction',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10 hover:bg-orange-500/20',
    resources: [],
  },
};

const DEFAULT_RESOURCE_ORDER = [
  'MUD', 'CLAY', 'SAND', 'COPPER', 'SEAWATER', 'HEAT', 'ALGAE', 'LAVA', 'CERAMICS',
  'STEEL', 'OXYGEN', 'GLASS', 'GAS', 'STONE', 'STEAM', 'SCREWS', 'FUEL', 'CEMENT',
  'OIL', 'ACID', 'SULFUR', 'PLASTICS', 'FIBERGLASS', 'ENERGY', 'HYDROGEN', 'DYNAMITE',
  'BOLTS', 'KEY', 'CERAMICKEY', 'GLASSKEY', 'DYNOKEY'
];

export default function Matrix() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  // Ajustes en vivo (Settings bar)
  const [adBoost2x, setAdBoost2x] = useState(false);
  const [factoryBoost, setFactoryBoost] = useState<'none' | '2x' | '3.6x' | '5x'>('none');
  const [buySlippage, setBuySlippage] = useState(false);
  const [sellSlippage, setSellSlippage] = useState(false);
  const [powerPrice, setPowerPrice] = useState(0); // COIN / 100k Power

  // Filtros de categoría seleccionados (por defecto todos activos)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Precios dinámicos editables por recurso
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [basePriceMap, setBasePriceMap] = useState<Record<string, number>>({});

  // Nivel de maestría por recurso (0-10)
  const [masteryMap, setMasteryMap] = useState<Record<string, number>>({});
  const [openMasteryRes, setOpenMasteryRes] = useState<string | null>(null);
  const masteryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (masteryRef.current && !masteryRef.current.contains(e.target as Node)) {
        setOpenMasteryRes(null);
      }
    }
    if (openMasteryRes) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMasteryRes]);

  // Búsqueda para modo tabla
  const [tableSearch, setTableSearch] = useState('');

  // Carga de datos de fábricas y precios
  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadFactoryData(),
      getCraftworldHome().catch(() => null),
    ])
      .then(([factoryRows, home]) => {
        if (!mounted) return;
        setRows(factoryRows);

        const extracted = extractPriceMap(home);
        setPriceMap(extracted);
        setBasePriceMap(extracted);

        // Extraer maestrías si existen en el perfil
        const newMasteryMap: Record<string, number> = {};
        if (home?.craftWorld?.proficiencies && Array.isArray(home.craftWorld.proficiencies)) {
          home.craftWorld.proficiencies.forEach((p: any) => {
            const sym = (p.symbol || p.token || '').toUpperCase();
            if (sym) {
              newMasteryMap[sym] = Math.min(10, Math.max(0, p.level || p.claimedLevel || 0));
            }
          });
        }
        setMasteryMap(newMasteryMap);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Multiplicador total de velocidad de fábrica
  const speedMultiplier = useMemo(() => {
    let mult = 1;
    if (adBoost2x) mult *= 2;
    if (factoryBoost === '2x') mult *= 2;
    if (factoryBoost === '3.6x') mult *= 3.6;
    if (factoryBoost === '5x') mult *= 5;
    return mult;
  }, [adBoost2x, factoryBoost]);

  const boostOptions = useMemo(
    () => [
      { value: 'none', label: language === 'es' ? 'Sin Boost' : 'No Boost' },
      { value: '2x', label: '2x Boost' },
      { value: '3.6x', label: '3.6x Boost' },
      { value: '5x', label: '5x Boost' },
    ],
    [language]
  );

  const masteryOptions = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        value: i,
        label: `${i} ★`,
      })),
    []
  );

  // Factor de deslizamiento (slippage)
  const buySlippageFactor = buySlippage ? 1.05 : 1.0;
  const sellSlippageFactor = sellSlippage ? 0.95 : 1.0;

  // Lista de todos los recursos únicos de las fábricas ordenados
  const availableResources = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.output_token) set.add(r.output_token);
      if (r.token) set.add(r.token);
    });

    // Ordenar respetando el orden oficial si existe, o alfabéticamente
    return Array.from(set).sort((a, b) => {
      const idxA = DEFAULT_RESOURCE_ORDER.indexOf(a);
      const idxB = DEFAULT_RESOURCE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [rows]);

  // Filtrado de recursos por categoría si hay alguna seleccionada
  const visibleResources = useMemo(() => {
    if (!selectedCategory) return availableResources;
    const cat = CATEGORIES[selectedCategory];
    if (!cat || !cat.resources.length) return availableResources;
    return availableResources.filter((res) => cat.resources.includes(res));
  }, [availableResources, selectedCategory]);

  // Niveles del 1 al 20
  const levels = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), []);

  // Mapeo rápido: [token][level] => FactoryDataRow
  const rowLookup = useMemo(() => {
    const map = new Map<string, FactoryDataRow>();
    rows.forEach((r) => {
      map.set(`${r.token}_${r.level}`, r);
      if (r.output_token && !map.has(`${r.output_token}_${r.level}`)) {
        map.set(`${r.output_token}_${r.level}`, r);
      }
    });
    return map;
  }, [rows]);

  // Función de cálculo de ganancia neta por hora para una celda
  const getProfitPerHour = (resource: string, level: number): { profit: number; valid: boolean; runtime: number } => {
    const row = rowLookup.get(`${resource}_${level}`);
    if (!row) return { profit: 0, valid: false, runtime: 0 };

    // Construir contexto con maestría y boost
    const masteryLvl = masteryMap[resource] ?? 0;
    const proficiencies = masteryLvl > 0 ? [{ token: resource, level: masteryLvl }] : [];

    // Runtime en minutos con boosts
    const baseRuntime = calculateFactoryRuntime(row, { proficiencies });
    const runtimeMinutes = speedMultiplier > 0 ? baseRuntime / speedMultiplier : baseRuntime;

    if (runtimeMinutes <= 0) return { profit: 0, valid: false, runtime: 0 };

    // Precios ajustados por slippage
    const adjustedPrices: Record<string, number> = {};
    for (const [k, v] of Object.entries(priceMap)) {
      adjustedPrices[k] = v;
    }

    // Costo de insumos (ajustado por buy slippage)
    let inputCost = calculateInputCost(row, adjustedPrices, { proficiencies }) * buySlippageFactor;

    // Ingreso de salida (ajustado por sell slippage)
    let revenue = calculateRevenue(row, adjustedPrices, { proficiencies }) * sellSlippageFactor;

    // Deducción de costo de energía por ciclo si se especificó powerPrice
    if (powerPrice > 0) {
      // Consumo estimado promedio de 10 power por minuto
      const powerUnits = runtimeMinutes * 10;
      const powerCost = (powerUnits / 100000) * powerPrice;
      inputCost += powerCost;
    }

    const profitPerCycle = revenue - inputCost;
    const profitPerHour = profitPerCycle * (MINUTES_PER_HOUR / runtimeMinutes);

    return { profit: profitPerHour, valid: true, runtime: runtimeMinutes };
  };

  // Restablecer precios a valores base
  const handleResetPrices = () => {
    setPriceMap(basePriceMap);
  };

  // Formateador de ganancia compacto estilo referencia (media_1791203283402.png)
  const formatProfit = (val: number) => {
    const sign = val > 0 ? '+' : '';
    const abs = Math.abs(val);
    if (abs >= 10000) {
      return `${sign}${(val / 1000).toFixed(1)}k`;
    }
    if (abs >= 100) {
      return `${sign}${val.toFixed(0)}`;
    }
    if (abs >= 10) {
      return `${sign}${val.toFixed(1)}`;
    }
    return `${sign}${val.toFixed(2)}`;
  };

  // Formateador conciso y preciso para precios visibles (ej: 0.004, 0.01, 0.35, 10.6, 511, 1.6k)
  const formatCompactPrice = (price: number | undefined) => {
    if (price === undefined || isNaN(price)) return '0';
    if (price >= 10000) return `${(price / 1000).toFixed(0)}k`;
    if (price >= 1000) return `${(price / 1000).toFixed(1)}k`;
    if (price >= 100) return price.toFixed(0);
    if (price >= 10) return price.toFixed(1);
    if (price >= 1) return price.toFixed(1);
    if (price >= 0.1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(2);
    if (price > 0) return price.toFixed(3);
    return '0';
  };

  // Color de fondo para cada celda según el profit (Heatmap)
  const getCellBgClass = (profit: number, valid: boolean) => {
    if (!valid) return 'text-zinc-600 bg-transparent';
    if (profit > 50) return 'text-emerald-300 bg-emerald-500/25 font-bold';
    if (profit > 15) return 'text-emerald-400 bg-emerald-500/15 font-semibold';
    if (profit > 0) return 'text-emerald-400/90 bg-emerald-500/5';
    if (profit === 0) return 'text-zinc-400 bg-zinc-800/20';
    if (profit > -15) return 'text-rose-400/80 bg-rose-500/10';
    if (profit > -50) return 'text-rose-400 bg-rose-500/20 font-semibold';
    return 'text-rose-300 bg-rose-500/30 font-bold';
  };

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[1920px] mx-auto space-y-3 px-2 sm:px-3 pb-12">
        {/* HEADER & SETTINGS TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
          {/* Titulo y descripción */}
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-base sm:text-xl md:text-2xl font-title font-bold text-white tracking-wider uppercase"
                style={{
                  textShadow:
                    '0 2px 10px rgba(0,0,0,0.9), 0 0 15px rgba(56,189,248,0.2)',
                }}
              >
                {language === 'es' ? 'Matriz de Ganancias' : 'Profit Matrix'}
              </h1>
              <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-full border-none">
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                    viewMode === 'matrix' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white bg-transparent'
                  }`}
                >
                  {language === 'es' ? 'Matriz' : 'Matrix'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer border-none ${
                    viewMode === 'table' ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-400 hover:text-white bg-transparent'
                  }`}
                >
                  {language === 'es' ? 'Lista' : 'Table'}
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-main">
              {language === 'es'
                ? 'Matriz dinámica para consultar la rentabilidad por recurso en tiempo real. Ajusta maestrías, slippage y costos para evaluar cada nivel de fábrica.'
                : 'Dynamic matrix to check for resource profitability at a glance. Adjust masteries, slippage, and power cost.'}
            </p>
          </div>

          {/* SETTINGS BAR CONTROLS - RESPONSIVE BALANCED GRID & BORDERLESS */}
          <div className="bg-[#18181b] p-3 rounded-[24px] border-none shadow-md">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:flex-wrap gap-2 sm:gap-2.5 text-xs select-none">
              {/* x2 Ad Boost */}
              <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
                <div
                  className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                    adBoost2x
                      ? 'bg-emerald-400 text-black shadow-sm'
                      : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
                  }`}
                >
                  <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <input
                  type="checkbox"
                  checked={adBoost2x}
                  onChange={(e) => setAdBoost2x(e.target.checked)}
                  className="sr-only"
                />
                <span className={`text-xs font-bold truncate transition-colors ${adBoost2x ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                  x2 ad boost
                </span>
              </label>

              {/* Buy Slippage */}
              <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
                <div
                  className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                    buySlippage
                      ? 'bg-emerald-400 text-black shadow-sm'
                      : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
                  }`}
                >
                  <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <input
                  type="checkbox"
                  checked={buySlippage}
                  onChange={(e) => setBuySlippage(e.target.checked)}
                  className="sr-only"
                />
                <span className={`text-xs font-bold truncate transition-colors ${buySlippage ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                  Buy slippage
                </span>
              </label>

              {/* Sell Slippage */}
              <label className="flex items-center gap-2 bg-[#141416] hover:bg-[#1a1a1e] p-2.5 px-3 rounded-2xl cursor-pointer select-none group transition-all">
                <div
                  className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${
                    sellSlippage
                      ? 'bg-emerald-400 text-black shadow-sm'
                      : 'bg-[#202024] border border-white/10 group-hover:border-white/25 text-transparent'
                  }`}
                >
                  <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <input
                  type="checkbox"
                  checked={sellSlippage}
                  onChange={(e) => setSellSlippage(e.target.checked)}
                  className="sr-only"
                />
                <span className={`text-xs font-bold truncate transition-colors ${sellSlippage ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                  Sell slippage
                </span>
              </label>

              {/* Factory Boost Combobox */}
              <div className="bg-[#141416] p-1.5 px-2.5 rounded-2xl flex items-center justify-between gap-1.5 min-w-0">
                <span className="text-zinc-400 font-bold text-xs flex-shrink-0">Boost:</span>
                <div className="flex-1 min-w-0">
                  <Combobox
                    value={factoryBoost}
                    onChange={(val) => setFactoryBoost(val as any)}
                    options={boostOptions}
                    className="w-full !py-1.5 !px-2.5 bg-[#202024] hover:bg-[#28282e] rounded-xl text-xs font-bold text-white shadow-inner justify-between"
                    menuClassName="w-full min-w-[130px] max-h-48"
                    align="left"
                  />
                </div>
              </div>

              {/* Power Price */}
              <div className="col-span-2 sm:col-span-1 lg:col-auto bg-[#141416] p-2 px-3 rounded-2xl flex items-center justify-between sm:justify-start gap-2">
                <span className="text-zinc-400 font-bold text-xs flex-shrink-0">Power:</span>
                <div className="flex items-center bg-[#202024] rounded-xl px-2.5 py-1 shadow-inner">
                  <input
                    type="number"
                    min="0"
                    value={powerPrice}
                    onChange={(e) => setPowerPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-10 bg-transparent text-white text-xs font-mono font-bold focus:outline-none text-right pr-1 border-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">/ 100k</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBHEADER: CATEGORY FILTER CAROUSEL + METRICS + RESET */}
        <div className="bg-[#18181b] p-2.5 sm:p-3 rounded-[24px] border-none shadow-md space-y-2.5">
          {/* Row 1: Horizontal Scroll Carousel of Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto modal-custom-scroll pb-1 -mx-0.5 px-0.5 scroll-smooth">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none shadow-sm ${
                selectedCategory === null
                  ? 'bg-white text-black'
                  : 'bg-[#141416] hover:bg-[#202024] text-zinc-400 hover:text-white'
              }`}
            >
              {language === 'es' ? 'Todas' : 'All'}
            </button>
            {Object.entries(CATEGORIES).map(([catKey, cat]) => {
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : catKey)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border-none shadow-sm ${
                    isSelected
                      ? 'bg-white/20 text-white ring-1 ring-white/30'
                      : `${cat.bg} ${cat.color}`
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Secondary Bar with Action Buttons and Count */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04] text-xs">
            <button
              type="button"
              onClick={handleResetPrices}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1 rounded-full bg-[#141416] hover:bg-[#202024] transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-inner"
            >
              <span>↺</span>
              <span>{language === 'es' ? 'Restablecer precios' : 'Reset prices'}</span>
            </button>
            <div className="text-xs text-zinc-400 font-mono font-bold bg-[#141416] px-3 py-1 rounded-full shadow-inner">
              {language === 'es' ? 'Recursos' : 'Resources'} {visibleResources.length}/{availableResources.length}
            </div>
          </div>
        </div>

        {/* VIEW 1: PROFIT MATRIX HEATMAP GRID - COMPACT & EXPANDED */}
        {viewMode === 'matrix' && (
          <div className="bg-[#18181b] rounded-[24px] border-none shadow-2xl relative">
            <div className="overflow-x-auto modal-custom-scroll [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
              <table className="w-full border-separate border-spacing-0 text-left font-mono select-none">
                {/* CABECERA 1: MASTERY / MAESTRÍAS */}
                <thead className="sticky top-0 z-30 bg-[#161619] shadow-md">
                  <tr className="border-b border-white/[0.04]">
                    {/* Celda de esquina izquierda - Fija en scroll horizontal */}
                    <th
                      style={{ position: 'sticky', left: 0, zIndex: 50, backgroundColor: '#161619' }}
                      className="matrix-sticky-col p-0.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                    >
                      MAST.
                    </th>
                    {visibleResources.map((res) => {
                      const curMastery = masteryMap[res] ?? 0;
                      return (
                        <th key={`mast_${res}`} className="p-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] relative border-b border-white/[0.04]">
                          <button
                            type="button"
                            onClick={() => setOpenMasteryRes(openMasteryRes === res ? null : res)}
                            className="w-full py-0.5 px-0.5 rounded bg-[#141416] hover:bg-[#202024] text-[8.5px] font-mono font-bold text-amber-300 flex items-center justify-center gap-0.5 border-none cursor-pointer shadow-inner transition-colors"
                            title={`Maestría para ${res}: ${curMastery} ★`}
                          >
                            <span>{curMastery}</span>
                            <span className="text-[6.5px] text-zinc-500">▼</span>
                          </button>
                          {openMasteryRes === res && (
                            <div
                              ref={masteryRef}
                              className="absolute top-full left-0 z-50 mt-1 bg-[#18181b] rounded-xl shadow-2xl p-1 border border-white/[0.08] w-20 max-h-48 overflow-y-auto modal-custom-scroll animate-in fade-in zoom-in-95 duration-100"
                              style={{ boxShadow: '0 16px 40px -6px rgba(0, 0, 0, 0.85)' }}
                            >
                              {Array.from({ length: 11 }, (_, i) => {
                                const isSelected = curMastery === i;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      setMasteryMap((prev) => ({ ...prev, [res]: i }));
                                      setOpenMasteryRes(null);
                                    }}
                                    className={`w-full !bg-transparent flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer text-left transition-colors ${
                                      isSelected
                                        ? '!text-emerald-400 bg-white/[0.05]'
                                        : '!text-zinc-300 hover:!text-white hover:bg-white/[0.04]'
                                    }`}
                                  >
                                    <span>{i} ★</span>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>

                  {/* CABECERA 2: PRECIOS */}
                  <tr className="border-b border-white/[0.04] bg-[#141416]">
                    <th
                      style={{ position: 'sticky', left: 0, zIndex: 50, backgroundColor: '#141416' }}
                      className="matrix-sticky-col p-0.5 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                    >
                      PRICE
                    </th>
                    {visibleResources.map((res) => {
                      const curPrice = priceMap[res];
                      return (
                        <th key={`price_${res}`} className="p-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] border-b border-white/[0.04]">
                          <input
                            type="text"
                            value={curPrice !== undefined ? formatCompactPrice(curPrice) : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value.replace('k', '000')) || 0;
                              setPriceMap((prev) => ({ ...prev, [res]: val }));
                            }}
                            className="w-full bg-transparent hover:bg-white/5 focus:bg-[#202024] text-amber-300 font-mono text-[8px] sm:text-[8.5px] font-bold text-center rounded px-0 py-0.5 border-none outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer"
                            placeholder="0"
                            title={`Precio para ${res}: ${curPrice ?? 0} COIN`}
                          />
                        </th>
                      );
                    })}
                  </tr>

                  {/* CABECERA 3: ICONOS Y NOMBRES DE RECURSOS */}
                  <tr className="border-b border-white/10 bg-[#16161a]">
                    <th
                      style={{ position: 'sticky', left: 0, zIndex: 50, backgroundColor: '#16161a' }}
                      className="matrix-sticky-col p-0.5 text-[9px] font-bold text-white uppercase tracking-wider text-center min-w-[32px] w-[32px] border-r border-b border-white/15 shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                    >
                      Lv.
                    </th>
                    {visibleResources.map((res) => (
                      <th
                        key={`icon_${res}`}
                        className="p-1 px-0.5 text-center min-w-[34px] max-w-[38px] w-[36px] hover:bg-white/5 transition-colors cursor-pointer border-b border-white/10"
                        title={res}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <ResourceIcon symbol={res} size={14} />
                          <span className="text-[7px] font-sans font-extrabold text-zinc-300 truncate max-w-[34px] leading-tight block text-center">
                            {res}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* CUERPO: FILAS POR NIVEL (Lv. 1 a Lv. 20) */}
                <tbody>
                  {levels.map((lvl) => (
                    <tr key={lvl} className="hover:bg-white/[0.02] transition-colors">
                      {/* Columna Sticky izquierda con el Nivel - Se mantiene fija al hacer scroll horizontal */}
                      <td
                        style={{ position: 'sticky', left: 0, zIndex: 30, backgroundColor: '#151518' }}
                        className="matrix-sticky-col p-0.5 text-center text-[9px] font-bold text-zinc-300 border-r border-b border-white/10 select-none min-w-[32px] w-[32px] shadow-[2px_0_5px_rgba(0,0,0,0.5)]"
                      >
                        {lvl}
                      </td>

                      {/* Celdas con Heatmap y Valores de Ganancia */}
                      {visibleResources.map((res) => {
                        const { profit, valid, runtime } = getProfitPerHour(res, lvl);
                        const cellBg = getCellBgClass(profit, valid);

                        return (
                          <td
                            key={`${res}_${lvl}`}
                            className={`p-0.5 px-0 text-center text-[8px] sm:text-[8.5px] font-mono whitespace-nowrap transition-colors border-r border-b border-white/[0.03] min-w-[34px] max-w-[38px] w-[36px] ${cellBg}`}
                            title={
                              valid
                                ? `${res} (Lv. ${lvl})\nProfit: ${formatProfit(profit)} coin/h\nCycle: ${runtime.toFixed(1)} min`
                                : `${res} (No recipe at Lv. ${lvl})`
                            }
                          >
                            {valid ? formatProfit(profit) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: TRADITIONAL SEARCHABLE RECIPE TABLE */}
        {viewMode === 'table' && (
          <div className="bg-[#18181b] rounded-[28px] p-5 border-none space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder={language === 'es' ? 'Buscar fábrica o recurso...' : 'Search factory or resource...'}
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full max-w-sm bg-[#141416] border-none rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 shadow-inner"
              />
              <span className="text-xs text-zinc-400 font-mono">
                {rows.length} {language === 'es' ? 'recetas' : 'recipes'}
              </span>
            </div>

            <div className="overflow-x-auto max-h-[600px] rounded-2xl border-none">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#202024] text-zinc-400 font-bold sticky top-0 z-10 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
                    <th className="p-3">{language === 'es' ? 'Nivel' : 'Level'}</th>
                    <th className="p-3">{language === 'es' ? 'Tiempo' : 'Time'}</th>
                    <th className="p-3">{language === 'es' ? 'Insumo 1' : 'Input 1'}</th>
                    <th className="p-3">{language === 'es' ? 'Insumo 2' : 'Input 2'}</th>
                    <th className="p-3">{language === 'es' ? 'Salida' : 'Output'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {rows
                    .filter(
                      (r) =>
                        r.token.toLowerCase().includes(tableSearch.toLowerCase()) ||
                        r.output_token.toLowerCase().includes(tableSearch.toLowerCase())
                    )
                    .map((r, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          <FactoryIcon symbol={r.token} size={20} />
                          <span>{r.token}</span>
                        </td>
                        <td className="p-3 text-zinc-300">Nv. {r.level}</td>
                        <td className="p-3 text-zinc-400">{r.duration_min} min</td>
                        <td className="p-3">
                          {r.input_token_1 ? (
                            <span className="flex items-center gap-1.5">
                              <ResourceIcon symbol={r.input_token_1} size={16} />
                              {r.input_amount_1} {r.input_token_1}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3">
                          {r.input_token_2 ? (
                            <span className="flex items-center gap-1.5">
                              <ResourceIcon symbol={r.input_token_2} size={16} />
                              {r.input_amount_2} {r.input_token_2}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3 font-bold text-emerald-400 flex items-center gap-1.5">
                          <ResourceIcon symbol={r.output_token} size={18} />
                          {r.output_amount} {r.output_token}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
