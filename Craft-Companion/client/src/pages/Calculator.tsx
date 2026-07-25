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

export default function Calculator() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('STEEL');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        if (factoryRows.length > 0) setSelectedToken(factoryRows[0].token);
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
  const availableLevels = rows
    .filter((r) => r.token === selectedToken)
    .map((r) => r.level)
    .sort((a, b) => a - b);
  const currentRow =
    rows.find((r) => r.token === selectedToken && r.level === selectedLevel) ||
    rows.find((r) => r.token === selectedToken);

  const cycle: FactoryCycleResult | null = currentRow
    ? calculateFactoryCycle(currentRow, prices)
    : null;

  return (
    <Layout>
      <div className="w-full max-w-[1000px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es'
              ? 'Calculadora de Crafteo y Producción'
              : 'Craft & Production Calculator'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Calcula la producción, requerimientos de insumos, tiempo de ciclo y ganancias.'
              : 'Calculate production, input requirements, cycle time, and profits.'}
          </p>
        </div>

        {/* Selection Card */}
        <Card
          title={language === 'es' ? '⚙️ Seleccionar Fábrica y Nivel' : '⚙️ Select Factory & Level'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {language === 'es' ? 'Recurso / Fábrica:' : 'Resource / Factory:'}
              </label>
              <select
                value={selectedToken}
                onChange={(e) => {
                  setSelectedToken(e.target.value);
                  const firstLvl = rows.find((r) => r.token === e.target.value)?.level || 1;
                  setSelectedLevel(firstLvl);
                }}
                className="w-full"
              >
                {uniqueTokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">
                {language === 'es' ? 'Nivel de Fábrica:' : 'Factory Level:'}
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Number(e.target.value))}
                className="w-full"
              >
                {availableLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Nivel {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Calculation Results Card */}
        {cycle && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card title={language === 'es' ? '📦 Output de Producción' : '📦 Production Output'}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 resource-item-badge">
                  <FactoryIcon symbol={cycle.row.token} size={40} />
                  <div>
                    <span className="text-sm font-extrabold text-white block">
                      {cycle.row.token} (Nv. {cycle.row.level})
                    </span>
                    <span className="text-xs text-slate-300">
                      Tiempo de ciclo:{' '}
                      <strong className="text-amber-300">{cycle.runtimeMinutes} min</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="resource-item-badge p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {language === 'es' ? 'Por Ciclo' : 'Per Cycle'}
                    </span>
                    <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                      <ResourceIcon symbol={cycle.row.output_token} size={16} />
                      {cycle.outputPerCycle}
                    </span>
                  </div>
                  <div className="resource-item-badge p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {language === 'es' ? 'Por Día' : 'Per Day'}
                    </span>
                    <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                      <ResourceIcon symbol={cycle.row.output_token} size={16} />
                      {formatNumber(cycle.outputPerDay)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title={language === 'es' ? '💰 Financiero & Insumos' : '💰 Financial & Inputs'}>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold block">
                    {language === 'es'
                      ? 'Insumos requeridos por ciclo:'
                      : 'Inputs required per cycle:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="resource-item-badge px-2.5 py-1 text-slate-200 font-bold flex items-center gap-1.5">
                      <ResourceIcon symbol={cycle.row.input_token_1} size={16} />
                      {cycle.row.input_token_1}: {cycle.input1PerCycle}
                    </span>
                    {cycle.row.input_token_2 && (
                      <span className="resource-item-badge px-2.5 py-1 text-slate-200 font-bold flex items-center gap-1.5">
                        <ResourceIcon symbol={cycle.row.input_token_2} size={16} />
                        {cycle.row.input_token_2}: {cycle.input2PerCycle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800">
                  <div className="resource-item-badge p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {language === 'es' ? 'Ganancia / Hora' : 'Profit / Hour'}
                    </span>
                    <span className="text-sm font-black text-cyan-400">
                      {formatNumber(cycle.profitPerHour)} COIN
                    </span>
                  </div>
                  <div className="resource-item-badge p-2.5">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      {language === 'es' ? 'Ganancia / Día' : 'Profit / Day'}
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {formatNumber(cycle.profitPerDay)} COIN
                    </span>
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
