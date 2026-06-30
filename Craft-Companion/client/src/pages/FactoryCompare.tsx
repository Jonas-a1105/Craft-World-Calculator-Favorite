import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import Layout from '../components/Layout';
import Dropdown, { DropdownOption } from '../components/Dropdown';
import { useTranslation } from '../utils/i18n';
import { SkeletonTwoCards } from '../components/Skeleton';
import {
  calculateFactoryCycle,
  type FactoryDataRow,
  type PriceMap,
} from '../services/craftworldCalculations';
import { formatDurationFromMinutes } from '../services/durationFormat';
import { loadFactoryData } from '../services/factoryData';

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

function fmt(value: number | null | undefined, digits = 3, lang: string = 'en') {
  if (value === null || value === undefined || !Number.isFinite(value)) return lang === 'es' ? 'Faltan datos' : 'Missing data';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
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

function rowKey(row: FactoryDataRow) {
  return `${row.token}:${row.level}`;
}

function rowLabel(row: FactoryDataRow, lang: string) {
  const factory = formatFactoryName(row.token, lang);
  const output = formatFactoryName(row.output_token, lang);
  return `${factory} ${lang === 'es' ? 'Nivel' : 'Lv'} ${row.level} → ${output}`;
}

function parsePrices(raw: Record<string, string>): PriceMap {
  return Object.entries(raw).reduce<PriceMap>((acc, [symbol, value]) => {
    const parsed = Number(value);
    if (symbol && Number.isFinite(parsed) && parsed > 0) acc[symbol] = parsed;
    return acc;
  }, {});
}

function winner<T extends { key: string }>(rows: T[], getValue: (row: T) => number, lowerIsBetter = false) {
  const usable = rows.filter((row) => Number.isFinite(getValue(row)));
  if (!usable.length) return '';
  return [...usable].sort((a, b) => lowerIsBetter ? getValue(a) - getValue(b) : getValue(b) - getValue(a))[0].key;
}

export default function FactoryCompare() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem('compareViewMode') as 'list' | 'grid') || 'list';
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const factoryRows = await loadFactoryData();
        setRows(factoryRows);
        setSelectedKeys(factoryRows.slice(0, 4).map(rowKey));
      } catch {
        setError(language === 'es' ? 'No se pudieron cargar los datos de comparación de fábricas.' : 'Unable to load factory comparison data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  const selectedRows = useMemo(() => {
    return selectedKeys
      .map((key) => rows.find((row) => rowKey(row) === key))
      .filter((row): row is FactoryDataRow => Boolean(row));
  }, [rows, selectedKeys]);

  const tokens = useMemo(() => {
    return Array.from(new Set(selectedRows.flatMap((row) => [row.output_token, row.input_token_1, row.input_token_2].filter(Boolean)))).sort();
  }, [selectedRows]);

  const priceMap = useMemo(() => parsePrices(priceInputs), [priceInputs]);

  const comparisonRows = useMemo(() => {
    return selectedRows.map((row) => {
      const cycle = calculateFactoryCycle(row, priceMap);
      return { key: rowKey(row), row, cycle };
    });
  }, [priceMap, selectedRows]);

  const winners = {
    runtime: winner(comparisonRows, (item) => item.cycle.runtimeMinutes, true),
    outputHour: winner(comparisonRows, (item) => item.cycle.outputPerHour),
    profitHour: winner(comparisonRows.filter((item) => !item.cycle.missingPrices.length), (item) => item.cycle.profitPerHour),
    margin: winner(comparisonRows.filter((item) => item.cycle.marginPercent !== null), (item) => item.cycle.marginPercent || 0),
  };

  const dropdownOptions = useMemo(() => {
    const opts: DropdownOption[] = [{ value: '', label: language === 'es' ? 'Ninguno' : 'None' }];
    rows.forEach((row) => {
      opts.push({
        value: rowKey(row),
        label: rowLabel(row, language),
        image: getFactoryImage(row.token) || undefined,
      });
    });
    return opts;
  }, [rows, language]);

  function updateSelected(index: number, key: string) {
    const next = [...selectedKeys];
    next[index] = key;
    setSelectedKeys(Array.from(new Set(next)).slice(0, 4));
  }

  if (loading) {
    return (
      <Layout>
        <SkeletonTwoCards />
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="space-y-4">
        <div className="relative z-30">
          <Card 
            title={language === 'es' ? 'Comparar Fábricas' : 'Factory Compare'}
            style={{ overflow: 'visible' }}
          >
            <div className="space-y-3 text-sm">
              <p className="text-slate-300">
                {language === 'es'
                  ? 'Compara de 2 a 4 filas de fábricas. El tiempo de ejecución, la producción, los ingredientes y la ganancia provienen del motor de cálculo compartido.'
                  : 'Compare 2 to 4 factory rows. Runtime, production, inputs, and profit all come from the shared calculation core.'}
              </p>
              {error && <p className="text-red-300">{error}</p>}
              <div className="grid gap-3 md:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="space-y-1">
                    <span className="text-xs text-slate-300">
                      {language === 'es' ? `Fábrica ${index + 1}` : `Factory ${index + 1}`}
                    </span>
                    <Dropdown
                      value={selectedKeys[index] || ''}
                      onChange={(val) => updateSelected(index, String(val))}
                      options={dropdownOptions}
                      searchable={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="max-w-[720px] mx-auto w-full">
          <Card title={language === 'es' ? 'Precios en COIN' : 'COIN Prices'}>
            <div className="grid gap-3 text-sm md:grid-cols-2 justify-center">
              {tokens.length ? tokens.map((token) => (
                <label key={token} className="space-y-1">
                  <span className="text-xs text-slate-300">{formatFactoryName(token, language)} / COIN</span>
                  <input
                    value={priceInputs[token] || ''}
                    onChange={(event) => setPriceInputs((current) => ({ ...current, [token]: event.target.value }))}
                    inputMode="decimal"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                    placeholder={language === 'es' ? 'opcional' : 'optional'}
                  />
                </label>
              )) : (
                <p className="text-slate-400 text-center w-full py-2">
                  {language === 'es' ? 'Selecciona fábricas para ingresar precios opcionales.' : 'Pick factories to enter optional prices.'}
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="w-[95vw] max-w-[1800px] relative left-1/2 -translate-x-1/2">
          <Card title={language === 'es' ? 'Comparación' : 'Comparison'}>
            {comparisonRows.length ? (
              <div className="space-y-4">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => { setViewMode('list'); localStorage.setItem('compareViewMode', 'list'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                    style={{ border: 'none' }}
                  >
                    {language === 'es' ? 'Lista' : 'List'}
                  </button>
                  <button 
                    onClick={() => { setViewMode('grid'); localStorage.setItem('compareViewMode', 'grid'); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-black' : 'bg-slate-900/60 text-slate-400 hover:text-white'}`}
                    style={{ border: 'none' }}
                  >
                    {language === 'es' ? 'Tarjetas' : 'Cards'}
                  </button>
                </div>

                {viewMode === 'list' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] text-left text-sm">
                      <thead className="text-slate-300">
                        <tr>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Fábrica' : 'Factory'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ejecución' : 'Runtime'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Producción / Hora' : 'Output / Hr'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Producción / Día' : 'Output / Day'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Costo Ingredientes' : 'Input Cost'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ingresos' : 'Revenue'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia / Ciclo' : 'Profit / Cycle'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Ganancia / Hora' : 'Profit / Hr'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Margen' : 'Margin'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Dependencia Ingredientes' : 'Input Dependency'}</th>
                          <th className="p-2 whitespace-nowrap">{language === 'es' ? 'Estado' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonRows.map(({ key, row, cycle }) => {
                          const factImg = getFactoryImage(row.token);
                          const resImg = getResourceImage(row.output_token);
                          return (
                            <tr key={key} className="border-t border-slate-800">
                              <td className="p-2 font-semibold whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {factImg && (
                                    <img 
                                      src={factImg} 
                                      alt={row.token} 
                                      className="h-8 w-8 bg-slate-900 object-contain p-0.5" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                                    />
                                  )}
                                  <span>{rowLabel(row, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {formatDurationFromMinutes(cycle.runtimeMinutes)}
                                {winners.runtime === key && (
                                  <span className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white font-semibold">
                                    {language === 'es' ? 'Ganador' : 'Winner'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {resImg && (
                                    <img 
                                      src={resImg} 
                                      alt={row.output_token} 
                                      className="h-4 w-4 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                                    />
                                  )}
                                  <span>{fmt(cycle.outputPerHour, 3, language)} {formatFactoryName(row.output_token, language)}</span>
                                  {winners.outputHour === key && (
                                    <span className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white font-semibold">
                                      {language === 'es' ? 'Ganador' : 'Winner'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {resImg && (
                                    <img 
                                      src={resImg} 
                                      alt={row.output_token} 
                                      className="h-4 w-4 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                                    />
                                  )}
                                  <span>{fmt(cycle.outputPerDay, 3, language)} {formatFactoryName(row.output_token, language)}</span>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.inputCostPerCycle, 3, language)} COIN`}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.revenuePerCycle, 3, language)} COIN`}
                              </td>
                              <td className={`p-2 whitespace-nowrap ${cycle.profitPerCycle >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.profitPerCycle, 3, language)} COIN`}
                              </td>
                              <td className={`p-2 whitespace-nowrap ${cycle.profitPerHour >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.profitPerHour, 3, language)} COIN`}
                                {winners.profitHour === key && (
                                  <span className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white font-semibold">
                                    {language === 'es' ? 'Ganador' : 'Winner'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {cycle.marginPercent === null || cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.marginPercent, 2, language)}%`}
                                {winners.margin === key && (
                                  <span className="ml-2 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white font-semibold">
                                    {language === 'es' ? 'Ganador' : 'Winner'}
                                  </span>
                                )}
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    {getResourceImage(row.input_token_1) && (
                                      <img 
                                        src={getResourceImage(row.input_token_1)} 
                                        alt={row.input_token_1} 
                                        className="h-4 w-4 object-contain" 
                                        style={{ borderRadius: 'var(--radius-resource-item)' }}
                                      />
                                    )}
                                    <span>{fmt(cycle.input1PerCycle, 3, language)} {formatFactoryName(row.input_token_1, language)}</span>
                                  </div>
                                  {row.input_token_2 && (
                                    <div className="flex items-center gap-1.5">
                                      {getResourceImage(row.input_token_2) && (
                                        <img 
                                          src={getResourceImage(row.input_token_2)} 
                                          alt={row.input_token_2} 
                                          className="h-4 w-4 object-contain" 
                                          style={{ borderRadius: 'var(--radius-resource-item)' }}
                                        />
                                      )}
                                      <span>{fmt(cycle.input2PerCycle, 3, language)} {formatFactoryName(row.input_token_2, language)}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {cycle.missingPrices.length 
                                  ? (language === 'es' ? `Falta ${cycle.missingPrices.map(t => formatFactoryName(t, language)).join(', ')}` : `Missing ${cycle.missingPrices.join(', ')}`) 
                                  : (language === 'es' ? 'Listo' : 'Ready')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                    {comparisonRows.map(({ key, row, cycle }, index) => {
                      const factImg = getFactoryImage(row.token);
                      const resImg = getResourceImage(row.output_token);
                      return (
                        <div 
                          key={key} 
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            padding: '16px',
                            border: 'none'
                          }}
                          className="flex flex-col gap-4 relative overflow-hidden"
                        >
                          {/* Factory number indicator badge */}
                          <div className="absolute top-3 right-3">
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {language === 'es' ? `Fábrica ${index + 1}` : `Factory ${index + 1}`}
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
                                  alt={row.token} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="text-xs font-black text-slate-500">{row.token.slice(0, 3)}</div>
                              )}
                            </div>
                            <div className="min-w-0 pr-16">
                              <span className="text-[10px] uppercase font-black text-orange-400">
                                {formatFactoryName(row.token, language)}
                              </span>
                              <h3 className="text-sm font-black text-white truncate mt-0.5">
                                {language === 'es' ? `Nivel ${row.level} → ${formatFactoryName(row.output_token, language)}` : `Lv ${row.level} → ${formatFactoryName(row.output_token, language)}`}
                              </h3>
                            </div>
                          </div>

                          {/* Details grid as badges */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.03] justify-center">
                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ejecución:' : 'Runtime:'}</span>
                              <strong className="text-slate-200">{formatDurationFromMinutes(cycle.runtimeMinutes)}</strong>
                              {winners.runtime === key && (
                                <span className="ml-1 rounded bg-emerald-600 px-1 py-0.2 text-[8px] text-white font-semibold">
                                  {language === 'es' ? 'Ganador' : 'Winner'}
                                </span>
                              )}
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Prod/Hora:' : 'Prod/Hr:'}</span>
                              {resImg && <img src={resImg} alt={row.output_token} className="h-4 w-4 object-contain shrink-0" />}
                              <strong className="text-slate-200">{fmt(cycle.outputPerHour, 3, language)} {formatFactoryName(row.output_token, language)}</strong>
                              {winners.outputHour === key && (
                                <span className="ml-1 rounded bg-emerald-600 px-1 py-0.2 text-[8px] text-white font-semibold">
                                  {language === 'es' ? 'Ganador' : 'Winner'}
                                </span>
                              )}
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Prod/Día:' : 'Prod/Day:'}</span>
                              {resImg && <img src={resImg} alt={row.output_token} className="h-4 w-4 object-contain shrink-0" />}
                              <strong className="text-slate-200">{fmt(cycle.outputPerDay, 3, language)} {formatFactoryName(row.output_token, language)}</strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Costo Ingredientes:' : 'Input Cost:'}</span>
                              <strong className="text-slate-200">
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.inputCostPerCycle, 3, language)} COIN`}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ingresos:' : 'Revenue:'}</span>
                              <strong className="text-slate-200">
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.revenuePerCycle, 3, language)} COIN`}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia/Ciclo:' : 'Profit/Cycle:'}</span>
                              <strong className={cycle.profitPerCycle >= 0 ? 'text-emerald-455' : 'text-red-400'}>
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.profitPerCycle, 3, language)} COIN`}
                              </strong>
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Ganancia/Hora:' : 'Profit/Hr:'}</span>
                              <strong className={cycle.profitPerHour >= 0 ? 'text-emerald-455' : 'text-red-400'}>
                                {cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.profitPerHour, 3, language)} COIN`}
                              </strong>
                              {winners.profitHour === key && (
                                <span className="ml-1 rounded bg-emerald-600 px-1 py-0.2 text-[8px] text-white font-semibold">
                                  {language === 'es' ? 'Ganador' : 'Winner'}
                                </span>
                              )}
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Margen:' : 'Margin:'}</span>
                              <strong className="text-slate-200">
                                {cycle.marginPercent === null || cycle.missingPrices.length ? (language === 'es' ? 'Faltan precios' : 'Missing prices') : `${fmt(cycle.marginPercent, 2, language)}%`}
                              </strong>
                              {winners.margin === key && (
                                <span className="ml-1 rounded bg-emerald-600 px-1 py-0.2 text-[8px] text-white font-semibold">
                                  {language === 'es' ? 'Ganador' : 'Winner'}
                                </span>
                              )}
                            </div>

                            <div 
                              className="resource-item-badge flex flex-wrap gap-x-2 gap-y-1 items-center text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Dependencia:' : 'Dependency:'}</span>
                              <div className="flex items-center gap-1">
                                {getResourceImage(row.input_token_1) && (
                                  <img 
                                    src={getResourceImage(row.input_token_1)} 
                                    alt={row.input_token_1} 
                                    className="h-3.5 w-3.5 object-contain" 
                                    style={{ borderRadius: 'var(--radius-resource-item)' }}
                                  />
                                )}
                                <span>{fmt(cycle.input1PerCycle, 3, language)} {formatFactoryName(row.input_token_1, language)}</span>
                              </div>
                              {row.input_token_2 && (
                                <div className="flex items-center gap-1">
                                  {getResourceImage(row.input_token_2) && (
                                    <img 
                                      src={getResourceImage(row.input_token_2)} 
                                      alt={row.input_token_2} 
                                      className="h-3.5 w-3.5 object-contain" 
                                      style={{ borderRadius: 'var(--radius-resource-item)' }}
                                    />
                                  )}
                                  <span>{fmt(cycle.input2PerCycle, 3, language)} {formatFactoryName(row.input_token_2, language)}</span>
                                </div>
                              )}
                            </div>

                            <div 
                              className="resource-item-badge flex items-center gap-1.5 text-xs text-white"
                              style={{ backgroundColor: 'var(--bg-resource-item)', border: 'none', padding: '4px 10px' }}
                            >
                              <span className="text-[9px] text-slate-400 uppercase font-black">{language === 'es' ? 'Estado:' : 'Status:'}</span>
                              <span className={`font-bold ${cycle.missingPrices.length ? 'text-yellow-500' : 'text-emerald-455'}`}>
                                {cycle.missingPrices.length 
                                  ? (language === 'es' ? `Falta ${cycle.missingPrices.map(t => formatFactoryName(t, language)).join(', ')}` : `Missing ${cycle.missingPrices.join(', ')}`) 
                                  : (language === 'es' ? 'Listo' : 'Ready')}
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
                {language === 'es' ? 'Selecciona al menos una fábrica.' : 'Pick at least one factory.'}
              </p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
