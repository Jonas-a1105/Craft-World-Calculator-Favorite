import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';
import { SkeletonSingleColumn } from '../components/Skeleton';
import { getCraftworldHome, getCraftworldQuote } from '../services/api';

type ResourceAmount = {
  symbol?: string;
  amount?: number;
};

type Quote = {
  type: string;
  input: { symbol: string; amount: number };
  output: { symbol: string; amount: number };
  details?: { priceImpactPercentage?: number };
};

type QuoteMap = Record<string, Quote | null>;

type InventoryValueRow = {
  symbol: string;
  amount: number;
  quote: Quote | null;
  value: number;
  impact: number;
};

const QUOTE_BATCH_SIZE = 12;

function quoteKey(symbol: string, amount: number) {
  return `${symbol.toUpperCase()}-${amount}`;
}

function formatNumber(value: number, digits = 6) {
  return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits }) : '0';
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

function normalizeInventory(resources: ResourceAmount[]) {
  const bySymbol = new Map<string, number>();

  resources.forEach((resource) => {
    const symbol = String(resource.symbol || '').trim().toUpperCase();
    const amount = Number(resource.amount || 0);
    if (!symbol || amount <= 0) return;
    bySymbol.set(symbol, (bySymbol.get(symbol) || 0) + amount);
  });

  return Array.from(bySymbol.entries())
    .map(([symbol, amount]) => ({ symbol, amount }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export default function InventoryValue() {
  const { language } = useTranslation();
  const [inventory, setInventory] = useState<Array<{ symbol: string; amount: number }>>([]);
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
        const home = await getCraftworldHome();
        setInventory(normalizeInventory(home.inventory || []));
      } catch {
        setError('Unable to load inventory data. Refresh and try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const quoteRequests = useMemo(() => {
    return inventory.map((item) => ({
      symbol: item.symbol,
      amount: item.amount,
      key: quoteKey(item.symbol, item.amount),
    }));
  }, [inventory]);

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
                const quote = await getCraftworldQuote({
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
        if (!cancelled) setQuoteError('Unable to load one or more inventory quotes.');
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [quoteRequests]);

  const valueRows = useMemo<InventoryValueRow[]>(() => {
    return inventory
      .map((item) => {
        const quote = quotes[quoteKey(item.symbol, item.amount)] || null;
        return {
          symbol: item.symbol,
          amount: item.amount,
          quote,
          value: quote?.output.amount || 0,
          impact: quote?.details?.priceImpactPercentage || 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [inventory, quotes]);

  const quotedRows = valueRows.filter((row) => row.quote);
  const totalValue = quotedRows.reduce((sum, row) => sum + row.value, 0);
  const highestValueRow = quotedRows[0] || null;

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
          <Card title={language === 'es' ? 'Valor de Inventario' : 'Inventory Value'}>
            <div className="space-y-3">
              <p className="text-sm text-slate-300">
                {language === 'es'
                  ? 'Esto estima el valor en monedas (COIN) de cada recurso en tu inventario usando cotizaciones en vivo del mercado.'
                  : 'This estimates the COIN value of every resource in your inventory using live Craft World quotes.'}
              </p>
              {quoteLoading && (
                <p className="text-sm text-slate-400">
                  {language === 'es'
                    ? `Cargando cotizaciones de inventario... ${quotedCount}/${quoteRequests.length} cotizaciones comprobadas.`
                    : `Loading inventory prices in parallel batches... ${quotedCount}/${quoteRequests.length} quotes checked.`}
                </p>
              )}
              {error && <p className="text-sm text-red-300">{error}</p>}
              {quoteError && <p className="text-sm text-red-300">{quoteError}</p>}
              {!inventory.length && (
                <p className="text-sm text-slate-400">
                  {language === 'es' ? 'No se encontraron recursos en el inventario para esta cuenta todavía.' : 'No inventory resources were found for this account yet.'}
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card title={language === 'es' ? 'Valor de Inventario Cotizado' : 'Quoted Inventory Value'}>
            <div className="text-center font-bold text-lg py-1 text-emerald-300">
              {formatNumber(totalValue)} COIN
            </div>
          </Card>

          <Card title={language === 'es' ? 'Recursos Encontrados' : 'Resources Found'}>
            <div className="text-center font-bold text-lg py-1">
              {inventory.length.toLocaleString()}
            </div>
          </Card>

          <Card title={language === 'es' ? 'Recurso de Mayor Valor' : 'Highest Value Resource'}>
            <div className="flex flex-col items-center justify-center py-1">
              {highestValueRow ? (
                <div className="flex items-center gap-2 font-semibold">
                  {getResourceImage(highestValueRow.symbol) && (
                    <img 
                      src={getResourceImage(highestValueRow.symbol)} 
                      alt={highestValueRow.symbol} 
                      className="h-6 w-6 object-contain" 
                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                    />
                  )}
                  <span>{formatFactoryName(highestValueRow.symbol, language)}: {formatNumber(highestValueRow.value)} COIN</span>
                </div>
              ) : (
                <span className="text-slate-400 text-sm">{language === 'es' ? 'Esperando precios' : 'Waiting for prices'}</span>
              )}
            </div>
          </Card>
        </div>

        {valueRows.length > 0 && (
          <Card title={language === 'es' ? 'Recursos Clasificados por Valor COIN' : 'Resources Ranked by COIN Value'}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-slate-300">
                  <tr>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Rango' : 'Rank'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Recurso' : 'Resource'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Cantidad de Propiedad' : 'Amount Owned'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Valor COIN Estimado' : 'Estimated COIN Value'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Impacto de Precio' : 'Price Impact'}</th>
                    <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estado' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {valueRows.map((row, index) => {
                    const img = getResourceImage(row.symbol);
                    const resourceName = formatFactoryName(row.symbol, language);
                    return (
                      <tr key={row.symbol} className="border-t border-slate-800">
                        <td className="p-2 whitespace-nowrap">{index + 1}</td>
                        <td className="p-2 font-semibold whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {img && (
                              <img 
                                src={img} 
                                alt={row.symbol} 
                                className="h-5 w-5 object-contain" 
                                style={{ borderRadius: 'var(--radius-resource-item)' }}
                              />
                            )}
                            <span>{resourceName}</span>
                          </div>
                        </td>
                        <td className="p-2 whitespace-nowrap">{formatNumber(row.amount)}</td>
                        <td className="p-2 whitespace-nowrap text-emerald-300">
                          {row.quote ? `${formatNumber(row.value)} COIN` : (language === 'es' ? 'Esperando' : 'Waiting')}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {row.quote ? `${formatNumber(row.impact, 2)}%` : (language === 'es' ? 'Esperando' : 'Waiting')}
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          {row.quote ? (language === 'es' ? 'Listo' : 'Ready') : (language === 'es' ? 'Buscando cotización' : 'Waiting for quote')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
