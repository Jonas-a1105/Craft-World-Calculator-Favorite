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
              {quoteLoading && (
                <p className="text-sm text-slate-400">
                  {language === 'es'
                    ? `Cargando precios... ${quotedCount}/${quoteRequests.length} cotizaciones comprobadas.`
                    : `Loading prices... ${quotedCount}/${quoteRequests.length} quotes checked.`}
                </p>
              )}
              {error && <p className="text-sm text-red-300">{error}</p>}
              
              {bestUpgrade ? (
                <div 
                  className="flex gap-4 items-start rounded-[var(--radius-resource-item)] bg-emerald-500/[0.08] p-4 text-sm"
                >
                  {getFactoryImage(bestUpgrade.option.symbol) && (
                    <img 
                      src={getFactoryImage(bestUpgrade.option.symbol)} 
                      alt={bestUpgrade.option.symbol} 
                      className="h-16 w-16 shrink-0 rounded-[var(--radius-resource-item)] bg-emerald-950/60 object-contain p-1" 
                    />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-200">
                      {language === 'es' ? 'Mejor candidato de mejora' : 'Best upgrade candidate'}
                    </p>
                    <p className="font-medium text-white">{rowLabel(bestUpgrade.option, language)}</p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Aumento velocidad taller' : 'Workshop speed boost'}:</span>{' '}
                      {fmt(bestUpgrade.workshopBoostPercent, 2)}%
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Boost activo' : 'Active boost'}:</span>{' '}
                      {fmt(bestUpgrade.activeBoostPercent, 2)}%
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Maestría receta actual' : 'Current recipe mastery'}:</span>{' '}
                      {bestUpgrade.currentMasteryText}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Maestría receta siguiente' : 'Next recipe mastery'}:</span>{' '}
                      {bestUpgrade.nextMasteryText}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Necesita' : 'Need'}:</span>{' '}
                      <span>{fmt(bestUpgrade.needAmount)}</span>
                      {getResourceImage(bestUpgrade.needToken) && (
                        <img 
                          src={getResourceImage(bestUpgrade.needToken)} 
                          alt={bestUpgrade.needToken} 
                          className="h-4 w-4 object-contain" 
                          style={{ borderRadius: 'var(--radius-resource-item)' }} 
                        />
                      )}
                      <span>{formatFactoryName(bestUpgrade.needToken, language)}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Tiene' : 'Own'}:</span>{' '}
                      <span>{fmt(bestUpgrade.ownAmount)}</span>
                      {getResourceImage(bestUpgrade.needToken) && (
                        <img 
                          src={getResourceImage(bestUpgrade.needToken)} 
                          alt={bestUpgrade.needToken} 
                          className="h-4 w-4 object-contain" 
                          style={{ borderRadius: 'var(--radius-resource-item)' }} 
                        />
                      )}
                      <span>{formatFactoryName(bestUpgrade.needToken, language)}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Faltante' : 'Missing'}:</span>{' '}
                      <span>{fmt(bestUpgrade.gapAmount)}</span>
                      {getResourceImage(bestUpgrade.needToken) && (
                        <img 
                          src={getResourceImage(bestUpgrade.needToken)} 
                          alt={bestUpgrade.needToken} 
                          className="h-4 w-4 object-contain" 
                          style={{ borderRadius: 'var(--radius-resource-item)' }} 
                        />
                      )}
                      <span>{formatFactoryName(bestUpgrade.needToken, language)}</span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Costo compra' : 'Buy cost'}:</span>{' '}
                      {bestUpgrade.buyCost === null ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(bestUpgrade.buyCost)} COIN`}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Costo fabricación' : 'Craft cost'}:</span>{' '}
                      {bestUpgrade.craftCost === null ? (language === 'es' ? 'No disponible' : 'Not available') : `${fmt(bestUpgrade.craftCost)} COIN`}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Mejor opción' : 'Best choice'}:</span>{' '}
                      <span className="font-semibold text-emerald-300">{formatBestChoice(bestUpgrade.bestChoice, language)}</span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia actual por hora' : 'Current profit per hour'}:</span>{' '}
                      {fmt(bestUpgrade.currentProfitPerHour)} COIN
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia siguiente por hora' : 'Next profit per hour'}:</span>{' '}
                      {fmt(bestUpgrade.nextProfitPerHour)} COIN
                    </p>
                    <p className="text-slate-300 font-semibold">
                      <span className="text-slate-400">{language === 'es' ? 'Tiempo de retorno' : 'Break even'}:</span>{' '}
                      {fmtHours(bestUpgrade.breakEvenHours, language)}
                    </p>
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
                        <tr key={row.option.key} className="border-t border-slate-800">
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
                          <td className={`p-2 whitespace-nowrap ${row.gainPerHour >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
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
