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
        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Asesor de Rentabilidad' : 'Profit Advisor'}>
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {language === 'es' 
                  ? 'Clasifica cada fábrica de tu propiedad que coincida con el CSV según la ganancia estimada en monedas (COIN) por hora usando cotizaciones en vivo del mercado para las salidas, cotizaciones de compra para los ingredientes, aumentos de velocidad del taller, boosts activos y reducciones por maestría de recursos.'
                  : 'This ranks every owned factory that matches the CSV by estimated COIN profit per hour using live Craft World sell quotes for outputs, buy quotes for inputs, workshop speed boosts, active boosts, and factory resource mastery input reductions.'}
              </p>
              {quoteLoading && (
                <p className="text-sm text-slate-400">
                  {language === 'es' 
                    ? `Cargando cotizaciones del mercado en lotes paralelos... ${quotedCount}/${quoteRequests.length} consultadas.`
                    : `Loading live quote data in parallel batches... ${quotedCount}/${quoteRequests.length} quotes checked.`}
                </p>
              )}
              {missingCsvMatches > 0 && (
                <p className="text-sm text-yellow-200">
                  {language === 'es'
                    ? `${missingCsvMatches} de tus fábricas no tienen coincidencias con el CSV todavía, por lo que están excluidas de la clasificación.`
                    : `${missingCsvMatches} owned factories do not have a CSV match yet, so they are excluded from the ranking.`}
                </p>
              )}
              {bestAdvisorRow ? (
                <div 
                  className="flex gap-4 items-start bg-emerald-500/[0.08] backdrop-blur-md p-4 text-sm"
                  style={{ borderRadius: 'var(--radius-resource-item)' }}
                >
                  {getFactoryImage(bestAdvisorRow.option.symbol) && (
                    <img 
                      src={getFactoryImage(bestAdvisorRow.option.symbol)} 
                      alt={bestAdvisorRow.option.symbol} 
                      className="h-16 w-16 shrink-0 bg-slate-900/60 object-contain p-1" 
                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                    />
                  )}
                  <div className="space-y-1.5 flex-grow">
                    <p className="font-semibold text-emerald-200">{language === 'es' ? 'Mejor fabricación visible ahora mismo' : 'Best visible craft right now'}</p>
                    <p className="font-bold text-white text-base">{formatFactoryLabel(bestAdvisorRow.option, language)}</p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Aumento de velocidad del taller' : 'Workshop speed boost'}:</span>{' '}
                      <strong>{formatNumber(bestAdvisorRow.workshopBoostPercent, 2)}%</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Boost activo' : 'Active boost'}:</span>{' '}
                      <strong>{formatNumber(bestAdvisorRow.activeBoostPercent, 2)}%</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Tiempo base' : 'Base Time'}:</span>{' '}
                      <strong>{formatDurationFromMinutes(bestAdvisorRow.baseDurationMinutes)}</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Tiempo final' : 'Output Time'}:</span>{' '}
                      <strong>{formatDurationFromMinutes(bestAdvisorRow.calculatedDurationMinutes)}</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Velocidad efectiva' : 'Effective Speed'}:</span>{' '}
                      <strong>{formatSpeed(bestAdvisorRow.effectiveSpeedPercent)}</strong>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Maestría' : 'Mastery'}:</span>{' '}
                      <span>Lv {bestAdvisorRow.masteryLevel} / {formatNumber(bestAdvisorRow.masteryReductionPercent, 2)}%</span>
                      {getResourceImage(bestAdvisorRow.row.token) && <img src={getResourceImage(bestAdvisorRow.row.token)} alt={bestAdvisorRow.row.token} className="h-4 w-4 object-contain shrink-0" />}
                      <strong>{formatFactoryName(bestAdvisorRow.row.token, language)}</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia estimada por hora' : 'Estimated profit per hour'}:</span>{' '}
                      <strong className="text-emerald-400">{formatNumber(bestAdvisorRow.profitPerHour)} COIN</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia estimada por día' : 'Estimated profit per day'}:</span>{' '}
                      <strong className="text-emerald-400">{formatNumber(bestAdvisorRow.profitPerHour * 24)} COIN</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia estimada por ejecución' : 'Estimated profit per run'}:</span>{' '}
                      <strong className="text-emerald-400">{formatNumber(bestAdvisorRow.profitPerRun)} COIN</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">{language === 'es' ? 'Aún no hay recomendaciones de cotización disponibles.' : 'No fully quoted factory recommendation is available yet.'}</p>
              )}

              {readyAdvisorRows.length > 0 && (
                <div 
                  className="flex gap-4 items-start bg-blue-500/[0.08] backdrop-blur-md p-4 text-sm mt-3"
                  style={{ borderRadius: 'var(--radius-resource-item)' }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10 p-2">
                    {getResourceImage("COIN") && (
                      <img 
                        src={getResourceImage("COIN")} 
                        alt="COIN" 
                        className="h-full w-full object-contain" 
                      />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <p className="font-semibold text-blue-200">
                      {language === 'es' ? 'Ganancia total del imperio (Todas las fábricas)' : 'Total Empire Earnings (All active factories)'}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Fábricas consultadas' : 'Checked factories'}:</span>{' '}
                      <strong>{readyAdvisorRows.length}</strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia total combinada por hora' : 'Total combined profit per hour'}:</span>{' '}
                      <strong className={totalCombinedProfitPerHour >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {formatNumber(totalCombinedProfitPerHour)} COIN
                      </strong>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">{language === 'es' ? 'Ganancia total combinada por día' : 'Total combined profit per day'}:</span>{' '}
                      <strong className={totalCombinedProfitPerDay >= 0 ? 'text-emerald-400 font-extrabold text-base' : 'text-red-400 font-extrabold text-base'}>
                        {formatNumber(totalCombinedProfitPerDay)} COIN
                      </strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {advisorRows.length > 0 && (
          <div className="w-[95vw] max-w-[1800px] relative left-1/2 -translate-x-1/2">
            <Card title={language === 'es' ? 'Clasificación de Fábricas Coincidentes' : 'All Matched Factories Ranked'}>
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
          </Card>
          </div>
        )}

        <div className="max-w-[720px] mx-auto w-full relative z-20">
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
          <div className="max-w-[720px] mx-auto w-full space-y-4">
            <Card title={language === 'es' ? 'Fábrica Propia Seleccionada' : 'Selected Owned Factory'}>
              <div className="flex gap-4 items-start text-sm">
                {getFactoryImage(selectedFactory.symbol) && (
                  <img 
                    src={getFactoryImage(selectedFactory.symbol)} 
                    alt={selectedFactory.symbol} 
                    className="h-16 w-16 shrink-0 bg-slate-900/60 object-contain p-1" 
                    style={{ borderRadius: 'var(--radius-resource-item)' }} 
                  />
                )}
                <div className="grid gap-2 text-sm md:grid-cols-2 flex-grow">
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Parcela' : 'Plot'}:</span> <strong>{formatPlotName(selectedFactory.plotName, language)}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Fábrica' : 'Factory'}:</span> <strong>{formatFactoryName(selectedFactory.symbol, language)}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Nivel de propiedad' : 'Owned Display Level'}:</span> <strong>{selectedFactory.displayLevel}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Siguiente nivel' : 'Next Display Level'}:</span> <strong>{selectedFactory.nextDisplayLevel}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Nivel de fabricación' : 'Craft Level'}:</span> <strong>{selectedFactory.craftDisplayLevel || 'N/A'}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Nivel CSV' : 'CSV Level'}:</span> <strong>{selectedRow.level}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Duración original' : 'Original Duration'}:</span> <strong>{formatNumber(selectedRow.duration_min, 2)} min</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Tiempo base' : 'Base Time'}:</span> <strong>{formatDurationFromMinutes(selectedBaseDurationMinutes)}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Tiempo final' : 'Output Time'}:</span> <strong>{formatDurationFromMinutes(selectedCalculatedDurationMinutes)}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Velocidad efectiva' : 'Effective Speed'}:</span> <strong>{formatSpeed(selectedEffectiveSpeedPercent)}</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Velocidad taller' : 'Workshop Speed Boost'}:</span> <strong>{formatNumber(selectedWorkshopBoostPercent, 2)}%</strong></p>
                  <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Boost activo' : 'Active Boost'}:</span> <strong>{formatNumber(selectedActiveBoostPercent, 2)}%</strong></p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">{language === 'es' ? 'Maestría' : 'Mastery'}:</span>{' '}
                    <span>Lv {selectedMasteryLevel} / {formatNumber(selectedMasteryReductionPercent, 2)}%</span>
                    {getResourceImage(selectedRow.token) && <img src={getResourceImage(selectedRow.token)} alt={selectedRow.token} className="h-4 w-4 object-contain shrink-0" />}
                    <strong>{formatFactoryName(selectedRow.token, language)}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">{language === 'es' ? 'Salida' : 'Output'}:</span>{' '}
                    <strong>{formatNumber(selectedRow.output_amount)}</strong>
                    {getResourceImage(selectedRow.output_token) && <img src={getResourceImage(selectedRow.output_token)} alt={selectedRow.output_token} className="h-4 w-4 object-contain shrink-0" />}
                    <strong>{formatFactoryName(selectedRow.output_token, language)}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">{language === 'es' ? 'Ingrediente 1' : 'Input 1'}:</span>{' '}
                    <strong>{formatNumber(selectedRow.input_amount_1)} → {formatNumber(selectedInput1AdjustedAmount)}</strong>
                    {getResourceImage(selectedRow.input_token_1) && <img src={getResourceImage(selectedRow.input_token_1)} alt={selectedRow.input_token_1} className="h-4 w-4 object-contain shrink-0" />}
                    <strong>{formatFactoryName(selectedRow.input_token_1, language)}</strong>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-slate-400">{language === 'es' ? 'Ingrediente 2' : 'Input 2'}:</span>{' '}
                    {selectedRow.input_token_2 ? (
                      <>
                        <strong>{formatNumber(selectedRow.input_amount_2)} → {formatNumber(selectedInput2AdjustedAmount)}</strong>
                        {getResourceImage(selectedRow.input_token_2) && <img src={getResourceImage(selectedRow.input_token_2)} alt={selectedRow.input_token_2} className="h-4 w-4 object-contain shrink-0" />}
                        <strong>{formatFactoryName(selectedRow.input_token_2, language)}</strong>
                      </>
                    ) : 'N/A'}
                  </p>
                  <p className="flex items-center gap-1.5 md:col-span-2 text-slate-300">
                    <span className="text-slate-400">{language === 'es' ? 'Mejora requiere' : 'Upgrade Requires'}:</span>{' '}
                    {selectedUpgradeRow?.upgrade_token ? (
                      <>
                        <strong>{formatNumber(selectedUpgradeRow.upgrade_amount)}</strong>
                        {getResourceImage(selectedUpgradeRow.upgrade_token) && <img src={getResourceImage(selectedUpgradeRow.upgrade_token)} alt={selectedUpgradeRow.upgrade_token} className="h-4 w-4 object-contain shrink-0" />}
                        <strong>{formatFactoryName(selectedUpgradeRow.upgrade_token, language)}</strong>
                      </>
                    ) : 'No next CSV row'}
                  </p>
                </div>
              </div>
            </Card>

            <Card title={language === 'es' ? 'Cotizaciones de Monedas en Vivo' : 'Live COIN Quotes'}>
              <div className="space-y-2 text-sm">
                {quoteLoading && <p className="text-slate-400">{language === 'es' ? 'Cargando cotizaciones del mercado...' : 'Loading Craft World quotes...'}</p>}
                <QuoteLine label={language === 'es' ? 'Valor de Venta de Salida' : 'Output Sell Value'} quote={outputQuote} />
                <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 1 tras Maestría' : 'Input 1 Buy Cost After Mastery'} quote={input1Quote} />
                {selectedRow.input_token_2 && <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 2 tras Maestría' : 'Input 2 Buy Cost After Mastery'} quote={input2Quote} />}
                {selectedUpgradeRow?.upgrade_token && <QuoteLine label={language === 'es' ? 'Costo Compra de Mejora' : 'Upgrade Buy Cost'} quote={upgradeQuote} />}
              </div>
            </Card>

            <Card title={language === 'es' ? 'Resultados' : 'Results'}>
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Costo Compra Ingredientes tras Maestría' : 'Input Buy Cost After Mastery'}:</span> <strong>{formatNumber(inputCost)} COIN</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Valor Venta de Salida' : 'Output Sell Value'}:</span> <strong>{formatNumber(outputValue)} COIN</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Ganancia por Ejecución' : 'Profit Per Run'}:</span> <strong className={profitPerRun >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatNumber(profitPerRun)} COIN</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Ganancia por Hora' : 'Profit Per Hour'}:</span> <strong className={profitPerHour >= 0 ? 'text-emerald-400 font-bold text-base' : 'text-red-400 font-bold text-base'}>{formatNumber(profitPerHour)} COIN</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Ganancia por Día' : 'Profit Per Day'}:</span> <strong className={profitPerHour >= 0 ? 'text-emerald-400 font-extrabold text-base' : 'text-red-400 font-extrabold text-base'}>{formatNumber(profitPerHour * 24)} COIN</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Ejecuciones por Hora' : 'Runs Per Hour'}:</span> <strong>{formatNumber(runsPerHour, 4)}</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Tiempo base' : 'Base Time'}:</span> <strong>{formatDurationFromMinutes(selectedBaseDurationMinutes)}</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Tiempo final' : 'Output Time'}:</span> <strong>{formatDurationFromMinutes(selectedCalculatedDurationMinutes)}</strong></p>
                <p className="text-slate-300"><span className="text-slate-400">{language === 'es' ? 'Velocidad efectiva' : 'Effective Speed'}:</span> <strong>{formatSpeed(selectedEffectiveSpeedPercent)}</strong></p>
                <p className="text-slate-300 md:col-span-2"><span className="text-slate-400">{language === 'es' ? 'Costo Compra de Mejora' : 'Upgrade Buy Cost'}:</span> <strong>{formatNumber(upgradeCost)} COIN</strong></p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
