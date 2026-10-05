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
import { extractPriceMap } from '../services/priceService';
import { ResourceIcon, FactoryIcon } from '../components/GameIcon';
import { Badge } from '../components/ui';
import { formatNumber } from '../utils/formatters';

export default function UpgradeAdvisor() {
  const { language } = useTranslation();
  const [rows, setRows] = useState<FactoryDataRow[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFactoryData(), getCraftworldHome().catch(() => null)])
      .then(([factoryRows, home]) => {
        setRows(factoryRows);
        setPrices(extractPriceMap(home));
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
            className="text-3xl font-extrabold text-white tracking-wider font-main"
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
                className="p-4 rounded-2xl bg-[#151518] border-none transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <FactoryIcon symbol={rec.row.token} size={40} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-white text-base">{rec.row.token}</h4>
                      <Badge variant="basic" size="sm">
                        Nv. {rec.row.level} ➔ Nv. {rec.row.level + 1}
                      </Badge>
                      {rec.paybackDays !== null && (
                        <Badge variant="warning" size="sm">
                          {language === 'es'
                            ? `Retorno en ${formatNumber(rec.paybackDays, 1)} días`
                            : `ROI in ${formatNumber(rec.paybackDays, 1)} days`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-main">{rec.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right font-main">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      {language === 'es' ? 'Ganancia extra / día' : 'Extra profit / day'}
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      +{formatNumber(rec.addedProfitPerDay)} COIN
                    </span>
                  </div>
                  {rec.upgradeCost !== null && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        {language === 'es' ? 'Costo mejora' : 'Upgrade cost'}
                      </span>
                      <span className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1 font-mono">
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
