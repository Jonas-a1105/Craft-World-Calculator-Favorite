import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import { calculateFactoryCycle, FactoryCycleResult } from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function FactoryCompare() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [token1, setToken1] = useState('STEEL');
  const [level1, setLevel1] = useState(1);
  const [token2, setToken2] = useState('GLASS');
  const [level2, setLevel2] = useState(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 1) {
          setToken1(factoryRows[0].token);
          setToken2(factoryRows[1].token);
        }
        // Base raw material market price fallback: 0.00394 COIN per EARTH/WATER/FIRE (matching in-game Exchange rate)
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
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const uniqueTokens = Array.from(new Set(rows.map((r) => r.token)));
  const row1 =
    rows.find((r) => r.token === token1 && r.level === level1) ||
    rows.find((r) => r.token === token1);
  const row2 =
    rows.find((r) => r.token === token2 && r.level === level2) ||
    rows.find((r) => r.token === token2);

  const cycle1: FactoryCycleResult | null = row1 ? calculateFactoryCycle(row1, prices) : null;
  const cycle2: FactoryCycleResult | null = row2 ? calculateFactoryCycle(row2, prices) : null;

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Comparar Fábricas' : 'Compare Factories'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Comparativa frente a frente de producción, requerimientos y rentabilidad entre dos fábricas.'
              : 'Side-by-side comparison of production, requirements, and profit between two factories.'}
          </p>
        </div>

        {/* Selection Card */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Factory 1 Selector */}
          <Card title={language === 'es' ? '🏭 Fábrica A' : '🏭 Factory A'}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  {language === 'es' ? 'Recurso / Fábrica:' : 'Resource / Factory:'}
                </label>
                <select
                  value={token1}
                  onChange={(e) => {
                    setToken1(e.target.value);
                    setLevel1(1);
                  }}
                  className="w-full"
                >
                  {uniqueTokens.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  {language === 'es' ? 'Nivel:' : 'Level:'}
                </label>
                <select
                  value={level1}
                  onChange={(e) => setLevel1(Number(e.target.value))}
                  className="w-full"
                >
                  {rows
                    .filter((r) => r.token === token1)
                    .map((r) => (
                      <option key={r.level} value={r.level}>
                        Nivel {r.level}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Factory 2 Selector */}
          <Card title={language === 'es' ? '🏭 Fábrica B' : '🏭 Factory B'}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  {language === 'es' ? 'Recurso / Fábrica:' : 'Resource / Factory:'}
                </label>
                <select
                  value={token2}
                  onChange={(e) => {
                    setToken2(e.target.value);
                    setLevel2(1);
                  }}
                  className="w-full"
                >
                  {uniqueTokens.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  {language === 'es' ? 'Nivel:' : 'Level:'}
                </label>
                <select
                  value={level2}
                  onChange={(e) => setLevel2(Number(e.target.value))}
                  className="w-full"
                >
                  {rows
                    .filter((r) => r.token === token2)
                    .map((r) => (
                      <option key={r.level} value={r.level}>
                        Nivel {r.level}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Side-by-Side Comparison Card */}
        {cycle1 && cycle2 && (
          <Card
            title={language === 'es' ? '⚖️ Resultados de Comparación' : '⚖️ Comparison Results'}
          >
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Column 1 */}
              <div className="resource-item-badge p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FactoryIcon symbol={cycle1.row.token} size={36} />
                  <div>
                    <h4 className="font-extrabold text-white text-base">{cycle1.row.token}</h4>
                    <span className="text-xs text-emerald-400 font-bold">
                      Nv. {cycle1.row.level}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Tiempo Ciclo' : 'Cycle Time'}:</span>
                    <strong className="text-white">{cycle1.runtimeMinutes} min</strong>
                  </p>
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Output / Día' : 'Output / Day'}:</span>
                    <strong className="text-amber-300 flex items-center gap-1">
                      <ResourceIcon symbol={cycle1.row.output_token} size={14} />
                      {formatNumber(cycle1.outputPerDay)}
                    </strong>
                  </p>
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}:</span>
                    <strong className="text-emerald-400 font-black">
                      {formatNumber(cycle1.profitPerDay)} COIN
                    </strong>
                  </p>
                </div>
              </div>

              {/* Column 2 */}
              <div className="resource-item-badge p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FactoryIcon symbol={cycle2.row.token} size={36} />
                  <div>
                    <h4 className="font-extrabold text-white text-base">{cycle2.row.token}</h4>
                    <span className="text-xs text-emerald-400 font-bold">
                      Nv. {cycle2.row.level}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Tiempo Ciclo' : 'Cycle Time'}:</span>
                    <strong className="text-white">{cycle2.runtimeMinutes} min</strong>
                  </p>
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Output / Día' : 'Output / Day'}:</span>
                    <strong className="text-amber-300 flex items-center gap-1">
                      <ResourceIcon symbol={cycle2.row.output_token} size={14} />
                      {formatNumber(cycle2.outputPerDay)}
                    </strong>
                  </p>
                  <p className="flex justify-between text-slate-400">
                    <span>{language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}:</span>
                    <strong className="text-emerald-400 font-black">
                      {formatNumber(cycle2.profitPerDay)} COIN
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
