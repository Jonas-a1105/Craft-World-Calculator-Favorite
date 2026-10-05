import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon } from '../components/GameIcon';
import { Input, Badge } from '../components/ui';
import { formatNumber } from '../utils/formatters';

export default function Prices() {
  const { language } = useTranslation();
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCraftworldHome()
      .then((home) => setPriceData(home?.priceList))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const prices: Array<{ referenceSymbol: string; amount: number; recommendation: string }> =
    priceData?.prices || [];

  const filtered = prices.filter((p) =>
    p.referenceSymbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider font-main"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Precios del Mercado' : 'Market Prices'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Lista oficial de precios en vivo del juego con recomendación de mercado.'
              : 'Official live game price list with market recommendations.'}
          </p>
        </div>

        {/* Search */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <Input
                type="text"
                placeholder={language === 'es' ? 'Buscar recurso...' : 'Search resource...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="text-xs text-slate-400 font-bold self-end sm:self-center">
              {language === 'es' ? 'Moneda base:' : 'Base currency:'}{' '}
              <strong className="text-amber-400">{priceData?.baseSymbol || 'COIN'}</strong>
            </div>
          </div>
        </Card>

        {/* Prices Grid */}
        <Card
          title={
            language === 'es'
              ? `📊 Cotizaciones de Mercado (${filtered.length})`
              : `📊 Market Prices (${filtered.length})`
          }
        >
          {filtered.length ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((item, idx) => {
                const rec = (item.recommendation || '').toUpperCase();
                const badgeVariant =
                  rec === 'BUY' ? 'success' : rec === 'SELL' ? 'danger' : 'neutral';

                return (
                  <div
                    key={item.referenceSymbol || idx}
                    className="p-3.5 flex items-center justify-between rounded-2xl bg-[#151518] border-none transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <ResourceIcon symbol={item.referenceSymbol} size={34} />
                      <div>
                        <span className="font-extrabold text-white text-sm block">
                          {item.referenceSymbol}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Ref. Price
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-amber-400 font-black text-sm block font-mono">
                        {formatNumber(item.amount)} COIN
                      </span>
                      {rec && (
                        <Badge variant={badgeVariant} size="sm" className="mt-1">
                          {rec}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">
              {language === 'es'
                ? 'No se encontraron precios que coincidan.'
                : 'No matching prices found.'}
            </p>
          )}
        </Card>
      </div>
    </Layout>
  );
}
