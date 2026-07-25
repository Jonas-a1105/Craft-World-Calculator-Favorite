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

type NodePos = {
  id: string;
  name: string;
  x: number;
  y: number;
  inputs: string[];
  branchColor: string;
};

// Blueprint Graph Node Layout coordinates matching Craft World official matrix
const MATRIX_NODES: NodePos[] = [
  // Base raw nodes (Level 0)
  { id: 'EARTH', name: 'EARTH', x: 250, y: 60, inputs: [], branchColor: '#22c55e' },
  { id: 'WATER', name: 'WATER', x: 550, y: 60, inputs: [], branchColor: '#3b82f6' },
  { id: 'FIRE', name: 'FIRE', x: 850, y: 60, inputs: [], branchColor: '#ef4444' },

  // Tier 1
  { id: 'MUD', name: 'MUD', x: 250, y: 170, inputs: ['EARTH'], branchColor: '#22c55e' },
  { id: 'SEAWATER', name: 'SEAWATER', x: 550, y: 170, inputs: ['WATER'], branchColor: '#3b82f6' },
  { id: 'HEAT', name: 'HEAT', x: 850, y: 170, inputs: ['FIRE'], branchColor: '#ef4444' },

  // Tier 2
  { id: 'CLAY', name: 'CLAY', x: 250, y: 280, inputs: ['MUD'], branchColor: '#22c55e' },
  { id: 'ALGAE', name: 'ALGAE', x: 550, y: 280, inputs: ['SEAWATER'], branchColor: '#3b82f6' },
  { id: 'LAVA', name: 'LAVA', x: 850, y: 280, inputs: ['HEAT'], branchColor: '#ef4444' },

  // Tier 3
  { id: 'SAND', name: 'SAND', x: 180, y: 390, inputs: ['CLAY'], branchColor: '#eab308' },
  { id: 'CERAMICS', name: 'CERAMICS', x: 330, y: 390, inputs: ['CLAY', 'SEAWATER'], branchColor: '#38bdf8' },
  { id: 'OXYGEN', name: 'OXYGEN', x: 550, y: 390, inputs: ['ALGAE'], branchColor: '#06b6d4' },

  // Tier 4
  { id: 'COPPER', name: 'COPPER', x: 250, y: 500, inputs: ['SAND'], branchColor: '#f97316' },
  { id: 'GAS', name: 'GAS', x: 550, y: 500, inputs: ['OXYGEN'], branchColor: '#0284c7' },
  { id: 'GLASS', name: 'GLASS', x: 820, y: 500, inputs: ['SAND', 'HEAT'], branchColor: '#38bdf8' },

  // Tier 5
  { id: 'STEEL', name: 'STEEL', x: 250, y: 610, inputs: ['COPPER'], branchColor: '#94a3b8' },
  { id: 'FUEL', name: 'FUEL', x: 520, y: 610, inputs: ['GAS'], branchColor: '#10b981' },
  { id: 'CEMENT', name: 'CEMENT', x: 650, y: 610, inputs: ['CLAY', 'WATER'], branchColor: '#cbd5e1' },

  // Tier 6
  { id: 'SCREWS', name: 'SCREWS', x: 250, y: 720, inputs: ['STEEL'], branchColor: '#64748b' },
  { id: 'PLASTICS', name: 'PLASTICS', x: 520, y: 720, inputs: ['FUEL', 'SEAWATER'], branchColor: '#0ea5e9' },
  { id: 'DYNAMITE', name: 'DYNAMITE', x: 750, y: 720, inputs: ['PLASTICS', 'HEAT'], branchColor: '#f43f5e' },
];

export default function ValueChainMap() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>('CERAMICS');
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

  // Recursively compute active ancestor nodes for selected target
  const activeNodeIds = useMemo(() => {
    const active = new Set<string>();

    function addAncestors(id: string) {
      if (active.has(id)) return;
      active.add(id);
      const node = MATRIX_NODES.find((n) => n.id === id);
      if (node) {
        node.inputs.forEach(addAncestors);
      }
    }

    addAncestors(selectedToken);
    return active;
  }, [selectedToken]);

  // Compute active connection edges (parent -> child)
  const activeEdges = useMemo(() => {
    const edges = new Set<string>();

    function addEdge(childId: string) {
      const childNode = MATRIX_NODES.find((n) => n.id === childId);
      if (!childNode) return;
      childNode.inputs.forEach((parentId) => {
        edges.add(`${parentId}->${childId}`);
        addEdge(parentId);
      });
    }

    addEdge(selectedToken);
    return edges;
  }, [selectedToken]);

  if (loading) {
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );
  }

  const selectedNode = MATRIX_NODES.find((n) => n.id === selectedToken) || MATRIX_NODES[0];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0e1738] border border-blue-500/30 p-6 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-100 flex items-center gap-2">
              <span>🗺️</span>
              <span>{language === 'es' ? 'Mapa Blueprint de Cadena de Valor' : 'Blueprint Value Chain Map'}</span>
            </h1>
            <p className="text-sm text-blue-300/80 mt-1">
              {language === 'es'
                ? 'Toca cualquier fábrica del árbol para iluminar su ruta de producción con cables neón amarillos y ver su profit real.'
                : 'Tap any factory on the tree to illuminate its production path with yellow neon cables and see its real profit.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-[#16224f] p-1.5 rounded-xl border border-blue-500/40">
              <button
                onClick={() => setMode('self_crafted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'self_crafted'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🌱 {language === 'es' ? '100% Farmeo Propio ($0)' : '100% Self-Harvested ($0)'}
              </button>
              <button
                onClick={() => setMode('market_buy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mode === 'market_buy'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛒 {language === 'es' ? 'Mercado' : 'Market'}
              </button>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-2 bg-[#16224f] px-3 py-1.5 rounded-xl border border-blue-500/40">
              <span className="text-xs text-blue-200 font-semibold">Nvl:</span>
              <input
                type="number"
                min="1"
                max="40"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Math.min(40, Math.max(1, Number(e.target.value))))}
                className="w-14 bg-gray-900 border border-blue-500/50 rounded text-center text-xs font-bold text-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Floating Active Target Info Banner / Modal Header */}
        {analysis && (
          <div className="bg-[#122254] border-2 border-cyan-400/80 rounded-2xl p-5 shadow-2xl shadow-cyan-950/50 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-md">
                  <ResourceIcon symbol={selectedToken} className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-cyan-200 uppercase tracking-wide">{selectedToken}</span>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-600/60 px-2 py-0.5 rounded-md">
                      Nivel {selectedLevel}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-300/80 mt-0.5">
                    {language === 'es' ? 'Ruta activa iluminada en amarillo neón en el plano' : 'Active production route glowing in yellow neon'}
                  </div>
                </div>
              </div>

              {/* Profit Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
                <div className="bg-[#0b1638] p-3 rounded-xl border border-blue-500/30 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    {language === 'es' ? 'Vender Crudo' : 'Raw Value'}
                  </div>
                  <div className="text-sm font-extrabold text-yellow-400 mt-0.5">
                    {formatNumber(analysis.rawOpportunityCostDay)} <span className="text-[10px]">COIN/d</span>
                  </div>
                </div>

                <div className="bg-[#0b1638] p-3 rounded-xl border border-blue-500/30 text-center">
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    {language === 'es' ? 'Vender Procesado' : 'Processed Value'}
                  </div>
                  <div className="text-sm font-extrabold text-cyan-400 mt-0.5">
                    {formatNumber(analysis.finalOutputValueDay)} <span className="text-[10px]">COIN/d</span>
                  </div>
                </div>

                <div className="bg-emerald-950/70 p-3 rounded-xl border border-emerald-500/50 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-300">
                    {language === 'es' ? 'Profit Neto Extra' : 'Extra Net Profit'}
                  </div>
                  <div className="text-sm font-black text-emerald-300 mt-0.5">
                    +{formatNumber(analysis.netProfitDay)} <span className="text-[10px]">COIN/d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blueprint Tree Interactive Canvas */}
        <Card className="p-0 bg-[#0d1633] border-2 border-blue-900/80 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Blueprint Grid Background Pattern */}
          <div
            className="w-full relative min-h-[820px] p-6 select-none"
            style={{
              backgroundColor: '#0c1530',
              backgroundImage: `
                radial-gradient(rgba(59, 130, 246, 0.25) 1px, transparent 1px),
                linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px, 48px 48px, 48px 48px',
            }}
          >
            {/* Blackboard Chalk / Graffiti Doodles */}
            <div className="absolute top-12 left-1/3 text-blue-500/20 font-mono text-xl font-bold rotate-[-12deg] pointer-events-none">
              LFG! 🚀
            </div>
            <div className="absolute top-72 right-1/4 text-blue-500/15 font-mono text-sm font-semibold rotate-[8deg] pointer-events-none">
              E = mc² 🧪
            </div>
            <div className="absolute bottom-40 left-1/4 text-blue-500/15 font-mono text-lg font-bold rotate-[-6deg] pointer-events-none">
              WAGMI 💎
            </div>
            <div className="absolute bottom-12 right-12 text-blue-500/20 font-mono text-sm font-bold rotate-[15deg] pointer-events-none">
              TO THE MOON! 🌙
            </div>

            {/* SVG Connecting Cables Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
              <defs>
                {/* Glowing Yellow Filter for Active Path */}
                <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {MATRIX_NODES.map((node) => {
                return node.inputs.map((parentId) => {
                  const parentNode = MATRIX_NODES.find((n) => n.id === parentId);
                  if (!parentNode) return null;

                  const edgeKey = `${parentId}->${node.id}`;
                  const isActive = activeEdges.has(edgeKey);

                  // Calculate curve points
                  const startX = parentNode.x;
                  const startY = parentNode.y + 24;
                  const endX = node.x;
                  const endY = node.y - 24;
                  const midY = (startY + endY) / 2;

                  const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                  return (
                    <g key={edgeKey}>
                      {/* Background Cable */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isActive ? '#fbbf24' : parentNode.branchColor}
                        strokeWidth={isActive ? '4' : '2'}
                        strokeDasharray={isActive ? '8,6' : 'none'}
                        strokeOpacity={isActive ? '1' : activeNodeIds.size > 0 ? '0.2' : '0.6'}
                        filter={isActive ? 'url(#glow-yellow)' : undefined}
                        className={isActive ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                });
              })}
            </svg>

            {/* Matrix Nodes Layer */}
            <div className="relative z-20 w-full h-full min-h-[800px]">
              {MATRIX_NODES.map((node) => {
                const isSelected = selectedToken === node.id;
                const isActive = activeNodeIds.has(node.id);
                const opacityClass = activeNodeIds.size > 0 && !isActive ? 'opacity-25 scale-95' : 'opacity-100 scale-100';

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedToken(node.id)}
                    style={{ left: `${node.x - 36}px`, top: `${node.y - 36}px` }}
                    className={`absolute cursor-pointer transition-all duration-300 ${opacityClass}`}
                  >
                    {/* Node Container Box matching Craft World Skill Tree */}
                    <div
                      className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center p-2 relative shadow-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-[#1b2b68] border-cyan-400 shadow-cyan-500/50 scale-110 z-30'
                          : isActive
                          ? 'bg-[#142252] border-yellow-400 shadow-yellow-500/30'
                          : 'bg-[#101b3d] border-blue-900/80 hover:border-blue-400/60'
                      }`}
                    >
                      {/* Checkmark Badge on Top Left */}
                      <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-500 border border-emerald-300 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-md">
                        ✓
                      </div>

                      {/* Icon */}
                      <ResourceIcon symbol={node.id} className="w-8 h-8 drop-shadow-md" />

                      {/* Token Label */}
                      <span className="text-[10px] font-extrabold text-blue-100 mt-1 tracking-tight truncate max-w-full">
                        {node.name}
                      </span>
                    </div>

                    {/* Active Target Floating Badge */}
                    {isSelected && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-400 text-gray-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-lg border border-cyan-200">
                        {language === 'es' ? 'Seleccionado' : 'Target'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Step Breakdown Table */}
        {analysis && (
          <Card className="p-6 bg-gray-900/40 border border-gray-800">
            <h2 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>{language === 'es' ? 'Desglose Detallado de la Ruta Seleccionada' : 'Selected Path Breakdown Table'}</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#121f47] text-blue-300 uppercase text-[10px] tracking-wider border-b border-blue-800/60">
                  <tr>
                    <th className="py-3 px-3">Paso</th>
                    <th className="py-3 px-3">Fábrica</th>
                    <th className="py-3 px-3">Insumos por Ciclo</th>
                    <th className="py-3 px-3">Producción por Ciclo</th>
                    <th className="py-3 px-3 text-right">Profit / Ciclo</th>
                    <th className="py-3 px-3 text-right">Profit / Día</th>
                    <th className="py-3 px-3 text-right">Ganancia Acumulada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analysis.steps.map((st) => (
                    <tr key={st.token} className="hover:bg-blue-950/30 transition">
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
