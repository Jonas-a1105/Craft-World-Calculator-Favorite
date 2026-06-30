import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { useTranslation } from '../utils/i18n';
import { SkeletonSingleColumn } from '../components/Skeleton';
import { getCraftworldBuyQuote, getCraftworldHome, getCraftworldQuote } from '../services/api';
import { getActiveFactoryBoostPercent, getRunsPerHourWithFactoryBoosts, type FactoryBoost } from '../services/factoryBoostModifiers';
import { loadFactoryData, type FactoryDataRow } from '../services/factoryData';
import { applyMasteryInputReduction, getMasteryInputReductionPercent, getMasteryLevel, type ProficiencyItem } from '../services/masteryModifiers';
import { applyWorkshopSpeedToDuration, getWorkshopSpeedBoostPercent, type WorkshopItem } from '../services/workshopModifiers';
import { formatDurationFromMinutes, getDurationMinutesFromRunsPerHour, getEffectiveSpeedPercent } from '../services/durationFormat';

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

type OwnedFactory = {
  id?: string;
  areaSymbol?: string;
  level?: number;
  landPlotName?: string;
  currentRunLevel?: number;
  activeBoosts?: FactoryBoost[];
};

type OwnedFactoryOption = {
  key: string;
  factory: OwnedFactory;
  symbol: string;
  displayLevel: number;
  nextDisplayLevel: number;
  craftDisplayLevel: number | null;
  plotName: string;
  matchingCsvRow: FactoryDataRow | null;
  nextCsvRow: FactoryDataRow | null;
};

type Quote = {
  type: string;
  input: { symbol: string; amount: number };
  output: { symbol: string; amount: number };
  details?: { priceImpactPercentage?: number };
};

type QuoteMap = Record<string, Quote | null>;

type QuoteRequest = {
  type: 'sell' | 'buy';
  symbol: string;
  amount: number;
  key: string;
};

type ProfitAdvisorRow = {
  option: OwnedFactoryOption;
  row: FactoryDataRow;
  outputValue: number;
  inputCost: number;
  profitPerRun: number;
  profitPerHour: number;
  runsPerHour: number;
  baseDurationMinutes: number;
  calculatedDurationMinutes: number;
  effectiveSpeedPercent: number;
  workshopBoostPercent: number;
  activeBoostPercent: number;
  masteryLevel: number;
  masteryReductionPercent: number;
  missingQuote: boolean;
  maxImpact: number;
};

const QUOTE_BATCH_SIZE = 12;

function formatNumber(value: number, digits = 6) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function formatSpeed(value: number) {
  return `${formatNumber(value, 2)}% / ${formatNumber(value / 100, 2)}x`;
}

function formatPlotName(plotName: string, lang: string): string {
  const normalized = String(plotName || '').trim().toUpperCase();
  if (lang === 'es') {
    switch (normalized) {
      case 'EARTH_PLOT': return 'Parcela de Tierra';
      case 'BLUEPRINT_PLOT':
      case 'BLUEPRINT_PLOT_A': return 'Parcela de Planos A';
      case 'BLUEPRINT_PLOT_B': return 'Parcela de Planos B';
      case 'FLEXIBLE_PLOT': return 'Parcela Flexible';
      default:
        return String(plotName || '')
          .trim()
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
    }
  } else {
    switch (normalized) {
      case 'EARTH_PLOT': return 'Earth Plot';
      case 'BLUEPRINT_PLOT':
      case 'BLUEPRINT_PLOT_A': return 'Blueprint Plot A';
      case 'BLUEPRINT_PLOT_B': return 'Blueprint Plot B';
      case 'FLEXIBLE_PLOT': return 'Flexible Plot';
      default:
        return String(plotName || '')
          .trim()
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
    }
  }
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

function formatFactoryLabel(option: OwnedFactoryOption, lang: string) {
  const craftLevel = option.craftDisplayLevel ? ` • Craft Lv ${option.craftDisplayLevel}` : '';
  return `${formatPlotName(option.plotName, lang)} • ${formatFactoryName(option.symbol, lang)} • Lv ${option.displayLevel}${craftLevel}`;
}

function normalizeQuoteAmount(amount: number) {
  return Number(amount.toFixed(8));
}

function sellQuoteKey(symbol: string, amount: number) {
  return `SELL-${symbol.toUpperCase()}-${normalizeQuoteAmount(amount)}`;
}

function buyQuoteKey(symbol: string, amount: number) {
  return `BUY-COIN-${symbol.toUpperCase()}-${normalizeQuoteAmount(amount)}`;
}

function getAdjustedInputAmount(factoryToken: string, amount: number, proficiencies: ProficiencyItem[]) {
  return normalizeQuoteAmount(applyMasteryInputReduction(amount, factoryToken, proficiencies));
}

function getRunsPerHourWithAllSpeed(row: FactoryDataRow, option: OwnedFactoryOption, workshop: WorkshopItem[]) {
  const workshopDuration = applyWorkshopSpeedToDuration(row.duration_min, row.token, workshop);
  return getRunsPerHourWithFactoryBoosts(workshopDuration, option.factory.activeBoosts || []);
}

function getRecipeQuoteRequests(row: FactoryDataRow, proficiencies: ProficiencyItem[]) {
  const input1Amount = getAdjustedInputAmount(row.token, row.input_amount_1, proficiencies);
  const requests: QuoteRequest[] = [
    { type: 'sell', symbol: row.output_token, amount: row.output_amount, key: sellQuoteKey(row.output_token, row.output_amount) },
    { type: 'buy', symbol: row.input_token_1, amount: input1Amount, key: buyQuoteKey(row.input_token_1, input1Amount) },
  ];

  if (row.input_token_2 && row.input_amount_2 > 0) {
    const input2Amount = getAdjustedInputAmount(row.token, row.input_amount_2, proficiencies);
    requests.push({ type: 'buy', symbol: row.input_token_2, amount: input2Amount, key: buyQuoteKey(row.input_token_2, input2Amount) });
  }

  return requests;
}

function getUpgradeBuyQuoteRequest(row: FactoryDataRow | null) {
  if (!row?.upgrade_token || row.upgrade_amount <= 0) return null;
  return {
    type: 'buy' as const,
    symbol: row.upgrade_token,
    amount: row.upgrade_amount,
    key: buyQuoteKey(row.upgrade_token, row.upgrade_amount),
  };
}

function QuoteLine({ label, quote }: { label: string; quote: Quote | null | undefined }) {
  const { language } = useTranslation();
  if (!quote) return <p>{label}: {language === 'es' ? 'Cotización no disponible' : 'Quote unavailable'}</p>;

  const inputImg = getResourceImage(quote.input.symbol);
  const outputImg = getResourceImage(quote.output.symbol);

  const inputName = quote.input.symbol === 'COIN' ? 'COIN' : formatFactoryName(quote.input.symbol, language);
  const outputName = quote.output.symbol === 'COIN' ? 'COIN' : formatFactoryName(quote.output.symbol, language);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span>{label}: {formatNumber(quote.input.amount)}</span>
      {inputImg && <img src={inputImg} alt={quote.input.symbol} className="h-4 w-4 object-contain inline" />}
      <span>{inputName} {language === 'es' ? 'por' : 'for'} {formatNumber(quote.output.amount)}</span>
      {outputImg && <img src={outputImg} alt={quote.output.symbol} className="h-4 w-4 object-contain inline" />}
      <span>{outputName} • {language === 'es' ? 'Impacto' : 'Impact'} {formatNumber(quote.details?.priceImpactPercentage || 0, 2)}%</span>
    </div>
  );
}

export default function Profitability() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [ownedFactories, setOwnedFactories] = useState<OwnedFactory[]>([]);
  const [workshop, setWorkshop] = useState<WorkshopItem[]>([]);
  const [proficiencies, setProficiencies] = useState<ProficiencyItem[]>([]);
  const [selectedFactoryKey, setSelectedFactoryKey] = useState('');
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quotedCount, setQuotedCount] = useState(0);
  const [error, setError] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => (localStorage.getItem('profitabilityViewMode') as 'list' | 'grid') || 'list');

  useEffect(() => {
    localStorage.setItem('profitabilityViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [factoryRows, homeData] = await Promise.all([loadFactoryData(), getCraftworldHome()]);
        setRows(factoryRows);
        setOwnedFactories(homeData.factories || []);
        setWorkshop(homeData.workshop || []);
        setProficiencies(homeData.proficiencies || []);
      } catch {
        setError('Unable to load profitability data. Refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const ownedFactoryOptions = useMemo<OwnedFactoryOption[]>(() => {
    return ownedFactories
      .map((factory, index) => {
        const symbol = String(factory.areaSymbol || '').trim().toUpperCase();
        const displayLevel = typeof factory.level === 'number' ? factory.level + 1 : 0;
        const nextDisplayLevel = displayLevel + 1;
        const craftDisplayLevel = typeof factory.currentRunLevel === 'number' ? factory.currentRunLevel + 1 : null;
        const plotName = factory.landPlotName || 'Unknown plot';
        const matchingCsvRow = rows.find((row) => row.token === symbol && row.level === displayLevel) || null;
        const nextCsvRow = rows.find((row) => row.token === symbol && row.level === nextDisplayLevel) || null;

        return {
          key: factory.id || `${plotName}-${symbol}-${displayLevel}-${index}`,
          factory,
          symbol,
          displayLevel,
          nextDisplayLevel,
          craftDisplayLevel,
          plotName,
          matchingCsvRow,
          nextCsvRow,
        };
      })
      .filter((option) => option.symbol)
      .sort((a, b) => {
        const plotSort = a.plotName.localeCompare(b.plotName);
        if (plotSort !== 0) return plotSort;
        const symbolSort = a.symbol.localeCompare(b.symbol);
        if (symbolSort !== 0) return symbolSort;
        return b.displayLevel - a.displayLevel;
      });
  }, [ownedFactories, rows]);

  const calculatorOptions = useMemo(() => {
    return ownedFactoryOptions.map((option) => ({
      value: option.key,
      label: `${formatFactoryLabel(option, language)}${option.matchingCsvRow ? '' : (language === 'es' ? ' • Sin coincidencia CSV' : ' • No CSV match')}`,
      image: getFactoryImage(option.symbol) || undefined
    }));
  }, [ownedFactoryOptions, language]);

  useEffect(() => {
    if (!ownedFactoryOptions.length) {
      setSelectedFactoryKey('');
      return;
    }

    const selectedStillExists = ownedFactoryOptions.some((option) => option.key === selectedFactoryKey);
    if (!selectedStillExists) setSelectedFactoryKey(ownedFactoryOptions[0].key);
  }, [ownedFactoryOptions, selectedFactoryKey]);

  const selectedFactory = useMemo(
    () => ownedFactoryOptions.find((option) => option.key === selectedFactoryKey) || null,
    [ownedFactoryOptions, selectedFactoryKey],
  );

  const selectedRow = selectedFactory?.matchingCsvRow || null;
  const selectedUpgradeRow = selectedFactory?.nextCsvRow || null;

  const quoteRequests = useMemo(() => {
    const byKey = new Map<string, QuoteRequest>();

    if (selectedRow) {
      getRecipeQuoteRequests(selectedRow, proficiencies).forEach((request) => byKey.set(request.key, request));
    }

    const selectedUpgradeRequest = getUpgradeBuyQuoteRequest(selectedUpgradeRow);
    if (selectedUpgradeRequest) byKey.set(selectedUpgradeRequest.key, selectedUpgradeRequest);

    ownedFactoryOptions.forEach((option) => {
      if (!option.matchingCsvRow) return;
      getRecipeQuoteRequests(option.matchingCsvRow, proficiencies).forEach((request) => {
        if (!byKey.has(request.key)) byKey.set(request.key, request);
      });
    });

    return Array.from(byKey.values());
  }, [ownedFactoryOptions, selectedRow, selectedUpgradeRow, proficiencies]);

  useEffect(() => {
    if (!quoteRequests.length) return;
    let cancelled = false;

    const loadQuotes = async () => {
      setQuoteLoading(true);
      setQuoteError('');
      setQuotedCount(0);

      try {
        const missingRequests = quoteRequests.filter((request) => quotes[request.key] === undefined);

        for (let index = 0; index < missingRequests.length; index += QUOTE_BATCH_SIZE) {
          const batch = missingRequests.slice(index, index + QUOTE_BATCH_SIZE);
          const entries = await Promise.all(
            batch.map(async (request) => {
              try {
                const quote = request.type === 'buy'
                  ? await getCraftworldBuyQuote({
                      inputSymbol: 'COIN',
                      outputSymbol: request.symbol,
                      outputAmount: request.amount,
                    })
                  : await getCraftworldQuote({
                      inputSymbol: request.symbol,
                      outputSymbol: 'COIN',
                      inputAmount: request.amount,
                    });
                return [request.key, quote] as const;
              } catch {
                return [request.key, null] as const;
              }
            }),
          );

          if (cancelled) return;
          setQuotes((current) => ({ ...current, ...Object.fromEntries(entries) }));
          setQuotedCount((current) => current + entries.length);
        }
      } catch {
        if (!cancelled) setQuoteError('Unable to load one or more Craft World quotes.');
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [quoteRequests]);

  const getSellQuote = (symbol: string, amount: number) => quotes[sellQuoteKey(symbol, amount)] || null;
  const getBuyQuote = (symbol: string, amount: number) => quotes[buyQuoteKey(symbol, amount)] || null;

  const advisorRows = useMemo<ProfitAdvisorRow[]>(() => {
    return ownedFactoryOptions
      .filter((option): option is OwnedFactoryOption & { matchingCsvRow: FactoryDataRow } => Boolean(option.matchingCsvRow))
      .map((option) => {
        const row = option.matchingCsvRow;
        const input1AdjustedAmount = getAdjustedInputAmount(row.token, row.input_amount_1, proficiencies);
        const input2AdjustedAmount = row.input_token_2 ? getAdjustedInputAmount(row.token, row.input_amount_2, proficiencies) : 0;
        const outputQuote = getSellQuote(row.output_token, row.output_amount);
        const input1Quote = getBuyQuote(row.input_token_1, input1AdjustedAmount);
        const input2Quote = row.input_token_2 ? getBuyQuote(row.input_token_2, input2AdjustedAmount) : null;
        const outputValue = outputQuote?.output.amount || 0;
        const inputCost = (input1Quote?.input.amount || 0) + (input2Quote?.input.amount || 0);
        const profitPerRun = outputValue - inputCost;
        const runsPerHour = getRunsPerHourWithAllSpeed(row, option, workshop);
        const baseDurationMinutes = row.duration_min;
        const calculatedDurationMinutes = getDurationMinutesFromRunsPerHour(runsPerHour);
        const effectiveSpeedPercent = getEffectiveSpeedPercent(baseDurationMinutes, calculatedDurationMinutes);
        const profitPerHour = profitPerRun * runsPerHour;
        const impacts = [outputQuote, input1Quote, input2Quote]
          .map((quote) => quote?.details?.priceImpactPercentage || 0)
          .filter((impact) => Number.isFinite(impact));

        return {
          option,
          row,
          outputValue,
          inputCost,
          profitPerRun,
          profitPerHour,
          runsPerHour,
          baseDurationMinutes,
          calculatedDurationMinutes,
          effectiveSpeedPercent,
          workshopBoostPercent: getWorkshopSpeedBoostPercent(row.token, workshop),
          activeBoostPercent: getActiveFactoryBoostPercent(option.factory.activeBoosts || []),
          masteryLevel: getMasteryLevel(row.token, proficiencies),
          masteryReductionPercent: getMasteryInputReductionPercent(row.token, proficiencies),
          missingQuote: !outputQuote || !input1Quote || Boolean(row.input_token_2 && !input2Quote),
          maxImpact: impacts.length ? Math.max(...impacts) : 0,
        };
      })
      .sort((a, b) => b.profitPerHour - a.profitPerHour);
  }, [ownedFactoryOptions, quotes, workshop, proficiencies]);

  const bestAdvisorRow = advisorRows.find((row) => !row.missingQuote) || null;
  const missingCsvMatches = ownedFactoryOptions.filter((option) => !option.matchingCsvRow).length;
  const readyAdvisorRows = advisorRows.filter((row) => !row.missingQuote);

  const totalCombinedProfitPerHour = useMemo(() => {
    return readyAdvisorRows.reduce((sum, row) => sum + (row.profitPerHour || 0), 0);
  }, [readyAdvisorRows]);

  const totalCombinedProfitPerDay = useMemo(() => {
    return totalCombinedProfitPerHour * 24;
  }, [totalCombinedProfitPerHour]);

  const selectedInput1AdjustedAmount = selectedRow ? getAdjustedInputAmount(selectedRow.token, selectedRow.input_amount_1, proficiencies) : 0;
  const selectedInput2AdjustedAmount = selectedRow?.input_token_2 ? getAdjustedInputAmount(selectedRow.token, selectedRow.input_amount_2, proficiencies) : 0;
  const outputQuote = selectedRow ? getSellQuote(selectedRow.output_token, selectedRow.output_amount) : null;
  const input1Quote = selectedRow ? getBuyQuote(selectedRow.input_token_1, selectedInput1AdjustedAmount) : null;
  const input2Quote = selectedRow?.input_token_2 ? getBuyQuote(selectedRow.input_token_2, selectedInput2AdjustedAmount) : null;
  const upgradeQuote = selectedUpgradeRow?.upgrade_token ? getBuyQuote(selectedUpgradeRow.upgrade_token, selectedUpgradeRow.upgrade_amount) : null;
  const selectedWorkshopBoostPercent = selectedRow ? getWorkshopSpeedBoostPercent(selectedRow.token, workshop) : 0;
  const selectedActiveBoostPercent = selectedFactory ? getActiveFactoryBoostPercent(selectedFactory.factory.activeBoosts || []) : 0;
  const selectedMasteryLevel = selectedRow ? getMasteryLevel(selectedRow.token, proficiencies) : 0;
  const selectedMasteryReductionPercent = selectedRow ? getMasteryInputReductionPercent(selectedRow.token, proficiencies) : 0;

  const inputCost = (input1Quote?.input.amount || 0) + (input2Quote?.input.amount || 0);
  const outputValue = outputQuote?.output.amount || 0;
  const profitPerRun = outputValue - inputCost;
  const runsPerHour = selectedRow && selectedFactory ? getRunsPerHourWithAllSpeed(selectedRow, selectedFactory, workshop) : 0;
  const profitPerHour = profitPerRun * runsPerHour;
  const selectedBaseDurationMinutes = selectedRow?.duration_min || 0;
  const selectedCalculatedDurationMinutes = getDurationMinutesFromRunsPerHour(runsPerHour);
  const selectedEffectiveSpeedPercent = getEffectiveSpeedPercent(selectedBaseDurationMinutes, selectedCalculatedDurationMinutes);
  const upgradeCost = upgradeQuote?.input.amount || 0;

  const progressPercent = quoteRequests.length > 0 ? Math.round((quotedCount / quoteRequests.length) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <SkeletonSingleColumn />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="max-w-[900px] mx-auto w-full">
          <Card title={language === 'es' ? 'Asesor de Rentabilidad' : 'Profit Advisor'}>
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Clasifica cada fábrica de tu propiedad que coincida con el CSV según la ganancia estimada en monedas (COIN) por hora usando cotizaciones en vivo del mercado para las salidas, cotizaciones de compra para los ingredientes, aumentos de velocidad del taller, boosts activos y reducciones por maestría de recursos.'
                  : 'This ranks every owned factory that matches the CSV by estimated COIN profit per hour using live Craft World sell quotes for outputs, buy quotes for inputs, workshop speed boosts, active boosts, and factory resource mastery input reductions.'}
              </p>
              {missingCsvMatches > 0 && (
                <p className="text-sm text-yellow-200">
                  {language === 'es'
                    ? `${missingCsvMatches} de tus fábricas no tienen coincidencias con el CSV todavía, por lo que están excluidas de la clasificación.`
                    : `${missingCsvMatches} owned factories do not have a CSV match yet, so they are excluded from the ranking.`}
                </p>
              )}
              
              {quoteLoading ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-955/40 rounded-[12px] border border-white/[0.03] space-y-4 my-4 z-10 relative">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-wider">
                      {language === 'es' ? 'Cargando cotizaciones de mercado...' : 'Loading market quotes...'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {language === 'es' 
                        ? `Consultando cotizaciones en tiempo real: ${quotedCount} de ${quoteRequests.length}`
                        : `Fetching live market quotes: ${quotedCount} of ${quoteRequests.length}`}
                    </p>
                  </div>

                  {/* Progress bar wrapper */}
                  <div className="w-full max-w-[400px] h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 relative"
                      style={{ 
                        width: `${progressPercent}%`,
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' 
                      }}
                    >
                      {/* Animated light reflection */}
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Percentage Indicator */}
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                    {progressPercent}%
                  </span>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 mt-3">
                {bestAdvisorRow ? (
                  <div 
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      border: 'none',
                      position: 'relative'
                    }}
                    className="flex flex-col gap-4 w-full md:w-1/2"
                  >
                    <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none rounded-[12px]" />

                    {/* Header: Title + Image + Main Profit Metric */}
                    <div className="flex items-center justify-between gap-4 z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-14 h-14 bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0"
                          style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                        >
                          {getFactoryImage(bestAdvisorRow.option.symbol) ? (
                            <img 
                              src={getFactoryImage(bestAdvisorRow.option.symbol)} 
                              alt={bestAdvisorRow.option.symbol} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `/assets/resources/${bestAdvisorRow.option.symbol.charAt(0).toUpperCase() + bestAdvisorRow.option.symbol.slice(1).toLowerCase()}.png`;
                              }}
                            />
                          ) : (
                            <div className="text-xs font-black text-slate-500">{bestAdvisorRow.option.symbol.slice(0, 3)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-400 font-black uppercase tracking-wider">
                            {language === 'es' ? 'Mejor opción' : 'Best visible craft'}
                          </span>
                          <h3 className="text-sm font-black text-white mt-1">
                            {formatFactoryLabel(bestAdvisorRow.option, language)}
                          </h3>
                        </div>
                      </div>

                      {/* Main Profit Metric Highlight */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                          {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                        </div>
                        <div className="text-sm font-black text-emerald-400 mt-0.5">
                          +{formatNumber(bestAdvisorRow.profitPerHour)} COIN
                        </div>
                      </div>
                    </div>

                    {/* Badges container */}
                    <div className="flex flex-wrap gap-2 justify-center z-10">
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Taller:' : 'Workshop:'}</span>
                        <strong className="text-slate-200">{formatNumber(bestAdvisorRow.workshopBoostPercent, 2)}%</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Boost Activo:' : 'Active Boost:'}</span>
                        <strong className="text-slate-200">{formatNumber(bestAdvisorRow.activeBoostPercent, 2)}%</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Base:' : 'Base Time:'}</span>
                        <strong className="text-slate-200">{formatDurationFromMinutes(bestAdvisorRow.baseDurationMinutes)}</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Final:' : 'Output Time:'}</span>
                        <strong className="text-slate-200">{formatDurationFromMinutes(bestAdvisorRow.calculatedDurationMinutes)}</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
                        <strong className="text-slate-200">{formatSpeed(bestAdvisorRow.effectiveSpeedPercent)}</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Maestría:' : 'Mastery:'}</span>
                        <strong className="text-slate-200">Lv {bestAdvisorRow.masteryLevel} / {formatNumber(bestAdvisorRow.masteryReductionPercent, 2)}%</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia / Día:' : 'Profit / Day:'}</span>
                        <strong className="text-emerald-450">{formatNumber(bestAdvisorRow.profitPerHour * 24)} COIN</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia / Ejec.:' : 'Profit / Run:'}</span>
                        <strong className="text-emerald-450">{formatNumber(bestAdvisorRow.profitPerRun)} COIN</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-slate-900/60 rounded-[12px] text-sm text-slate-400">
                    {language === 'es' ? 'Aún no hay recomendaciones de cotización disponibles.' : 'No fully quoted factory recommendation is available yet.'}
                  </div>
                )}

                {readyAdvisorRows.length > 0 ? (
                  <div 
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      border: 'none',
                      position: 'relative'
                    }}
                    className="flex flex-col gap-4 w-full md:w-1/2"
                  >
                    <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none rounded-[12px]" />

                    {/* Header: Title + Coin Image + Daily Combined Profit */}
                    <div className="flex items-center justify-between gap-4 z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900/60 p-2">
                          {getResourceImage("COIN") ? (
                            <img 
                              src={getResourceImage("COIN")} 
                              alt="COIN" 
                              className="h-full w-full object-contain" 
                            />
                          ) : (
                            <span className="text-xs text-slate-500 font-bold">C</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] bg-blue-500/10 px-2 py-0.5 rounded-full text-blue-400 font-black uppercase tracking-wider">
                            {language === 'es' ? 'Ganancia total del imperio' : 'Total Empire Earnings'}
                          </span>
                          <h3 className="text-sm font-black text-white mt-1">
                            {language === 'es' ? 'Todas las fábricas activas' : 'All active factories'}
                          </h3>
                        </div>
                      </div>

                      {/* Main Profit Metric Highlight */}
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                          {language === 'es' ? 'Combinado / Día' : 'Combined / Day'}
                        </div>
                        <div className={`text-base font-black ${totalCombinedProfitPerDay >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-0.5`}>
                          {formatNumber(totalCombinedProfitPerDay)} COIN
                        </div>
                      </div>
                    </div>

                    {/* Badges container */}
                    <div className="flex flex-wrap gap-2 justify-center z-10">
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Fábricas Consultadas:' : 'Checked Factories:'}</span>
                        <strong className="text-slate-200">{readyAdvisorRows.length}</strong>
                      </div>

                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Combinado / Hora:' : 'Combined / Hour:'}</span>
                        <strong className={totalCombinedProfitPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatNumber(totalCombinedProfitPerHour)} COIN</strong>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            </div>
          </Card>
        </div>

        {advisorRows.length > 0 && (
          <div className="w-[95vw] max-w-[1800px] relative left-1/2 -translate-x-1/2">
            <Card title={language === 'es' ? 'Clasificación de Fábricas Coincidentes' : 'All Matched Factories Ranked'}>
              <div className="flex justify-end mb-4 gap-2">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                  style={{ border: 'none' }}
                >
                  {language === 'es' ? 'Lista' : 'List'}
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                  style={{ border: 'none' }}
                >
                  {language === 'es' ? 'Tarjetas' : 'Cards'}
                </button>
              </div>

              {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1040px] text-left text-sm">
                    <thead className="text-slate-300">
                      <tr>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Rango' : 'Rank'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Taller' : 'Workshop'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Boost Activo' : 'Active Boost'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Maestría' : 'Mastery'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Tiempo Base' : 'Base Time'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Tiempo Final' : 'Output Time'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Velocidad Efectiva' : 'Effective Speed'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia por Hora' : 'Profit Per Hour'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia por Ejecución' : 'Profit Per Run'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Costo Compra' : 'Input Buy Cost'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Valor Venta' : 'Output Sell Value'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Impacto' : 'Impact'}</th>
                        <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estado' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(readyAdvisorRows.length ? readyAdvisorRows : advisorRows).map((advisorRow, index) => {
                        const factImg = getFactoryImage(advisorRow.option.symbol);
                        const resImg = getResourceImage(advisorRow.row.token);
                        return (
                          <tr key={advisorRow.option.key} className="border-t border-slate-800">
                            <td className="p-2 whitespace-nowrap">{index + 1}</td>
                            <td className="p-2 font-semibold whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {factImg && (
                                  <img 
                                    src={factImg} 
                                    alt={advisorRow.option.symbol} 
                                    className="h-8 w-8 shrink-0 bg-slate-900/60 object-contain p-0.5" 
                                    style={{ borderRadius: 'var(--radius-resource-item)' }}
                                  />
                                )}
                                <span>{formatFactoryLabel(advisorRow.option, language)}</span>
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">{formatNumber(advisorRow.workshopBoostPercent, 2)}%</td>
                            <td className="p-2 whitespace-nowrap">{formatNumber(advisorRow.activeBoostPercent, 2)}%</td>
                            <td className="p-2 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <span>Lv {advisorRow.masteryLevel} / {formatNumber(advisorRow.masteryReductionPercent, 2)}%</span>
                                {resImg && <img src={resImg} alt={advisorRow.row.token} className="h-4 w-4 object-contain" />}
                                <span>{formatFactoryName(advisorRow.row.token, language)}</span>
                              </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">{formatDurationFromMinutes(advisorRow.baseDurationMinutes)}</td>
                            <td className="p-2 whitespace-nowrap">{formatDurationFromMinutes(advisorRow.calculatedDurationMinutes)}</td>
                            <td className="p-2 whitespace-nowrap">{formatSpeed(advisorRow.effectiveSpeedPercent)}</td>
                            <td className={`p-2 whitespace-nowrap font-bold ${advisorRow.profitPerHour >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                              {advisorRow.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${formatNumber(advisorRow.profitPerHour)} COIN`}
                            </td>
                            <td className={`p-2 whitespace-nowrap font-bold ${advisorRow.profitPerRun >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                              {advisorRow.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${formatNumber(advisorRow.profitPerRun)} COIN`}
                            </td>
                            <td className="p-2 whitespace-nowrap">{advisorRow.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${formatNumber(advisorRow.inputCost)} COIN`}</td>
                            <td className="p-2 whitespace-nowrap">{advisorRow.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${formatNumber(advisorRow.outputValue)} COIN`}</td>
                            <td className="p-2 whitespace-nowrap">{advisorRow.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${formatNumber(advisorRow.maxImpact, 2)}%`}</td>
                            <td className="p-2 whitespace-nowrap">{advisorRow.missingQuote ? (language === 'es' ? 'Buscando cotización' : 'Waiting for quote') : (language === 'es' ? 'Listo' : 'Ready')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6 mt-2">
                  {(readyAdvisorRows.length ? readyAdvisorRows : advisorRows).map((advisorRow, index) => {
                    const factImg = getFactoryImage(advisorRow.option.symbol);
                    const resImg = getResourceImage(advisorRow.row.token);
                    return (
                      <div 
                        key={advisorRow.option.key}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius)',
                          padding: '16px',
                          border: 'none'
                        }}
                        className="flex flex-col gap-4 w-full max-w-[420px]"
                      >
                        {/* Header: Rank, Image, Factory info, and Main Profit Pill */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank & Factory Image container */}
                            <div className="relative shrink-0">
                              <div 
                                className="w-14 h-14 bg-slate-900/60 flex items-center justify-center p-1.5"
                                style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                              >
                                {factImg ? (
                                  <img 
                                    src={factImg} 
                                    alt={advisorRow.option.symbol} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `/assets/resources/${advisorRow.option.symbol.charAt(0).toUpperCase() + advisorRow.option.symbol.slice(1).toLowerCase()}.png`;
                                    }}
                                  />
                                ) : (
                                  <div className="text-xs font-black text-slate-500">{advisorRow.option.symbol.slice(0, 3)}</div>
                                )}
                              </div>
                              {/* Rank Badge */}
                              <div className="absolute -top-2 -left-2 bg-emerald-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                #{index + 1}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase font-black text-orange-400">
                                  {formatFactoryName(advisorRow.option.symbol, language)}
                                </span>
                                <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-350 font-bold">
                                  {language === 'es' ? `Nivel ${advisorRow.option.displayLevel}` : `Lv ${advisorRow.option.displayLevel}`}
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-white truncate mt-1">
                                {advisorRow.option.plotName || (language === 'es' ? 'Parcela desconocida' : 'Unknown plot')}
                              </h3>
                            </div>
                          </div>

                          {/* Profit Metric Highlight */}
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                              {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                            </div>
                            <div className={`text-sm font-black mt-0.5 ${advisorRow.profitPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Esperando' : 'Waiting') 
                                : `${advisorRow.profitPerHour >= 0 ? '+' : ''}${formatNumber(advisorRow.profitPerHour)} COIN`}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 ${advisorRow.missingQuote ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${advisorRow.missingQuote ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-400'}`}></span>
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Buscando cotiz.' : 'Waiting quote') 
                                : (language === 'es' ? 'Listo' : 'Ready')}
                            </div>
                          </div>
                        </div>

                        {/* Grid of details as badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Taller:' : 'Workshop:'}</span>
                            <strong className="text-slate-200">{formatNumber(advisorRow.workshopBoostPercent, 2)}%</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Boost Activo:' : 'Active Boost:'}</span>
                            <strong className="text-slate-200">{formatNumber(advisorRow.activeBoostPercent, 2)}%</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Maestría:' : 'Mastery:'}</span>
                            <strong className="text-slate-200">Lv {advisorRow.masteryLevel} / {formatNumber(advisorRow.masteryReductionPercent, 2)}%</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Base:' : 'Base Time:'}</span>
                            <strong className="text-slate-200">{formatDurationFromMinutes(advisorRow.baseDurationMinutes)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Final:' : 'Output Time:'}</span>
                            <strong className="text-slate-200">{formatDurationFromMinutes(advisorRow.calculatedDurationMinutes)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
                            <strong className="text-slate-200">{formatSpeed(advisorRow.effectiveSpeedPercent)}</strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia / Ejec.:' : 'Profit / Run:'}</span>
                            <strong className={advisorRow.profitPerRun >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Esperando' : 'Waiting') 
                                : `${formatNumber(advisorRow.profitPerRun)} COIN`}
                            </strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Compra:' : 'Input Cost:'}</span>
                            <strong className="text-red-400">
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Esperando' : 'Waiting') 
                                : `${formatNumber(advisorRow.inputCost)} COIN`}
                            </strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Valor Venta:' : 'Output Value:'}</span>
                            <strong className="text-slate-200">
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Esperando' : 'Waiting') 
                                : `${formatNumber(advisorRow.outputValue)} COIN`}
                            </strong>
                          </div>

                          <div 
                            className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                            style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                          >
                            <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Impacto:' : 'Impact:'}</span>
                            <strong className="text-slate-200">
                              {advisorRow.missingQuote 
                                ? (language === 'es' ? 'Esperando' : 'Waiting') 
                                : `${formatNumber(advisorRow.maxImpact, 2)}%`}
                            </strong>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="max-w-[900px] mx-auto w-full relative z-20">
          <Card 
            title={language === 'es' ? 'Calculadora de Rentabilidad' : 'Profitability Calculator'}
            style={{ overflow: 'visible' }}
          >
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {language === 'es'
                  ? 'Selecciona una de tus fábricas activas. La calculadora asocia el nivel de tu fábrica con los datos del archivo CSV cargado.'
                  : 'Select one of your live Craft World factories. The calculator matches your owned factory level to the uploaded factory CSV.'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'es'
                  ? 'El valor de salida utiliza la cotización de venta del recurso final a monedas. Los costos de entrada utilizan cotizaciones de compra de ingredientes, aplicándoles tu reducción por maestría de recursos.'
                  : 'Output value uses the sell quote: output resource to COIN. Input costs use buy quotes: COIN to the selected factory resource inputs after mastery reduction.'}
              </p>

              {!ownedFactoryOptions.length ? (
                <p className="text-sm text-slate-400">{language === 'es' ? 'Aún no se encontraron fábricas activas para esta cuenta.' : 'No live factories were found for this account yet.'}</p>
              ) : (
                <div className="space-y-1">
                  <span className="text-sm text-slate-300">{language === 'es' ? 'Tu Fábrica' : 'Your Factory'}</span>
                  <Dropdown
                    value={selectedFactoryKey}
                    onChange={(val) => setSelectedFactoryKey(String(val))}
                    options={calculatorOptions}
                    searchable={true}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {selectedFactory && !selectedRow && (
          <Card title="CSV Match Missing">
            <p className="text-sm text-yellow-200">
              No CSV row was found for {selectedFactory.symbol} level {selectedFactory.displayLevel}. The uploaded CSV may not include this factory level yet.
            </p>
          </Card>
        )}

        {selectedFactory && selectedRow && (
          <div className="max-w-[900px] mx-auto w-full space-y-4">
            <Card title={language === 'es' ? 'Fábrica Propia Seleccionada' : 'Selected Owned Factory'}>
              <div 
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  border: 'none'
                }}
                className="flex flex-col gap-4 w-full"
              >
                {/* Header: Plot, Name, level */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 bg-slate-900/60 flex items-center justify-center p-1.5 shrink-0"
                    style={{ borderRadius: 'var(--radius-resource-item)', border: 'none' }}
                  >
                    {getFactoryImage(selectedFactory.symbol) ? (
                      <img 
                        src={getFactoryImage(selectedFactory.symbol)} 
                        alt={selectedFactory.symbol} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/assets/resources/${selectedFactory.symbol.charAt(0).toUpperCase() + selectedFactory.symbol.slice(1).toLowerCase()}.png`;
                        }}
                      />
                    ) : (
                      <div className="text-xs font-black text-slate-500">{selectedFactory.symbol.slice(0, 3)}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-black text-orange-400">
                        {formatFactoryName(selectedFactory.symbol, language)}
                      </span>
                      <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-300 font-bold">
                        {language === 'es' ? `Nivel Propio ${selectedFactory.displayLevel}` : `Owned Lv ${selectedFactory.displayLevel}`}
                      </span>
                      <span className="text-[9px] bg-slate-900/80 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                        {language === 'es' ? `Nivel Fab. ${selectedFactory.craftDisplayLevel || 'N/A'}` : `Craft Lv ${selectedFactory.craftDisplayLevel || 'N/A'}`}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-white truncate mt-1">
                      {formatPlotName(selectedFactory.plotName, language)}
                    </h3>
                  </div>
                </div>

                {/* Subsections: Time & Speed Boosts */}
                <div className="space-y-3 pt-2 border-t border-white/[0.03]">
                  <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    {language === 'es' ? 'Tiempos y Rendimiento' : 'Times & Performance'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Taller:' : 'Workshop:'}</span>
                      <strong className="text-slate-200">{formatNumber(selectedWorkshopBoostPercent, 2)}%</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Boost Activo:' : 'Active Boost:'}</span>
                      <strong className="text-slate-200">{formatNumber(selectedActiveBoostPercent, 2)}%</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Original:' : 'Original:'}</span>
                      <strong className="text-slate-200">{formatNumber(selectedRow.duration_min, 2)} min</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Base:' : 'Base Time:'}</span>
                      <strong className="text-slate-200">{formatDurationFromMinutes(selectedBaseDurationMinutes)}</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Final:' : 'Output Time:'}</span>
                      <strong className="text-slate-200">{formatDurationFromMinutes(selectedCalculatedDurationMinutes)}</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
                      <strong className="text-slate-200">{formatSpeed(selectedEffectiveSpeedPercent)}</strong>
                    </div>
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Maestría:' : 'Mastery:'}</span>
                      <strong className="text-slate-200">Lv {selectedMasteryLevel} / {formatNumber(selectedMasteryReductionPercent, 2)}%</strong>
                    </div>
                  </div>
                </div>

                {/* Subsections: Inputs & Outputs */}
                <div className="space-y-3 pt-2 border-t border-white/[0.03]">
                  <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                    {language === 'es' ? 'Ingredientes y Producción' : 'Inputs & Output'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Output */}
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Salida:' : 'Output:'}</span>
                      <strong className="text-slate-200">{formatNumber(selectedRow.output_amount)}</strong>
                      {getResourceImage(selectedRow.output_token) && <img src={getResourceImage(selectedRow.output_token)} alt={selectedRow.output_token} className="h-4.5 w-4.5 object-contain shrink-0" />}
                      <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.output_token, language)}</span>
                    </div>

                    {/* Input 1 */}
                    <div 
                      className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                      style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                    >
                      <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ingrediente 1:' : 'Input 1:'}</span>
                      <strong className="text-slate-200">{formatNumber(selectedRow.input_amount_1)} → {formatNumber(selectedInput1AdjustedAmount)}</strong>
                      {getResourceImage(selectedRow.input_token_1) && <img src={getResourceImage(selectedRow.input_token_1)} alt={selectedRow.input_token_1} className="h-4.5 w-4.5 object-contain shrink-0" />}
                      <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.input_token_1, language)}</span>
                    </div>

                    {/* Input 2 */}
                    {selectedRow.input_token_2 && (
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ingrediente 2:' : 'Input 2:'}</span>
                        <strong className="text-slate-200">{formatNumber(selectedRow.input_amount_2)} → {formatNumber(selectedInput2AdjustedAmount)}</strong>
                        {getResourceImage(selectedRow.input_token_2) && <img src={getResourceImage(selectedRow.input_token_2)} alt={selectedRow.input_token_2} className="h-4.5 w-4.5 object-contain shrink-0" />}
                        <span className="text-slate-300 font-semibold">{formatFactoryName(selectedRow.input_token_2, language)}</span>
                      </div>
                    )}

                    {/* Upgrade Requires */}
                    {selectedUpgradeRow?.upgrade_token && (
                      <div 
                        className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                        style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                      >
                        <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Siguiente Nivel Mejora:' : 'Next Level Upgrade:'}</span>
                        <strong className="text-slate-200">{formatNumber(selectedUpgradeRow.upgrade_amount)}</strong>
                        {getResourceImage(selectedUpgradeRow.upgrade_token) && <img src={getResourceImage(selectedUpgradeRow.upgrade_token)} alt={selectedUpgradeRow.upgrade_token} className="h-4.5 w-4.5 object-contain shrink-0" />}
                        <span className="text-slate-300 font-semibold">{formatFactoryName(selectedUpgradeRow.upgrade_token, language)}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </Card>

            <Card title={language === 'es' ? 'Cotizaciones de Monedas en Vivo' : 'Live COIN Quotes'}>
              <div 
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  border: 'none'
                }}
                className="flex flex-col gap-3 w-full"
              >
                {quoteLoading && <p className="text-xs text-slate-400">{language === 'es' ? 'Cargando cotizaciones del mercado...' : 'Loading Craft World quotes...'}</p>}
                
                <div 
                  className="resource-item-badge text-xs text-white w-full"
                  style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '8px 12px' }}
                >
                  <QuoteLine label={language === 'es' ? 'Valor de Venta de Salida' : 'Output Sell Value'} quote={outputQuote} />
                </div>

                <div 
                  className="resource-item-badge text-xs text-white w-full"
                  style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '8px 12px' }}
                >
                  <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 1 tras Maestría' : 'Input 1 Buy Cost After Mastery'} quote={input1Quote} />
                </div>

                {selectedRow.input_token_2 && (
                  <div 
                    className="resource-item-badge text-xs text-white w-full"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '8px 12px' }}
                  >
                    <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 2 tras Maestría' : 'Input 2 Buy Cost After Mastery'} quote={input2Quote} />
                  </div>
                )}

                {selectedUpgradeRow?.upgrade_token && (
                  <div 
                    className="resource-item-badge text-xs text-white w-full"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '8px 12px' }}
                  >
                    <QuoteLine label={language === 'es' ? 'Costo Compra de Mejora' : 'Upgrade Buy Cost'} quote={upgradeQuote} />
                  </div>
                )}
              </div>
            </Card>

            <Card title={language === 'es' ? 'Resultados' : 'Results'}>
              <div 
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  border: 'none'
                }}
                className="flex flex-col gap-4 w-full"
              >
                {/* Highlight metric: Profit per Hour */}
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
                  <div>
                    <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {language === 'es' ? 'Ganancia por Hora' : 'Profit Per Hour'}
                    </h4>
                    <p className={`text-base font-black ${profitPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-1`}>
                      {profitPerHour >= 0 ? '+' : ''}{formatNumber(profitPerHour)} COIN
                    </p>
                  </div>

                  <div className="text-right">
                    <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      {language === 'es' ? 'Ganancia por Día' : 'Profit Per Day'}
                    </h4>
                    <p className={`text-base font-black ${profitPerHour >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-1`}>
                      {profitPerHour >= 0 ? '+' : ''}{formatNumber(profitPerHour * 24)} COIN
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Ingredientes:' : 'Input Cost:'}</span>
                    <strong className="text-red-400">{formatNumber(inputCost)} COIN</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Valor Salida:' : 'Output Value:'}</span>
                    <strong className="text-slate-200">{formatNumber(outputValue)} COIN</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia / Ejecución:' : 'Profit / Run:'}</span>
                    <strong className={profitPerRun >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatNumber(profitPerRun)} COIN</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ejecuciones / Hora:' : 'Runs / Hour:'}</span>
                    <strong className="text-slate-200">{formatNumber(runsPerHour, 4)}</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Base:' : 'Base Time:'}</span>
                    <strong className="text-slate-200">{formatDurationFromMinutes(selectedBaseDurationMinutes)}</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Tiempo Final:' : 'Output Time:'}</span>
                    <strong className="text-slate-200">{formatDurationFromMinutes(selectedCalculatedDurationMinutes)}</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
                    <strong className="text-slate-200">{formatSpeed(selectedEffectiveSpeedPercent)}</strong>
                  </div>

                  <div 
                    className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                    style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                  >
                    <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Mejora:' : 'Upgrade Buy Cost:'}</span>
                    <strong className="text-slate-200">{formatNumber(upgradeCost)} COIN</strong>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
