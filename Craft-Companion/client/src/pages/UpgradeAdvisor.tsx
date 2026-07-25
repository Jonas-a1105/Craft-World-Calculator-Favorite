import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { loadFactoryData, FactoryDataRow } from '../services/factoryData';
import {
  calculateUpgradeRecommendation,
  UpgradeRecommendation,
} from '../services/craftworldCalculations';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function UpgradeAdvisor() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
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

  const recommendations: UpgradeRecommendation[] = calculateUpgradeRecommendation(rows, prices);

  return (
    <Layout>
      <div className="w-full max-w-[1200px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Asesor de Mejoras' : 'Upgrade Advisor'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Recomendaciones inteligentes de mejora ordenadas por retorno de inversión (ROI).'
              : 'Smart upgrade recommendations ranked by Return on Investment (ROI).'}
          </p>
        </div>

        <Card
          title={
            language === 'es'
              ? `🧠 Recomendaciones de Mejora (${recommendations.length})`
              : `🧠 Upgrade Recommendations (${recommendations.length})`
          }
        >
          <div className="space-y-3">
            {recommendations.slice(0, 30).map((rec, i) => (
              <div
                key={i}
                className="resource-item-badge p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <FactoryIcon symbol={rec.row.token} size={40} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base">{rec.row.token}</h4>
                      <span className="bg-emerald-950 text-emerald-300 text-xs px-2 py-0.5 rounded font-bold">
                        Lv. {rec.row.level} ➔ Lv. {rec.row.level + 1}
                      </span>
                      {rec.paybackDays !== null && (
                        <span className="bg-amber-950 text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Retorno en {formatNumber(rec.paybackDays, 1)} días
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{rec.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {language === 'es' ? 'Ganancia extra / día' : 'Extra profit / day'}
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      +{formatNumber(rec.addedProfitPerDay)} COIN
                    </span>
                  </div>
                  {rec.upgradeCost !== null && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {language === 'es' ? 'Costo mejora' : 'Upgrade cost'}
                      </span>
                      <span className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                        <ResourceIcon symbol={rec.nextRow?.upgrade_token || 'Coin'} size={14} />
                        {formatNumber(rec.upgradeCost)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
