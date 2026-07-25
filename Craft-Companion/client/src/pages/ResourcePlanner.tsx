import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { buildRecipeTree, flattenRecipeToBaseResources } from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon } from '../components/GameIcon';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function ResourcePlanner() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [targetToken, setTargetToken] = useState('STEEL');
  const [targetAmount, setTargetAmount] = useState(10);
  const [userResources, setUserResources] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0)
          setTargetToken(factoryRows[0].output_token || factoryRows[0].token);
        const resMap: Record<string, number> = {};
        if (home?.craftWorld?.resources) {
          home.craftWorld.resources.forEach((r: any) => {
            resMap[(r.symbol || '').toUpperCase()] = r.amount || 0;
          });
        }
        setUserResources(resMap);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const uniqueTokens = Array.from(new Set(rows.map((r) => r.output_token || r.token))).filter(
    Boolean,
  );

  const tree = buildRecipeTree(rows, targetToken, targetAmount);
  const baseRequirements = flattenRecipeToBaseResources(tree);

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Planificador de Recursos' : 'Resource Planner'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Desglose completo de materias primas necesarias para alcanzar tus metas de crafteo.'
              : 'Full breakdown of raw materials required to reach your crafting goals.'}
          </p>
        </div>

        {/* Target Selection Card */}
        <Card title={language === 'es' ? '🎯 Meta de Producción' : '🎯 Production Goal'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {language === 'es' ? 'Recurso Objetivo:' : 'Target Resource:'}
              </label>
              <select
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full"
              >
                {uniqueTokens.map((tok) => (
                  <option key={tok} value={tok}>
                    {tok}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {language === 'es' ? 'Cantidad Deseada:' : 'Desired Amount:'}
              </label>
              <input
                type="number"
                min={1}
                value={targetAmount}
                onChange={(e) => setTargetAmount(Math.max(1, Number(e.target.value)))}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Raw Materials Breakdown Grid */}
        <Card
          title={
            language === 'es'
              ? '🪵 Desglose de Materias Primas Requeridas'
              : '🪵 Raw Materials Required'
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(baseRequirements).map(([symbol, requiredQty]) => {
              const currentStock = userResources[symbol] || 0;
              const missing = Math.max(0, requiredQty - currentStock);

              return (
                <div key={symbol} className="resource-item-badge p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ResourceIcon symbol={symbol} size={28} />
                      <span className="font-extrabold text-white text-sm">{symbol}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${missing === 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}
                    >
                      {missing === 0
                        ? language === 'es'
                          ? 'Suficiente'
                          : 'Sufficient'
                        : language === 'es'
                          ? `Faltan ${formatNumber(missing)}`
                          : `Need ${formatNumber(missing)}`}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 pt-1 border-t border-slate-800/60">
                    <div className="flex justify-between text-slate-400">
                      <span>{language === 'es' ? 'Requerido' : 'Required'}:</span>
                      <strong className="text-amber-300">{formatNumber(requiredQty)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>{language === 'es' ? 'En Inventario' : 'In Stock'}:</span>
                      <strong className="text-slate-200">{formatNumber(currentStock)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
