import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { computeValueChain, ValueChainAnalysis } from '../services/valueChainCalculator';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

const AVAILABLE_TARGETS = [
  'MUD',
  'CLAY',
  'SAND',
  'COPPER',
  'STEEL',
  'SCREWS',
  'GLASS',
  'CEMENT',
  'DYNAMITE',
  'CERAMICS',
  'SEAWATER',
  'HEAT',
  'LAVA',
];

export default function ValueChainMap() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>('COPPER');
  const [selectedLevel, setSelectedLevel] = useState<number>(18);
  const [mode, setMode] = useState<'self_crafted' | 'market_buy'>('self_crafted');
  const [proficiencies, setProficiencies] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        const map: Record<string, number> = {
          COIN: 1,
          EARTH: 0.00394,
          WATER: 0.00394,
          FIRE: 0.00394,
        };
        if (home?.priceList?.prices) {
          home.priceList.prices.forEach((p: any) => {
            if (typeof p.amount === 'number' && p.amount > 0) {
              map[p.referenceSymbol?.toUpperCase()] = p.amount;
            }
          });
        }
        setPrices(map);
        if (home?.proficiencies) {
          setProficiencies(home.proficiencies);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const analysis: ValueChainAnalysis | null = computeValueChain(
    selectedToken,
    selectedLevel,
    rows,
    prices,
    proficiencies,
    mode
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-900/60 backdrop-blur border border-emerald-500/20 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              🗺️ {language === 'es' ? 'Mapa Aislado de Cadenas de Valor' : 'Isolated Value Chain Map'}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {language === 'es'
                ? 'Visualiza paso a paso la ganancia real multiplicada al transformar tus materias primas base (Tierra/Agua) en productos avanzados.'
                : 'Visualize step-by-step real multiplied profit from transforming raw base resources (Earth/Water) into advanced goods.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-gray-800/80 p-1.5 rounded-xl border border-gray-700/60">
            <button
              onClick={() => setMode('self_crafted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'self_crafted'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🌱 {language === 'es' ? '100% Farmeo Propio ($0 Costo)' : '100% Self-Harvested ($0 Cost)'}
            </button>
            <button
              onClick={() => setMode('market_buy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'market_buy'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🛒 {language === 'es' ? 'Comprar del Mercado' : 'Market Buy'}
            </button>
          </div>
        </div>

        {/* Target Resource Selector Bar */}
        <Card className="p-4 bg-gray-900/40 border border-gray-800">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {language === 'es' ? 'Selecciona Recurso Objetivo:' : 'Select Target Resource:'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {AVAILABLE_TARGETS.map((tok) => {
                const isSelected = selectedToken === tok;
                return (
                  <button
                    key={tok}
                    onClick={() => setSelectedToken(tok)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-md shadow-emerald-900/40 scale-105'
                        : 'bg-gray-800/60 text-gray-300 border-gray-700/50 hover:bg-gray-700/60 hover:text-white'
                    }`}
                  >
                    <ResourceIcon symbol={tok} className="w-4 h-4" />
                    <span>{tok}</span>
                  </button>
                );
              })}
            </div>

            {/* Level Slider / Selector */}
            <div className="flex items-center gap-4 mt-2 pt-3 border-t border-gray-800/60">
              <label className="text-xs text-gray-400 font-medium">
                {language === 'es' ? 'Nivel de Fábrica a Simular:' : 'Factory Level to Simulate:'}
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-48 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-lg">
                Nivel {selectedLevel}
              </span>
            </div>
          </div>
        </Card>

        {/* Top KPI Cards */}
        {analysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Raw Insumos Required */}
            <Card className="p-4 bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 font-medium">
                📦 {language === 'es' ? 'Materia Prima Base (Día)' : 'Raw Base Material (Day)'}
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(analysis.rawMaterialsNeeded).length > 0 ? (
                  Object.entries(analysis.rawMaterialsNeeded).map(([tok, amt]) => (
                    <div key={tok} className="flex items-center gap-2">
                      <ResourceIcon symbol={tok} className="w-4 h-4" />
                      <span className="text-lg font-bold text-gray-100">
                        {formatNumber(amt, 0)} {tok}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Materia Base Directa</span>
                )}
              </div>
            </Card>

            {/* Opportunity Cost */}
            <Card className="p-4 bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 font-medium">
                💵 {language === 'es' ? 'Valor Vendiéndolo Crudo' : 'Raw Opportunity Value'}
              </div>
              <div className="mt-2 text-2xl font-bold text-yellow-400">
                {formatNumber(analysis.rawOpportunityCostDay)} <span className="text-xs font-semibold text-yellow-500/80">COIN/día</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {language === 'es' ? 'Si vendes la Tierra/Agua sin procesar' : 'If selling raw Earth/Water directly'}
              </div>
            </Card>

            {/* Final Product Value */}
            <Card className="p-4 bg-gray-900/50 border border-gray-800">
              <div className="text-xs text-gray-400 font-medium">
                🚀 {language === 'es' ? 'Valor Vendiéndolo Procesado' : 'Processed Output Value'}
              </div>
              <div className="mt-2 text-2xl font-bold text-cyan-400">
                {formatNumber(analysis.finalOutputValueDay)} <span className="text-xs font-semibold text-cyan-500/80">COIN/día</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {language === 'es' ? `Al vender ${selectedToken} Nivel ${selectedLevel}` : `When selling ${selectedToken} Level ${selectedLevel}`}
              </div>
            </Card>

            {/* Multiplier / Extra Net Profit */}
            <Card className="p-4 bg-gradient-to-br from-emerald-950/60 to-teal-950/40 border border-emerald-500/30">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                🔥 {language === 'es' ? 'Beneficio Extra por Crafteo' : 'Extra Net Profit Added'}
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-300">
                +{formatNumber(analysis.netProfitDay)} <span className="text-xs font-bold text-emerald-400">COIN/día</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-700/40 px-2 py-0.5 rounded-md w-fit">
                <span>⚡ {formatNumber(analysis.totalMultiplier, 1)}% Extra Profit</span>
              </div>
            </Card>
          </div>
        )}

        {/* Visual Node Chain Flow Map */}
        {analysis && (
          <Card className="p-6 bg-gray-900/40 border border-gray-800">
            <h2 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
              <span>🌳</span>
              <span>{language === 'es' ? 'Flujo Visual del Árbol de Transformación' : 'Visual Production Flow Tree'}</span>
            </h2>

            <div className="relative overflow-x-auto pb-4">
              <div className="flex items-center min-w-[700px] gap-3">
                {/* Initial Harvest Node */}
                <div className="flex-1 bg-gray-800/80 border border-emerald-500/30 rounded-xl p-4 text-center min-w-[160px]">
                  <div className="flex justify-center mb-1">
                    <ResourceIcon symbol="EARTH" className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    {language === 'es' ? 'Recolección Base' : 'Base Harvest'}
                  </div>
                  <div className="text-sm font-semibold text-gray-200 mt-1">
                    {formatNumber(Object.values(analysis.rawMaterialsNeeded)[0] || 0, 0)} Tierra
                  </div>
                  <div className="text-[10px] text-emerald-400/80 mt-1 bg-emerald-950/60 border border-emerald-800/40 rounded px-1.5 py-0.5">
                    $0 Costo (Tu Mapa)
                  </div>
                </div>

                {/* Chain Steps */}
                {analysis.steps.map((st, idx) => (
                  <div key={st.token} className="flex items-center flex-1 gap-3">
                    {/* Arrow */}
                    <div className="flex flex-col items-center justify-center text-emerald-400">
                      <span className="text-xs font-bold bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                        {st.masteryDiscountPercent > 0 ? `-${formatNumber(st.masteryDiscountPercent, 1)}% M.` : '100%'}
                      </span>
                      <span className="text-xl animate-pulse">➔</span>
                    </div>

                    {/* Step Card */}
                    <div className="flex-1 bg-gray-800/90 border border-gray-700/80 rounded-xl p-4 min-w-[180px] shadow-lg">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <FactoryIcon symbol={st.token} className="w-5 h-5" />
                          <span className="text-xs font-bold text-gray-100">{st.token}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                          Nvl {st.factoryLevel}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Duración:</span>
                          <span className="font-mono">{formatNumber(st.durationMin, 1)} min</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-400">Ciclos/Día:</span>
                          <span className="font-mono">{formatNumber(st.cyclesPerDay, 1)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold pt-1 border-t border-gray-700/60">
                          <span className="text-gray-300">Profit/Día:</span>
                          <span className="text-emerald-400">+{formatNumber(st.netProfitPerDay)} COIN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Step Breakdown Table */}
        {analysis && (
          <Card className="p-6 bg-gray-900/40 border border-gray-800">
            <h2 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>{language === 'es' ? 'Desglose Paso a Paso por Fábrica' : 'Step-by-Step Factory Breakdown'}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-800/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-700">
                  <tr>
                    <th className="py-3 px-3">Paso</th>
                    <th className="py-3 px-3">Fábrica</th>
                    <th className="py-3 px-3">Insumos Exigidos</th>
                    <th className="py-3 px-3">Producción</th>
                    <th className="py-3 px-3 text-right">Profit / Ciclo</th>
                    <th className="py-3 px-3 text-right">Profit / Día</th>
                    <th className="py-3 px-3 text-right">Valor Agregado Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analysis.steps.map((st) => (
                    <tr key={st.token} className="hover:bg-gray-800/40 transition">
                      <td className="py-3 px-3 font-bold text-gray-400">#{st.stepIndex}</td>
                      <td className="py-3 px-3 font-bold text-gray-100 flex items-center gap-2">
                        <FactoryIcon symbol={st.token} className="w-4 h-4" />
                        <span>{st.token} (Nvl {st.factoryLevel})</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-300">
                        {st.input1Token && (
                          <span>
                            {formatNumber(st.input1AmountPerCycle, 1)} {st.input1Token}
                          </span>
                        )}
                        {st.input2Token && (
                          <span>
                            {' + '}
                            {formatNumber(st.input2AmountPerCycle, 1)} {st.input2Token}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                        {formatNumber(st.outputAmountPerCycle, 0)} {st.token}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-200">
                        +{formatNumber(st.netProfitPerCycle)} COIN
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        +{formatNumber(st.netProfitPerDay)} COIN
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-400">
                        +{formatNumber(st.cumulativeProfitPerDay)} COIN
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
