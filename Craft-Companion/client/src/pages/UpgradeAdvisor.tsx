import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { getCraftworldBuyQuote, getCraftworldHome, getCraftworldQuote } from '../services/api';
import { getActiveFactoryBoostPercent, getRunsPerHourWithFactoryBoosts, type FactoryBoost } from '../services/factoryBoostModifiers';
import { loadFactoryData, type FactoryDataRow } from '../services/factoryData';
import { applyMasteryInputReduction, getMasteryInputReductionPercent, getMasteryLevel, type ProficiencyItem } from '../services/masteryModifiers';
import { applyWorkshopSpeedToDuration, getWorkshopSpeedBoostPercent, type WorkshopItem } from '../services/workshopModifiers';

type OwnedFactory = { id?: string; areaSymbol?: string; level?: number; landPlotName?: string; activeBoosts?: FactoryBoost[] };
type ResourceAmount = { symbol?: string; amount?: number };
type Quote = { input: { symbol: string; amount: number }; output: { symbol: string; amount: number }; details?: { priceImpactPercentage?: number } };
type QuoteMap = Record<string, Quote | null>;

type FactoryOption = {
  key: string;
  factory: OwnedFactory;
  symbol: string;
  plotName: string;
  level: number;
  nextLevel: number;
  currentRow: FactoryDataRow;
  nextRow: FactoryDataRow;
};

type AdvisorRow = {
  option: FactoryOption;
  needToken: string;
  needAmount: number;
  ownAmount: number;
  gapAmount: number;
  buyCost: number | null;
  craftCost: number | null;
  bestCost: number | null;
  bestChoice: string;
  gainPerHour: number;
  currentProfitPerHour: number;
  nextProfitPerHour: number;
  workshopBoostPercent: number;
  activeBoostPercent: number;
  currentMasteryText: string;
  nextMasteryText: string;
  breakEvenHours: number;
  impact: number;
  ready: boolean;
};

const BATCH_SIZE = 12;

function sellKey(symbol: string, amount: number) {
  return `SELL:${symbol.toUpperCase()}:${amount}`;
}

function buyKey(symbol: string, amount: number) {
  return `BUY:COIN:${symbol.toUpperCase()}:${amount}`;
}

function fmt(value: number, digits = 6) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function getFactoryImage(symbol?: string) {
  if (!symbol) return '';
  const cleanName = symbol.trim().toLowerCase();
  const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  if (capitalized === 'Earth') return '/assets/factories/Earth.png';
  return `/assets/factories/${capitalized}.gif`;
}

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

function formatPlotName(plotName: string, lang: string): string {
  const normalized = String(plotName || '').trim().toUpperCase();
  if (lang === 'es') {
    if (normalized.includes('EARTH_PLOT')) return 'Fábrica de Tierra';
    if (normalized.includes('BLUEPRINT_PLOT_A')) return 'Plano A';
    if (normalized.includes('BLUEPRINT_PLOT_B')) return 'Plano B';
    if (normalized.includes('BLUEPRINT_PLOT_C')) return 'Plano C';
    if (normalized.includes('BLUEPRINT_PLOT_D')) return 'Plano D';
    if (normalized.includes('BLUEPRINT_PLOT_E')) return 'Plano E';
    if (normalized.includes('BLUEPRINT_PLOT_F')) return 'Plano F';
    if (normalized.includes('BLUEPRINT_PLOT_G')) return 'Plano G';
    if (normalized.includes('BLUEPRINT_PLOT_H')) return 'Plano H';
    return plotName;
  }
  return plotName;
}

function formatBestChoice(choice: string, lang: string) {
  switch (choice) {
    case 'Ready': return lang === 'es' ? 'Listo' : 'Ready';
    case 'Craft': return lang === 'es' ? 'Fabricar' : 'Craft';
    case 'Buy': return lang === 'es' ? 'Comprar' : 'Buy';
    case 'Waiting': return lang === 'es' ? 'Esperando' : 'Waiting';
    default: return choice;
  }
}

function fmtHours(hours: number, lang: string) {
  if (!Number.isFinite(hours) || hours <= 0) return lang === 'es' ? 'No rentable' : 'Not profitable';
  if (hours < 1) return lang === 'es' ? `${fmt(hours * 60, 1)} min` : `${fmt(hours * 60, 1)} min`;
  if (hours < 24) return lang === 'es' ? `${fmt(hours, 2)} hr` : `${fmt(hours, 2)} hr`;
  return lang === 'es' ? `${fmt(hours / 24, 2)} días` : `${fmt(hours / 24, 2)} days`;
}

function rowLabel(option: FactoryOption, lang: string) {
  const plot = formatPlotName(option.plotName, lang);
  const factory = formatFactoryName(option.symbol, lang);
  return `${plot} • ${factory} • ${lang === 'es' ? 'Nivel' : 'Lv'} ${option.level} → ${lang === 'es' ? 'Nivel' : 'Lv'} ${option.nextLevel}`;
}

function masteryText(row: FactoryDataRow, proficiencies: ProficiencyItem[], lang: string) {
  const level = getMasteryLevel(row.token, proficiencies);
  const reduction = getMasteryInputReductionPercent(row.token, proficiencies);
  return `${lang === 'es' ? 'Nivel' : 'Lv'} ${level} / ${fmt(reduction, 2)}% ${formatFactoryName(row.token, lang)}`;
}

function inventoryMap(items: ResourceAmount[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const symbol = String(item.symbol || '').trim().toUpperCase();
    const amount = Number(item.amount || 0);
    if (symbol && amount > 0) acc[symbol] = (acc[symbol] || 0) + amount;
    return acc;
  }, {});
}

function adjustedInputAmount(factoryToken: string, amount: number, proficiencies: ProficiencyItem[]) {
  return Math.ceil(applyMasteryInputReduction(amount, factoryToken, proficiencies));
}

function recipeRequests(row: FactoryDataRow | null | undefined, proficiencies: ProficiencyItem[]) {
  if (!row) return [] as Array<{ type: 'sell'; symbol: string; amount: number; key: string }>;
  const input1Amount = adjustedInputAmount(row.token, row.input_amount_1, proficiencies);
  const requests = [
    { type: 'sell' as const, symbol: row.output_token, amount: row.output_amount, key: sellKey(row.output_token, row.output_amount) },
    { type: 'sell' as const, symbol: row.input_token_1, amount: input1Amount, key: sellKey(row.input_token_1, input1Amount) },
  ];
  if (row.input_token_2 && row.input_amount_2 > 0) {
    const input2Amount = adjustedInputAmount(row.token, row.input_amount_2, proficiencies);
    requests.push({ type: 'sell' as const, symbol: row.input_token_2, amount: input2Amount, key: sellKey(row.input_token_2, input2Amount) });
  }
  return requests;
}

function recipeProfitPerHour(row: FactoryDataRow, quotes: QuoteMap, workshop: WorkshopItem[], activeBoosts: FactoryBoost[], proficiencies: ProficiencyItem[]) {
  const input1Amount = adjustedInputAmount(row.token, row.input_amount_1, proficiencies);
  const input2Amount = row.input_token_2 ? adjustedInputAmount(row.token, row.input_amount_2, proficiencies) : 0;
  const output = quotes[sellKey(row.output_token, row.output_amount)] || null;
  const input1 = quotes[sellKey(row.input_token_1, input1Amount)] || null;
  const input2 = row.input_token_2 ? quotes[sellKey(row.input_token_2, input2Amount)] || null : null;
  const missing = !output || !input1 || Boolean(row.input_token_2 && !input2);
  if (missing) return { value: 0, missing: true, impact: 0 };

  const inputCost = input1.output.amount + (input2?.output.amount || 0);
  const profitPerRun = output.output.amount - inputCost;
  const workshopDuration = applyWorkshopSpeedToDuration(row.duration_min, row.token, workshop);
  const runsPerHour = getRunsPerHourWithFactoryBoosts(workshopDuration, activeBoosts);
  const impact = Math.max(
    output.details?.priceImpactPercentage || 0,
    input1.details?.priceImpactPercentage || 0,
    input2?.details?.priceImpactPercentage || 0,
  );

  return { value: profitPerRun * runsPerHour, missing: false, impact };
}

function craftCostForGap(producerRow: FactoryDataRow | null, gapAmount: number, quotes: QuoteMap, proficiencies: ProficiencyItem[]) {
  if (!producerRow || gapAmount <= 0 || producerRow.output_amount <= 0) return { cost: null as number | null, missing: false, impact: 0 };

  const input1Amount = adjustedInputAmount(producerRow.token, producerRow.input_amount_1, proficiencies);
  const input2Amount = producerRow.input_token_2 ? adjustedInputAmount(producerRow.token, producerRow.input_amount_2, proficiencies) : 0;
  const input1 = quotes[sellKey(producerRow.input_token_1, input1Amount)] || null;
  const input2 = producerRow.input_token_2 ? quotes[sellKey(producerRow.input_token_2, input2Amount)] || null : null;
  const missing = !input1 || Boolean(producerRow.input_token_2 && !input2);
  if (missing) return { cost: null, missing: true, impact: 0 };

  const costPerRun = input1.output.amount + (input2?.output.amount || 0);
  const runMultiplier = gapAmount / producerRow.output_amount;
  const impact = Math.max(input1.details?.priceImpactPercentage || 0, input2?.details?.priceImpactPercentage || 0);

  return { cost: costPerRun * runMultiplier, missing: false, impact };
}

export default function UpgradeAdvisor() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [ownedFactories, setOwnedFactories] = useState<OwnedFactory[]>([]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [workshop, setWorkshop] = useState<WorkshopItem[]>([]);
  const [proficiencies, setProficiencies] = useState<ProficiencyItem[]>([]);
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quotedCount, setQuotedCount] = useState(0);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('advisorViewMode') as 'list' | 'grid') || 'list');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [factoryRows, homeData] = await Promise.all([loadFactoryData(), getCraftworldHome()]);
        setRows(factoryRows);
        setOwnedFactories(homeData.factories || []);
        setInventory(inventoryMap(homeData.inventory || []));
        setWorkshop(homeData.workshop || []);
        setProficiencies(homeData.proficiencies || []);
      } catch {
        setError('Unable to load upgrade advisor data. Refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const options = useMemo<FactoryOption[]>(() => {
    return ownedFactories
      .map((factory, index) => {
        const symbol = String(factory.areaSymbol || '').trim().toUpperCase();
        const level = typeof factory.level === 'number' ? factory.level + 1 : 0;
        const nextLevel = level + 1;
        const currentRow = rows.find((row) => row.token === symbol && row.level === level);
        const nextRow = rows.find((row) => row.token === symbol && row.level === nextLevel);
        if (!symbol || !currentRow || !nextRow) return null;
        return {
          key: factory.id || `${factory.landPlotName || 'plot'}-${symbol}-${level}-${index}`,
          factory,
          symbol,
          plotName: factory.landPlotName || 'Unknown plot',
          level,
          nextLevel,
          currentRow,
          nextRow,
        };
      })
      .filter((value): value is FactoryOption => Boolean(value));
  }, [ownedFactories, rows]);

  const producerRows = useMemo(() => {
    const map = new Map<string, FactoryDataRow>();
    ownedFactories.forEach((factory) => {
      const symbol = String(factory.areaSymbol || '').trim().toUpperCase();
      const level = typeof factory.level === 'number' ? factory.level + 1 : 0;
      const row = rows.find((item) => item.token === symbol && item.level === level);
      if (!symbol || !row) return;
      const best = map.get(symbol);
      if (!best || row.level > best.level) map.set(symbol, row);
    });
    return map;
  }, [ownedFactories, rows]);

  const quoteRequests = useMemo(() => {
    const map = new Map<string, { type: 'sell' | 'buy'; symbol: string; amount: number; key: string }>();

    options.forEach((option) => {
      [...recipeRequests(option.currentRow, proficiencies), ...recipeRequests(option.nextRow, proficiencies)].forEach((request) => map.set(request.key, request));

      const needToken = option.nextRow.upgrade_token;
      const needAmount = option.nextRow.upgrade_amount;
      const gapAmount = Math.max(needAmount - (inventory[needToken] || 0), 0);
      if (needToken && gapAmount > 0) {
        map.set(buyKey(needToken, gapAmount), { type: 'buy', symbol: needToken, amount: gapAmount, key: buyKey(needToken, gapAmount) });
      }

      recipeRequests(producerRows.get(needToken) || null, proficiencies).forEach((request) => map.set(request.key, request));
    });

    return Array.from(map.values());
  }, [inventory, options, producerRows, proficiencies]);

  useEffect(() => {
    if (!quoteRequests.length) return;
    let cancelled = false;

    const loadQuotes = async () => {
      setQuoteLoading(true);
      setQuotedCount(0);
      try {
        const missing = quoteRequests.filter((request) => quotes[request.key] === undefined);
        if (missing.length === 0) {
          setQuotedCount(quoteRequests.length);
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          const alreadyCachedCount = quoteRequests.length - missing.length;
          setQuotedCount(alreadyCachedCount);

          for (let index = 0; index < missing.length; index += BATCH_SIZE) {
            const batch = missing.slice(index, index + BATCH_SIZE);
            const entries = await Promise.all(batch.map(async (request) => {
              try {
                const quote = request.type === 'buy'
                  ? await getCraftworldBuyQuote({ inputSymbol: 'COIN', outputSymbol: request.symbol, outputAmount: request.amount })
                  : await getCraftworldQuote({ inputSymbol: request.symbol, outputSymbol: 'COIN', inputAmount: request.amount });
                return [request.key, quote] as const;
              } catch {
                return [request.key, null] as const;
              }
            }));
            if (cancelled) return;
            setQuotes((current) => ({ ...current, ...Object.fromEntries(entries) }));
            setQuotedCount((current) => current + entries.length);
          }

          setQuotedCount(quoteRequests.length);
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [quoteRequests]);

  const advisorRows = useMemo<AdvisorRow[]>(() => {
    return options.map((option) => {
      const activeBoosts = option.factory.activeBoosts || [];
      const current = recipeProfitPerHour(option.currentRow, quotes, workshop, activeBoosts, proficiencies);
      const next = recipeProfitPerHour(option.nextRow, quotes, workshop, activeBoosts, proficiencies);
      const needToken = option.nextRow.upgrade_token;
      const needAmount = option.nextRow.upgrade_amount;
      const ownAmount = inventory[needToken] || 0;
      const gapAmount = Math.max(needAmount - ownAmount, 0);
      const buyQuote = gapAmount > 0 ? quotes[buyKey(needToken, gapAmount)] || null : null;
      const buyCost = gapAmount > 0 ? buyQuote?.input.amount ?? null : 0;
      const craft = craftCostForGap(producerRows.get(needToken) || null, gapAmount, quotes, proficiencies);
      const costs = [buyCost, craft.cost].filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
      const bestCost = gapAmount === 0 ? 0 : costs.length ? Math.min(...costs) : null;
      const bestChoice = gapAmount === 0 ? 'Ready' : craft.cost !== null && (buyCost === null || craft.cost < buyCost) ? 'Craft' : buyCost !== null ? 'Buy' : 'Waiting';
      const gainPerHour = next.value - current.value;
      const breakEvenHours = bestCost !== null && gainPerHour > 0 ? bestCost / gainPerHour : Number.POSITIVE_INFINITY;
      const impact = Math.max(current.impact, next.impact, buyQuote?.details?.priceImpactPercentage || 0, craft.impact);
      const ready = !current.missing && !next.missing && bestCost !== null;

      return {
        option,
        needToken,
        needAmount,
        ownAmount,
        gapAmount,
        buyCost,
        craftCost: craft.cost,
        bestCost,
        bestChoice,
        gainPerHour,
        currentProfitPerHour: current.value,
        nextProfitPerHour: next.value,
        workshopBoostPercent: getWorkshopSpeedBoostPercent(option.symbol, workshop),
        activeBoostPercent: getActiveFactoryBoostPercent(activeBoosts),
        currentMasteryText: masteryText(option.currentRow, proficiencies, language),
        nextMasteryText: masteryText(option.nextRow, proficiencies, language),
        breakEvenHours,
        impact,
        ready,
      };
    }).sort((a, b) => {
      if (a.ready !== b.ready) return a.ready ? -1 : 1;
      return a.breakEvenHours - b.breakEvenHours;
    });
  }, [inventory, options, producerRows, quotes, workshop, proficiencies]);

  const bestUpgrade = advisorRows.find((row) => row.ready && row.gainPerHour > 0) || null;

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Asesor de Mejoras' : 'Upgrade Advisor'}>
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {language === 'es'
                  ? 'Muestra el material necesario para la siguiente mejora, lo que ya posees, lo que te falta y si es más barato comprar o fabricar la cantidad faltante. Se incluye la velocidad del taller, aumentos activos y la maestría de recursos de fábrica.'
                  : 'This shows the material needed for the next upgrade, what you already own, what you are missing, and whether buying or crafting the missing amount is cheaper. Workshop speed, active boosts, and factory resource mastery are included.'}
              </p>
              {quoteLoading && (() => {
                const progressPercent = quoteRequests.length > 0 ? Math.round((quotedCount / quoteRequests.length) * 100) : 0;
                return (
                  <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/40 rounded-[12px] border-none space-y-4 my-4 z-10 relative">
                    <style>{`
                      @keyframes wave-stripes {
                        from { background-position: 40px 0; }
                        to { background-position: 0 0; }
                      }
                      .animate-wave-bar {
                        background-image: linear-gradient(
                          45deg,
                          rgba(255, 255, 255, 0.15) 25%,
                          transparent 25%,
                          transparent 50%,
                          rgba(255, 255, 255, 0.15) 50%,
                          rgba(255, 255, 255, 0.15) 75%,
                          transparent 75%,
                          transparent
                        );
                        background-size: 40px 40px;
                        animation: wave-stripes 1.2s linear infinite;
                      }
                    `}</style>
                    
                    <div className="text-center space-y-1">
                      <p className="text-sm font-black text-white uppercase tracking-wider">
                        {language === 'es' ? 'Cargando cotizaciones de mejoras...' : 'Loading upgrade quotes...'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'es' 
                          ? `Consultando cotizaciones en tiempo real: ${quotedCount} de ${quoteRequests.length}`
                          : `Fetching live quotes: ${quotedCount} of ${quoteRequests.length}`}
                      </p>
                    </div>

                    {/* Progress bar wrapper */}
                    <div className="w-full max-w-[400px] h-4 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          width: `${progressPercent}%`,
                          boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' 
                        }}
                      >
                        <div className="absolute inset-0 animate-wave-bar" />
                      </div>
                    </div>

                    {/* Percentage Indicator */}
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                      {progressPercent}%
                    </span>
                  </div>
                );
              })()}
              {error && <p className="text-sm text-red-300">{error}</p>}
              
              {bestUpgrade ? (
                <div 
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                    border: 'none'
                  }}
                  className="flex flex-col gap-4 relative overflow-hidden mt-4"
                >
                  {/* Status absolute badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${bestUpgrade.bestChoice === 'Ready' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {bestUpgrade.bestChoice === 'Ready' ? (language === 'es' ? 'Listo' : 'Ready') : formatBestChoice(bestUpgrade.bestChoice, language)}
                    </span>
                  </div>

                  {/* Header: Title + Image */}
                  <div className="flex items-center gap-4 border-b border-white/[0.03] pb-4">
                    <div 
                      className="w-16 h-16 bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0"
                      style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                    >
                      {getFactoryImage(bestUpgrade.option.symbol) ? (
                        <img 
                          src={getFactoryImage(bestUpgrade.option.symbol)} 
                          alt={bestUpgrade.option.symbol} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-xs font-black text-slate-500">{bestUpgrade.option.symbol.slice(0, 3)}</div>
                      )}
                    </div>
                    <div className="min-w-0 pr-24">
                      <span className="text-[10px] uppercase font-black text-orange-400 tracking-wider">
                        {language === 'es' ? 'Mejor candidato de mejora' : 'Best upgrade candidate'}
                      </span>
                      <h3 className="text-base font-black text-white truncate mt-0.5">
                        {rowLabel(bestUpgrade.option, language)}
                      </h3>
                    </div>
                  </div>

                  {/* Metrics sub-cards */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Taller / Boosts card */}
                    <div className="bg-white/[0.01] p-3 rounded-[12px] space-y-1.5 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{language === 'es' ? 'Información de Producción' : 'Production Info'}</span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Aumento velocidad taller:' : 'Workshop speed boost:'}</span>
                        <strong className="text-white">{fmt(bestUpgrade.workshopBoostPercent, 2)}%</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Boost activo:' : 'Active boost:'}</span>
                        <strong className="text-white">{fmt(bestUpgrade.activeBoostPercent, 2)}%</strong>
                      </div>
                    </div>

                    {/* Maestría card */}
                    <div className="bg-white/[0.01] p-3 rounded-[12px] space-y-1.5 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{language === 'es' ? 'Maestría' : 'Mastery'}</span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Receta actual:' : 'Current recipe:'}</span>
                        <strong className="text-white">{bestUpgrade.currentMasteryText}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Receta siguiente:' : 'Next recipe:'}</span>
                        <strong className="text-white">{bestUpgrade.nextMasteryText}</strong>
                      </div>
                    </div>

                    {/* Materiales card */}
                    <div className="bg-white/[0.01] p-3 rounded-[12px] space-y-1.5 flex flex-col justify-center sm:col-span-2">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{language === 'es' ? 'Materiales Necesarios' : 'Materials Needed'}</span>
                      <div className="grid gap-2 grid-cols-3 text-xs text-center">
                        <div className="bg-slate-900/40 p-2 rounded-[8px] flex flex-col items-center">
                          <span className="text-slate-400 text-[10px] mb-1">{language === 'es' ? 'Necesita' : 'Need'}</span>
                          <div className="flex items-center gap-1">
                            <strong className="text-white">{fmt(bestUpgrade.needAmount)}</strong>
                            {getResourceImage(bestUpgrade.needToken) && <img src={getResourceImage(bestUpgrade.needToken)} alt={bestUpgrade.needToken} className="h-4.5 w-4.5 object-contain" />}
                          </div>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-[8px] flex flex-col items-center">
                          <span className="text-slate-400 text-[10px] mb-1">{language === 'es' ? 'Tiene' : 'Own'}</span>
                          <div className="flex items-center gap-1">
                            <strong className="text-white">{fmt(bestUpgrade.ownAmount)}</strong>
                            {getResourceImage(bestUpgrade.needToken) && <img src={getResourceImage(bestUpgrade.needToken)} alt={bestUpgrade.needToken} className="h-4.5 w-4.5 object-contain" />}
                          </div>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded-[8px] flex flex-col items-center">
                          <span className="text-slate-400 text-[10px] mb-1">{language === 'es' ? 'Faltante' : 'Missing'}</span>
                          <div className="flex items-center gap-1">
                            <strong className="text-amber-450">{fmt(bestUpgrade.gapAmount)}</strong>
                            {getResourceImage(bestUpgrade.needToken) && <img src={getResourceImage(bestUpgrade.needToken)} alt={bestUpgrade.needToken} className="h-4.5 w-4.5 object-contain" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Costos card */}
                    <div className="bg-white/[0.01] p-3 rounded-[12px] space-y-1.5 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{language === 'es' ? 'Costos de Mejora' : 'Upgrade Costs'}</span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Costo compra:' : 'Buy cost:'}</span>
                        <strong className="text-white">
                          {bestUpgrade.buyCost === null ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(bestUpgrade.buyCost)} COIN`}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Costo fabricación:' : 'Craft cost:'}</span>
                        <strong className="text-white">
                          {bestUpgrade.craftCost === null ? (language === 'es' ? 'No disponible' : 'Not available') : `${fmt(bestUpgrade.craftCost)} COIN`}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.02]">
                        <span className="text-slate-400">{language === 'es' ? 'Mejor opción:' : 'Best choice:'}</span>
                        <strong className="text-emerald-400">{formatBestChoice(bestUpgrade.bestChoice, language)}</strong>
                      </div>
                    </div>

                    {/* Rendimiento card */}
                    <div className="bg-white/[0.01] p-3 rounded-[12px] space-y-1.5 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{language === 'es' ? 'Análisis de Rendimiento' : 'Performance Analysis'}</span>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Ganancia actual/hora:' : 'Current profit/hr:'}</span>
                        <strong className="text-white">{fmt(bestUpgrade.currentProfitPerHour)} COIN</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{language === 'es' ? 'Ganancia siguiente/hora:' : 'Next profit/hr:'}</span>
                        <strong className="text-white">{fmt(bestUpgrade.nextProfitPerHour)} COIN</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-white/[0.02]">
                        <span className="text-slate-400">{language === 'es' ? 'Tiempo de retorno:' : 'Break even:'}</span>
                        <strong className="text-amber-400">{fmtHours(bestUpgrade.breakEvenHours, language)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  {language === 'es' ? 'Ninguna recomendación de mejora está lista todavía.' : 'No upgrade recommendation is ready yet.'}
                </p>
              )}
            </div>
          </Card>
        </div>
                <div className="w-[95vw] max-w-[1800px] relative left-1/2 -translate-x-1/2">
          <Card title={language === 'es' ? 'Todos los Candidatos de Mejora' : 'All Upgrade Candidates'}>
            {advisorRows.length ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => { setViewMode('list'); localStorage.setItem('advisorViewMode', 'list'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                    style={{ border: 'none' }}
                  >
                    {language === 'es' ? 'Lista' : 'List'}
                  </button>
                  <button 
                    onClick={() => { setViewMode('grid'); localStorage.setItem('advisorViewMode', 'grid'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                    style={{ border: 'none' }}
                  >
                    {language === 'es' ? 'Tarjetas' : 'Cards'}
                  </button>
                </div>

                {viewMode === 'list' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1480px] text-left text-sm">
                      <thead className="text-slate-300">
                        <tr>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Rango' : 'Rank'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Taller' : 'Workshop'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Boost Activo' : 'Active Boost'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Maestría' : 'Mastery'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Necesita' : 'Need'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Tiene' : 'Own'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Faltante' : 'Missing'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Costo Compra' : 'Buy Cost'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Costo Fabr.' : 'Craft Cost'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Mejor Opción' : 'Best Choice'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia Act/Hr' : 'Current Profit/Hr'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia Sig/Hr' : 'Next Profit/Hr'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia/Hr' : 'Gain/Hr'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Retorno' : 'Break Even'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Impacto' : 'Impact'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estado' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {advisorRows.map((row, index) => {
                          const factImg = getFactoryImage(row.option.symbol);
                          const resImg = getResourceImage(row.needToken);
                          return (
                            <tr key={`${row.option.key}-${index}`} className="border-t border-slate-800">
                              <td className="p-2 whitespace-nowrap">{index + 1}</td>
                              <td className="p-2 font-semibold whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {factImg && (
                                    <img 
                                      src={factImg} 
                                      alt={row.option.symbol} 
                                      className="h-8 w-8 rounded-[var(--radius-resource-item)] bg-slate-900 object-contain p-0.5" 
                                    />
                                  )}
                                  <span>{rowLabel(row.option, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">{fmt(row.workshopBoostPercent, 2)}%</td>
                              <td className="p-2 whitespace-nowrap">{fmt(row.activeBoostPercent, 2)}%</td>
                              <td className="p-2 whitespace-nowrap">{row.currentMasteryText} → {row.nextMasteryText}</td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {resImg && (
                                    <img 
                                      src={resImg} 
                                      alt={row.needToken} 
                                      className="h-4 w-4 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }} 
                                    />
                                  )}
                                  <span>{fmt(row.needAmount)} {formatFactoryName(row.needToken, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {resImg && (
                                    <img 
                                      src={resImg} 
                                      alt={row.needToken} 
                                      className="h-4 w-4 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }} 
                                    />
                                  )}
                                  <span>{fmt(row.ownAmount)} {formatFactoryName(row.needToken, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {resImg && (
                                    <img 
                                      src={resImg} 
                                      alt={row.needToken} 
                                      className="h-4 w-4 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }} 
                                    />
                                  )}
                                  <span>{fmt(row.gapAmount)} {formatFactoryName(row.needToken, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.buyCost === null ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(row.buyCost)} COIN`}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.craftCost === null ? (language === 'es' ? 'No disponible' : 'Not available') : `${fmt(row.craftCost)} COIN`}
                              </td>
                              <td className="p-2 font-semibold whitespace-nowrap">
                                {formatBestChoice(row.bestChoice, language)}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.ready ? `${fmt(row.currentProfitPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.ready ? `${fmt(row.nextProfitPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </td>
                              <td className={`p-2 whitespace-nowrap ${row.gainPerHour >= 0 ? 'text-emerald-350 font-bold' : 'text-red-400 font-bold'}`}>
                                {row.ready ? `${fmt(row.gainPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.ready ? fmtHours(row.breakEvenHours, language) : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.ready ? `${fmt(row.impact, 2)}%` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {row.ready 
                                  ? row.gainPerHour > 0 
                                    ? (language === 'es' ? 'Candidato' : 'Candidate') 
                                    : (language === 'es' ? 'No vale la pena aún' : 'Not worth it yet') 
                                  : (language === 'es' ? 'Esperando cotizaciones' : 'Waiting for quotes')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                    {advisorRows.map((row, index) => {
                      const factImg = getFactoryImage(row.option.symbol);
                      const resImg = getResourceImage(row.needToken);
                      return (
                        <div 
                          key={`${row.option.key}-${index}`} 
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            padding: '16px',
                            border: 'none'
                          }}
                          className="flex flex-col gap-4 relative overflow-hidden"
                        >
                          {/* Rank indicator badge */}
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Header: Title + Image */}
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 bg-slate-900/60 flex items-center justify-center p-1 shrink-0"
                              style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                            >
                              {factImg ? (
                                <img 
                                  src={factImg} 
                                  alt={row.option.symbol} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-xs font-black text-slate-500">{row.option.symbol.slice(0, 3)}</div>
                              )}
                            </div>
                            <div className="min-w-0 pr-10">
                              <span className="text-[10px] uppercase font-black text-orange-400">
                                {rowLabel(row.option, language).split('•')[0]}
                              </span>
                              <h3 className="text-sm font-black text-white truncate mt-0.5">
                                {rowLabel(row.option, language).split('•').slice(1).join('•') || rowLabel(row.option, language)}
                              </h3>
                            </div>
                          </div>

                          {/* Details grid as badges */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.03] justify-center">
                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Taller:' : 'Workshop:'}</span>
                              <strong className="text-slate-200">{fmt(row.workshopBoostPercent, 2)}%</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Boost Activo:' : 'Active Boost:'}</span>
                              <strong className="text-slate-200">{fmt(row.activeBoostPercent, 2)}%</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Maestría:' : 'Mastery:'}</span>
                              <strong className="text-slate-200">{row.currentMasteryText} → {row.nextMasteryText}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Necesita:' : 'Need:'}</span>
                              {resImg && <img src={resImg} alt={row.needToken} className="h-4 w-4 object-contain shrink-0" />}
                              <strong className="text-slate-200">{fmt(row.needAmount)} {formatFactoryName(row.needToken, language)}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiene:' : 'Own:'}</span>
                              {resImg && <img src={resImg} alt={row.needToken} className="h-4 w-4 object-contain shrink-0" />}
                              <strong className="text-slate-200">{fmt(row.ownAmount)} {formatFactoryName(row.needToken, language)}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Faltante:' : 'Missing:'}</span>
                              {resImg && <img src={resImg} alt={row.needToken} className="h-4 w-4 object-contain shrink-0" />}
                              <strong className="text-amber-450">{fmt(row.gapAmount)} {formatFactoryName(row.needToken, language)}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Compra:' : 'Buy Cost:'}</span>
                              <strong className="text-slate-200">
                                {row.buyCost === null ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(row.buyCost)} COIN`}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Fabr.:' : 'Craft Cost:'}</span>
                              <strong className="text-slate-200">
                                {row.craftCost === null ? (language === 'es' ? 'No disponible' : 'Not available') : `${fmt(row.craftCost)} COIN`}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Mejor Opción:' : 'Best Option:'}</span>
                              <strong className="text-emerald-450">{formatBestChoice(row.bestChoice, language)}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia Act/Hr:' : 'Current Profit/Hr:'}</span>
                              <strong className="text-slate-200">
                                {row.ready ? `${fmt(row.currentProfitPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia Sig/Hr:' : 'Next Profit/Hr:'}</span>
                              <strong className="text-slate-200">
                                {row.ready ? `${fmt(row.nextProfitPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia/Hr:' : 'Gain/Hr:'}</span>
                              <strong className={`${row.gainPerHour >= 0 ? 'text-emerald-450' : 'text-red-400'}`}>
                                {row.ready ? `${fmt(row.gainPerHour)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Retorno:' : 'Break Even:'}</span>
                              <strong className="text-amber-450">
                                {row.ready ? fmtHours(row.breakEvenHours, language) : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Impacto:' : 'Impact:'}</span>
                              <strong className="text-slate-200">
                                {row.ready ? `${fmt(row.impact, 2)}%` : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Estado:' : 'Status:'}</span>
                              <span className={`font-bold ${row.ready ? 'text-emerald-450' : 'text-yellow-500 animate-pulse'}`}>
                                {row.ready 
                                  ? row.gainPerHour > 0 
                                    ? (language === 'es' ? 'Candidato' : 'Candidate') 
                                    : (language === 'es' ? 'No vale la pena' : 'Not worth it') 
                                  : (language === 'es' ? 'Esperando' : 'Waiting')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {language === 'es' ? 'No se encontraron candidatos de mejora todavía.' : 'No upgrade candidates were found yet.'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
