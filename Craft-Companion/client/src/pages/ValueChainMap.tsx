import { useEffect, useState, useMemo } from 'react';
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

const FEATURED_TARGETS = [
  { token: 'MUD', label: 'Barro', desc: 'Receta básica de Tierra' },
  { token: 'CLAY', label: 'Arcilla', desc: 'Barro procesado' },
  { token: 'SAND', label: 'Arena', desc: 'Arcilla refinada' },
  { token: 'COPPER', label: 'Cobre', desc: 'Arena fundida' },
  { token: 'STEEL', label: 'Acero', desc: 'Cobre aleado' },
  { token: 'SCREWS', label: 'Tornillos', desc: 'Acero forjado' },
  { token: 'GLASS', label: 'Vidrio', desc: 'Arena horneada' },
  { token: 'CEMENT', label: 'Cemento', desc: 'Mezcla de Arcilla' },
  { token: 'DYNAMITE', label: 'Dinamita', desc: 'Explosivo avanzado' },
  { token: 'CERAMICS', label: 'Cerámica', desc: 'Arcilla salada' },
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

  const analysis: ValueChainAnalysis | null = useMemo(() => {
    if (rows.length === 0) return null;
    return computeValueChain(selectedToken, selectedLevel, rows, prices, proficiencies, mode);
  }, [selectedToken, selectedLevel, rows, prices, proficiencies, mode]);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Modern Studio Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full w-fit mb-3">
                <span>⚡ ANALIZADOR DE CADENA INDUSTRIAL</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Mapa de Valor y Transformación
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                Calcula exactamente cuánto dinero ganas al procesar tus materias primas paso a paso en lugar de vender la tierra cruda en la bolsa.
              </p>
            </div>

            {/* Mode & Level Selection Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-700/60 backdrop-blur">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl">
                <button
                  onClick={() => setMode('self_crafted')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'self_crafted'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌱 Farmeo Propio ($0)
                </button>
                <button
                  onClick={() => setMode('market_buy')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'market_buy'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛒 Mercado
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Nivel:</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(Math.min(40, Math.max(1, Number(e.target.value))))}
                  className="w-12 bg-slate-900 border border-slate-700 rounded text-center text-xs font-extrabold text-cyan-400 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Target Product Selection Bar */}
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800/80 p-4 rounded-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Selecciona el Producto Terminado a Simular:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
            {FEATURED_TARGETS.map((t) => {
              const isSelected = selectedToken === t.token;
              return (
                <button
                  key={t.token}
                  onClick={() => setSelectedToken(t.token)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 text-white shadow-xl shadow-cyan-950/50 scale-105 ring-2 ring-cyan-400/40'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <ResourceIcon symbol={t.token} className="w-8 h-8 mb-1.5 drop-shadow-md" />
                  <span className="text-xs font-black tracking-tight">{t.token}</span>
                  <span className="text-[10px] opacity-75 font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Dashboard Grid */}
        {analysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Raw Insumos Required */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                📦 Insumos Iniciales Usados
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(analysis.rawMaterialsNeeded).length > 0 ? (
                  Object.entries(analysis.rawMaterialsNeeded).map(([tok, amt]) => (
                    <div key={tok} className="flex items-center gap-2">
                      <ResourceIcon symbol={tok} className="w-5 h-5" />
                      <span className="text-xl font-extrabold text-white">
                        {formatNumber(amt, 0)} {tok}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-slate-400">Materia Prima Directa</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Consumo total de tus parcelas por día
              </div>
            </div>

            {/* Raw Opportunity Value */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                💵 Valor Vendiéndolo Crudo
              </div>
              <div className="mt-3 text-2xl font-black text-amber-400">
                {formatNumber(analysis.rawOpportunityCostDay)} <span className="text-xs font-bold text-amber-500/80">COIN/día</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Lo que obtendrías si vendieras la Tierra sin procesar
              </div>
            </div>

            {/* Processed Output Revenue */}
            <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🚀 Valor Vendiéndolo Procesado
              </div>
              <div className="mt-3 text-2xl font-black text-cyan-400">
                {formatNumber(analysis.finalOutputValueDay)} <span className="text-xs font-bold text-cyan-500/80">COIN/día</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Venta total del producto final {selectedToken} (Nvl {selectedLevel})
              </div>
            </div>

            {/* Extra Net Profit Multiplier */}
            <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/60 border border-emerald-500/40 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                🔥 Ganancia Extra por Crafteo
              </div>
              <div className="mt-3 text-3xl font-black text-emerald-300">
                +{formatNumber(analysis.netProfitDay)} <span className="text-xs font-bold text-emerald-400">COIN/día</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-900/60 border border-emerald-700/60 px-2.5 py-1 rounded-lg w-fit">
                <span>⚡ +{formatNumber(analysis.totalMultiplier, 1)}% Extra Profit</span>
              </div>
            </div>
          </div>
        )}

        {/* Clean Step-by-Step Flow Cards */}
        {analysis && (
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h2 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="text-emerald-400">🌱</span>
              <span>Cadena de Producción Paso a Paso</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Step 0: Raw Harvest Card */}
              <div className="bg-slate-950 border border-emerald-500/30 p-5 rounded-2xl shadow-lg relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md">
                      Paso #0 — Inicio
                    </span>
                    <span className="text-xs font-bold text-emerald-400">$0 Costo</span>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <ResourceIcon symbol="EARTH" className="w-10 h-10 drop-shadow-md" />
                    <div>
                      <div className="text-base font-extrabold text-white">EARTH</div>
                      <div className="text-xs font-semibold text-slate-400">Farmeo de Parcelas</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 mt-3 pt-3 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Recolectado:</span>
                      <span className="font-bold text-white font-mono">
                        {formatNumber(Object.values(analysis.rawMaterialsNeeded)[0] || 0, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor de Mercado:</span>
                      <span className="font-bold text-yellow-400 font-mono">
                        {formatNumber(analysis.rawOpportunityCostDay)} COIN/día
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Cards */}
              {analysis.steps.map((st) => (
                <div
                  key={st.token}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all p-5 rounded-2xl shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-md">
                        Paso #{st.stepIndex}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md">
                        Nivel {st.factoryLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 my-3">
                      <FactoryIcon symbol={st.token} className="w-10 h-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-base font-extrabold text-white">{st.token}</div>
                        <div className="text-xs font-semibold text-cyan-400">
                          {st.masteryDiscountPercent > 0 ? `-${formatNumber(st.masteryDiscountPercent, 1)}% Maestría` : 'Fábrica'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5 mt-3 pt-3 border-t border-slate-800 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Insumos/Ciclo:</span>
                        <span className="font-bold text-slate-200">
                          {st.input1Token && `${formatNumber(st.input1AmountPerCycle, 1)} ${st.input1Token}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Producción/Ciclo:</span>
                        <span className="font-bold text-emerald-400">
                          {formatNumber(st.outputAmountPerCycle, 0)} {st.token}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400">Profit Agregado/Día:</span>
                        <span className="font-extrabold text-emerald-400">
                          +{formatNumber(st.netProfitPerDay)} COIN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Breakdown Table */}
        {analysis && (
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Tabla de Desglose de Inversión por Fábrica</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Paso</th>
                    <th className="py-3 px-4">Fábrica</th>
                    <th className="py-3 px-4">Insumos Exigidos</th>
                    <th className="py-3 px-4">Producción</th>
                    <th className="py-3 px-4 text-right">Profit / Ciclo</th>
                    <th className="py-3 px-4 text-right">Profit / Día</th>
                    <th className="py-3 px-4 text-right">Ganancia Acumulada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analysis.steps.map((st) => (
                    <tr key={st.token} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-500">#{st.stepIndex}</td>
                      <td className="py-3 px-4 font-extrabold text-white flex items-center gap-2">
                        <FactoryIcon symbol={st.token} className="w-4 h-4" />
                        <span>{st.token} (Nvl {st.factoryLevel})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
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
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                        {formatNumber(st.outputAmountPerCycle, 0)} {st.token}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                        +{formatNumber(st.netProfitPerCycle)} COIN
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400">
                        +{formatNumber(st.netProfitPerDay)} COIN
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-cyan-400">
                        +{formatNumber(st.cumulativeProfitPerDay)} COIN
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
