import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { useTranslation } from '../utils/i18n';
import { SkeletonSingleColumn } from '../components/Skeleton';
import { getCraftworldBuyQuote, getCraftworldQuote } from '../services/api';
import { loadFactoryData, type FactoryDataRow } from '../services/factoryData';

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

type RecipePnl = {
  row: FactoryDataRow | null;
  outputValue: number;
  inputCost: number;
  profitPerRun: number;
  runsPerHour: number;
  profitPerHour: number;
  missingQuote: boolean;
  maxImpact: number;
};

type UpgradeStep = {
  fromLevel: number;
  toLevel: number;
  token: string;
  amountPerFactory: number;
  totalAmount: number;
  quote: Quote | null;
  cost: number;
  impact: number;
  missingQuote: boolean;
};

const BATCH_SIZE = 12;

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

function fmt(value: number, digits = 6) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
}

function normalizeAmount(amount: number) {
  return Number(amount.toFixed(8));
}

function sellKey(symbol: string, amount: number) {
  return `SELL:${symbol.toUpperCase()}:${normalizeAmount(amount)}`;
}

function buyKey(symbol: string, amount: number) {
  return `BUY:COIN:${symbol.toUpperCase()}:${normalizeAmount(amount)}`;
}

function numberInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLevels(rows: FactoryDataRow[], token: string) {
  return rows
    .filter((row) => row.token === token)
    .map((row) => row.level)
    .filter((level, index, levels) => levels.indexOf(level) === index)
    .sort((a, b) => a - b);
}

function getRow(rows: FactoryDataRow[], token: string, level: number) {
  return rows.find((row) => row.token === token && row.level === level) || null;
}

function getRecipeRequests(row: FactoryDataRow | null) {
  if (!row) return [] as QuoteRequest[];

  const requests: QuoteRequest[] = [
    { type: 'sell', symbol: row.output_token, amount: row.output_amount, key: sellKey(row.output_token, row.output_amount) },
  ];

  if (row.input_token_1 && row.input_amount_1 > 0) {
    requests.push({ type: 'buy', symbol: row.input_token_1, amount: row.input_amount_1, key: buyKey(row.input_token_1, row.input_amount_1) });
  }

  if (row.input_token_2 && row.input_amount_2 > 0) {
    requests.push({ type: 'buy', symbol: row.input_token_2, amount: row.input_amount_2, key: buyKey(row.input_token_2, row.input_amount_2) });
  }

  return requests;
}

function getUpgradeRows(rows: FactoryDataRow[], token: string, currentLevel: number, targetLevel: number, factoryCount: number) {
  const steps: Array<{ fromLevel: number; toLevel: number; row: FactoryDataRow; totalAmount: number }> = [];

  for (let level = currentLevel + 1; level <= targetLevel; level += 1) {
    const row = getRow(rows, token, level);
    if (!row || !row.upgrade_token || row.upgrade_amount <= 0) continue;
    steps.push({
      fromLevel: level - 1,
      toLevel: level,
      row,
      totalAmount: normalizeAmount(row.upgrade_amount * factoryCount),
    });
  }

  return steps;
}

function calculateRecipePnl(row: FactoryDataRow | null, quotes: QuoteMap): RecipePnl {
  if (!row) {
    return {
      row: null,
      outputValue: 0,
      inputCost: 0,
      profitPerRun: 0,
      runsPerHour: 0,
      profitPerHour: 0,
      missingQuote: true,
      maxImpact: 0,
    };
  }

  const outputQuote = quotes[sellKey(row.output_token, row.output_amount)] || null;
  const input1Quote = row.input_token_1 && row.input_amount_1 > 0 ? quotes[buyKey(row.input_token_1, row.input_amount_1)] || null : null;
  const input2Quote = row.input_token_2 && row.input_amount_2 > 0 ? quotes[buyKey(row.input_token_2, row.input_amount_2)] || null : null;
  const missingQuote = !outputQuote || Boolean(row.input_token_1 && row.input_amount_1 > 0 && !input1Quote) || Boolean(row.input_token_2 && row.input_amount_2 > 0 && !input2Quote);
  const outputValue = outputQuote?.output.amount || 0;
  const inputCost = (input1Quote?.input.amount || 0) + (input2Quote?.input.amount || 0);
  const profitPerRun = outputValue - inputCost;
  const runsPerHour = row.duration_min > 0 ? 60 / row.duration_min : 0;
  const profitPerHour = profitPerRun * runsPerHour;
  const maxImpact = Math.max(
    outputQuote?.details?.priceImpactPercentage || 0,
    input1Quote?.details?.priceImpactPercentage || 0,
    input2Quote?.details?.priceImpactPercentage || 0,
  );

  return { row, outputValue, inputCost, profitPerRun, runsPerHour, profitPerHour, missingQuote, maxImpact };
}

function QuoteLine({ label, quote }: { label: string; quote: Quote | null | undefined }) {
  const { language } = useTranslation();
  if (!quote) return <p>{label}: {language === 'es' ? 'Buscando cotización' : 'Waiting for quote'}</p>;

  const inputImg = getResourceImage(quote.input.symbol);
  const outputImg = getResourceImage(quote.output.symbol);

  const inputName = quote.input.symbol === 'COIN' ? 'COIN' : formatFactoryName(quote.input.symbol, language);
  const outputName = quote.output.symbol === 'COIN' ? 'COIN' : formatFactoryName(quote.output.symbol, language);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span>{label}: {fmt(quote.input.amount)}</span>
      {inputImg && <img src={inputImg} alt={quote.input.symbol} className="h-4 w-4 object-contain inline" />}
      <span>{inputName} {language === 'es' ? 'por' : 'for'} {fmt(quote.output.amount)}</span>
      {outputImg && <img src={outputImg} alt={quote.output.symbol} className="h-4 w-4 object-contain inline" />}
      <span>{outputName} • {language === 'es' ? 'Impacto' : 'Impact'} {fmt(quote.details?.priceImpactPercentage || 0, 2)}%</span>
    </div>
  );
}

export default function Calculator() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [factoryType, setFactoryType] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetLevel, setTargetLevel] = useState(2);
  const [factoryCount, setFactoryCount] = useState(1);
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
        const factoryRows = await loadFactoryData();
        setRows(factoryRows);
        const tokens = Array.from(new Set(factoryRows.map((row) => row.token).filter(Boolean))).sort();
        const firstToken = tokens[0] || '';
        setFactoryType(firstToken);
        const levels = getLevels(factoryRows, firstToken);
        setCurrentLevel(levels[0] || 1);
        setTargetLevel(levels[1] || levels[0] || 1);
      } catch {
        setError('Unable to load calculator data. Refresh and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const factoryTypes = useMemo(() => Array.from(new Set(rows.map((row) => row.token).filter(Boolean))).sort(), [rows]);
  const levels = useMemo(() => getLevels(rows, factoryType), [rows, factoryType]);
  const currentRow = useMemo(() => getRow(rows, factoryType, currentLevel), [rows, factoryType, currentLevel]);
  const targetRow = useMemo(() => getRow(rows, factoryType, targetLevel), [rows, factoryType, targetLevel]);
  const upgradeRows = useMemo(() => getUpgradeRows(rows, factoryType, currentLevel, targetLevel, factoryCount), [rows, factoryType, currentLevel, targetLevel, factoryCount]);

  const factoryTypeOptions = useMemo(() => {
    return factoryTypes.map((token) => ({
      value: token,
      label: formatFactoryName(token, language),
      image: getFactoryImage(token) || undefined
    }));
  }, [factoryTypes, language]);

  const currentLevelOptions = useMemo(() => {
    return levels.map((level) => ({
      value: level,
      label: `${language === 'es' ? 'Nivel' : 'Level'} ${level}`,
    }));
  }, [levels, language]);

  const targetLevelOptions = useMemo(() => {
    return levels
      .filter((level) => level >= currentLevel)
      .map((level) => ({
        value: level,
        label: `${language === 'es' ? 'Nivel' : 'Level'} ${level}`,
      }));
  }, [levels, currentLevel, language]);

  useEffect(() => {
    if (!factoryType || !levels.length) return;
    if (!levels.includes(currentLevel)) setCurrentLevel(levels[0]);
    if (!levels.includes(targetLevel) || targetLevel <= currentLevel) {
      const nextLevel = levels.find((level) => level > currentLevel) || currentLevel;
      setTargetLevel(nextLevel);
    }
  }, [factoryType, levels, currentLevel, targetLevel]);

  const quoteRequests = useMemo(() => {
    const map = new Map<string, QuoteRequest>();

    [...getRecipeRequests(currentRow), ...getRecipeRequests(targetRow)].forEach((request) => map.set(request.key, request));
    upgradeRows.forEach((step) => {
      map.set(buyKey(step.row.upgrade_token, step.totalAmount), {
        type: 'buy',
        symbol: step.row.upgrade_token,
        amount: step.totalAmount,
        key: buyKey(step.row.upgrade_token, step.totalAmount),
      });
    });

    return Array.from(map.values());
  }, [currentRow, targetRow, upgradeRows]);

  useEffect(() => {
    if (!quoteRequests.length) return;
    let cancelled = false;

    const loadQuotes = async () => {
      setQuoteLoading(true);
      setQuotedCount(0);
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

      if (!cancelled) setQuoteLoading(false);
    };

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [quoteRequests]);

  const currentPnl = useMemo(() => calculateRecipePnl(currentRow, quotes), [currentRow, quotes]);
  const targetPnl = useMemo(() => calculateRecipePnl(targetRow, quotes), [targetRow, quotes]);

  const upgradeSteps = useMemo<UpgradeStep[]>(() => upgradeRows.map((step) => {
    const quote = quotes[buyKey(step.row.upgrade_token, step.totalAmount)] || null;
    return {
      fromLevel: step.fromLevel,
      toLevel: step.toLevel,
      token: step.row.upgrade_token,
      amountPerFactory: step.row.upgrade_amount,
      totalAmount: step.totalAmount,
      quote,
      cost: quote?.input.amount || 0,
      impact: quote?.details?.priceImpactPercentage || 0,
      missingQuote: !quote,
    };
  }), [quotes, upgradeRows]);

  const totalUpgradeCost = upgradeSteps.reduce((total, step) => total + step.cost, 0);
  const totalUpgradeMissing = upgradeSteps.some((step) => step.missingQuote);
  const currentTotalProfitPerHour = currentPnl.profitPerHour * factoryCount;
  const targetTotalProfitPerHour = targetPnl.profitPerHour * factoryCount;
  const pnlGainPerHour = targetTotalProfitPerHour - currentTotalProfitPerHour;
  const breakEvenHours = totalUpgradeCost > 0 && pnlGainPerHour > 0 ? totalUpgradeCost / pnlGainPerHour : Number.POSITIVE_INFINITY;

  const upgradeTotalsByToken = useMemo(() => upgradeSteps.reduce<Record<string, number>>((acc, step) => {
    if (!step.token) return acc;
    acc[step.token] = (acc[step.token] || 0) + step.totalAmount;
    return acc;
  }, {}), [upgradeSteps]);

  function handleFactoryTypeChange(value: string) {
    const nextLevels = getLevels(rows, value);
    setFactoryType(value);
    setCurrentLevel(nextLevels[0] || 1);
    setTargetLevel(nextLevels[1] || nextLevels[0] || 1);
  }

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
        <div className="relative z-30">
          <Card 
            title={language === 'es' ? 'Calculadora de Mejora de Fábrica' : 'Factory Upgrade Calculator'}
            style={{ overflow: 'visible' }}
          >
            <div className="space-y-3 text-sm">
              <p className="text-slate-300">
                {language === 'es' 
                  ? 'Elige una fábrica, nivel actual, nivel objetivo y cantidad de fábricas. Esto calcula los materiales de mejora requeridos, costo de compra, PNL actual y objetivo, ganancia por hora y tiempo de retorno.'
                  : 'Pick a factory, current level, target level, and number of factories. This estimates total upgrade materials, upgrade buy cost, current PNL, target PNL, gain per hour, and break even time.'}
              </p>
              <p className="text-yellow-200">
                {language === 'es'
                  ? 'Las entradas usan cotizaciones de compra (COIN a recurso). Las salidas usan cotizaciones de venta (recurso a COIN). Esta página utiliza cálculos matemáticos base del CSV sin aumentos de taller, boosts activos ni modificadores de maestría.'
                  : 'Inputs use buy quotes, COIN to resource. Outputs use sell quotes, resource to COIN. This page uses base CSV recipe math without workshop boosts, active boosts, or mastery modifiers.'}
              </p>
              {error && <p className="text-red-300">{error}</p>}
              {quoteLoading && (
                <p className="text-slate-400">
                  {language === 'es'
                    ? `Cargando cotizaciones... ${quotedCount}/${quoteRequests.length} consultadas.`
                    : `Loading quotes... ${quotedCount}/${quoteRequests.length} checked.`}
                </p>
              )}

              <div className="grid gap-3 md:grid-cols-5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-300">{language === 'es' ? 'Tipo de Fábrica' : 'Factory Type'}</span>
                  <Dropdown
                    value={factoryType}
                    onChange={(val) => handleFactoryTypeChange(String(val))}
                    options={factoryTypeOptions}
                    searchable={true}
                  />
                </div>

                <label className="space-y-1 text-xs flex flex-col justify-end">
                  <span className="text-slate-300">{language === 'es' ? 'Cantidad de Fábricas' : 'Factory Count'}</span>
                  <input 
                    value={factoryCount} 
                    onChange={(event) => setFactoryCount(Math.max(1, Math.floor(numberInput(event.target.value))))} 
                    type="number" 
                    min="1" 
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-slate-500" 
                  />
                </label>

                <div className="space-y-1">
                  <span className="text-xs text-slate-300">{language === 'es' ? 'Nivel Actual' : 'Current Level'}</span>
                  <Dropdown
                    value={currentLevel}
                    onChange={(val) => setCurrentLevel(Number(val))}
                    options={currentLevelOptions}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-300">{language === 'es' ? 'Nivel Objetivo' : 'Target Level'}</span>
                  <Dropdown
                    value={targetLevel}
                    onChange={(val) => setTargetLevel(Number(val))}
                    options={targetLevelOptions}
                    searchable={false}
                  />
                </div>

                <div 
                  className="bg-slate-900/40 p-3 text-center flex flex-col justify-center items-center"
                  style={{ borderRadius: 'var(--radius-resource-item)' }}
                >
                  <p className="text-slate-400 text-xs">{language === 'es' ? 'Niveles Planificados' : 'Levels Planned'}</p>
                  <p className="text-lg font-bold text-white">{Math.max(targetLevel - currentLevel, 0)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card title={language === 'es' ? 'Resumen de Mejora' : 'Upgrade Summary'}>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Costo Total de Mejora' : 'Total Upgrade Cost'}:</span>{' '}
                <strong>{totalUpgradeMissing ? (language === 'es' ? 'Esperando cotizaciones' : 'Waiting for quotes') : `${fmt(totalUpgradeCost)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'PNL Total Actual/Hora' : 'Current Total PNL/Hr'}:</span>{' '}
                <strong>{currentPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(currentTotalProfitPerHour)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'PNL Total Objetivo/Hora' : 'Target Total PNL/Hr'}:</span>{' '}
                <strong>{targetPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(targetTotalProfitPerHour)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ganancia por Hora' : 'Gain Per Hour'}:</span>{' '}
                <strong>{currentPnl.missingQuote || targetPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(pnlGainPerHour)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Recuperación' : 'Break Even'}:</span>{' '}
                <strong>
                  {Number.isFinite(breakEvenHours) 
                    ? (language === 'es' ? `${fmt(breakEvenHours, 2)} horas` : `${fmt(breakEvenHours, 2)} hours`) 
                    : (language === 'es' ? 'No rentable o esperando' : 'Not profitable or waiting')}
                </strong>
              </p>
            </div>
          </Card>

          <Card title={language === 'es' ? 'Materiales de Mejora Necesarios' : 'Upgrade Amounts Needed'}>
            <div className="flex flex-wrap gap-3 justify-center py-2 text-sm">
              {Object.keys(upgradeTotalsByToken).length ? Object.entries(upgradeTotalsByToken).map(([token, amount]) => {
                const img = getResourceImage(token);
                const name = formatFactoryName(token, language);
                return (
                  <div 
                    key={token} 
                    className="resource-item-badge flex flex-col items-center justify-center p-4 text-center min-w-[110px] flex-1 max-w-[180px]"
                  >
                    {img && (
                      <img 
                        src={img} 
                        alt={token} 
                        className="h-10 w-10 object-contain mb-2" 
                      />
                    )}
                    <span className="text-xs text-slate-400 font-medium mb-1">{name}</span>
                    <span className="text-sm font-bold text-white">{fmt(amount)}</span>
                  </div>
                );
              }) : (
                <p className="text-slate-400 text-center w-full py-4">
                  {language === 'es' ? 'No se necesitan materiales de mejora para este rango.' : 'No upgrade material needed for this range.'}
                </p>
              )}
            </div>
          </Card>

          <Card title={language === 'es' ? 'Delta de PNL' : 'PNL Delta'}>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ganancia Actual por Ejecución' : 'Current Profit/Run'}:</span>{' '}
                <strong>{currentPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(currentPnl.profitPerRun)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ganancia Objetivo por Ejecución' : 'Target Profit/Run'}:</span>{' '}
                <strong>{targetPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(targetPnl.profitPerRun)} COIN`}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ejecuciones Actuales/Hora' : 'Current Runs/Hr'}:</span>{' '}
                <strong>{fmt(currentPnl.runsPerHour, 4)}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ejecuciones Objetivo/Hora' : 'Target Runs/Hr'}:</span>{' '}
                <strong>{fmt(targetPnl.runsPerHour, 4)}</strong>
              </p>
              <p>
                <span className="text-slate-400">{language === 'es' ? 'Ganancia PNL por Fábrica/Hora' : 'Per Factory PNL Gain/Hr'}:</span>{' '}
                <strong>{currentPnl.missingQuote || targetPnl.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(targetPnl.profitPerHour - currentPnl.profitPerHour)} COIN`}</strong>
              </p>
            </div>
          </Card>
        </div>

        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Cotizaciones de Receta Actual' : 'Current Recipe Quotes'}>
            <div className="space-y-2 text-sm text-slate-300">
              {currentRow ? (
                <>
                  <p className="font-semibold text-slate-200">
                    {language === 'es' ? 'Receta Actual' : 'Current Recipe'}: {formatFactoryName(factoryType, language)} {language === 'es' ? 'Nivel' : 'Level'} {currentLevel}
                  </p>
                  <QuoteLine label={language === 'es' ? 'Valor Venta de Salida' : 'Output Sell Value'} quote={quotes[sellKey(currentRow.output_token, currentRow.output_amount)]} />
                  {currentRow.input_token_1 && <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 1' : 'Input 1 Buy Cost'} quote={quotes[buyKey(currentRow.input_token_1, currentRow.input_amount_1)]} />}
                  {currentRow.input_token_2 && <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 2' : 'Input 2 Buy Cost'} quote={quotes[buyKey(currentRow.input_token_2, currentRow.input_amount_2)]} />}
                </>
              ) : <p className="text-slate-400">{language === 'es' ? 'No se encontró la receta actual.' : 'No current recipe found.'}</p>}
            </div>
          </Card>
        </div>

        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Cotizaciones de Receta Objetivo' : 'Target Recipe Quotes'}>
            <div className="space-y-2 text-sm text-slate-300">
              {targetRow ? (
                <>
                  <p className="font-semibold text-slate-200">
                    {language === 'es' ? 'Receta Objetivo' : 'Target Recipe'}: {formatFactoryName(factoryType, language)} {language === 'es' ? 'Nivel' : 'Level'} {targetLevel}
                  </p>
                  <QuoteLine label={language === 'es' ? 'Valor Venta de Salida' : 'Output Sell Value'} quote={quotes[sellKey(targetRow.output_token, targetRow.output_amount)]} />
                  {targetRow.input_token_1 && <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 1' : 'Input 1 Buy Cost'} quote={quotes[buyKey(targetRow.input_token_1, targetRow.input_amount_1)]} />}
                  {targetRow.input_token_2 && <QuoteLine label={language === 'es' ? 'Costo Compra Ingrediente 2' : 'Input 2 Buy Cost'} quote={quotes[buyKey(targetRow.input_token_2, targetRow.input_amount_2)]} />}
                </>
              ) : <p className="text-slate-400">{language === 'es' ? 'No se encontró la receta objetivo.' : 'No target recipe found.'}</p>}
            </div>
          </Card>
        </div>

        <Card title={language === 'es' ? 'Ruta de Mejora' : 'Upgrade Path'}>
          {upgradeSteps.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-slate-300">
                  <tr>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Paso' : 'Step'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Recurso de Mejora' : 'Upgrade Token'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Cantidad por Fábrica' : 'Amount Per Factory'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Cantidad Total' : 'Total Amount'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Costo de Compra' : 'Buy Cost'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Impacto' : 'Impact'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estado' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {upgradeSteps.map((step) => {
                    const img = getResourceImage(step.token);
                    const tokenName = formatFactoryName(step.token, language);
                    return (
                      <tr key={`${step.fromLevel}-${step.toLevel}-${step.token}`} className="border-t border-slate-800">
                        <td className="p-2 whitespace-nowrap">{language === 'es' ? 'Nivel' : 'Lv'} {step.fromLevel} → {language === 'es' ? 'Nivel' : 'Lv'} {step.toLevel}</td>
                        <td className="p-2 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {img && (
                              <img 
                                src={img} 
                                alt={step.token} 
                                className="h-5 w-5 object-contain" 
                                style={{ borderRadius: 'var(--radius-resource-item)' }} 
                              />
                            )}
                            <span>{tokenName}</span>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {img && (
                              <img 
                                src={img} 
                                alt={step.token} 
                                className="h-4 w-4 object-contain" 
                                style={{ borderRadius: 'var(--radius-resource-item)' }} 
                              />
                            )}
                            <span>{fmt(step.amountPerFactory)} {tokenName}</span>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {img && (
                              <img 
                                src={img} 
                                alt={step.token} 
                                className="h-4 w-4 object-contain" 
                                style={{ borderRadius: 'var(--radius-resource-item)' }} 
                              />
                            )}
                            <span>{fmt(step.totalAmount)} {tokenName}</span>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap font-bold text-slate-300">
                          {step.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(step.cost)} COIN`}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {step.missingQuote ? (language === 'es' ? 'Esperando' : 'Waiting') : `${fmt(step.impact, 2)}%`}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {step.missingQuote ? (language === 'es' ? 'Buscando cotización' : 'Waiting for quote') : (language === 'es' ? 'Listo' : 'Ready')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-slate-400">{language === 'es' ? 'No se encontraron pasos de mejora para este rango.' : 'No upgrade steps found for this range.'}</p>}
        </Card>
      </div>
    </Layout>
  );
}
