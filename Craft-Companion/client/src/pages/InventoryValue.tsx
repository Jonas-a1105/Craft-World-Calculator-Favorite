import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { SkeletonDashboardPage } from '../components/Skeleton';
import { useTranslation } from '../utils/i18n';
import { getCraftworldHome } from '../services/api';
import { ResourceIcon } from '../components/GameIcon';

function formatNumber(value: unknown, digits = 2) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : '0';
}

export default function InventoryValue() {
  const { language } = useTranslation();
  const [homeData, setHomeData] = useState<any>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCraftworldHome()
      .then((home) => {
        setHomeData(home);
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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <SkeletonDashboardPage />
      </Layout>
    );

  const resources = homeData?.craftWorld?.resources || [];

  // Calculate total inventory value in COIN
  let totalValue = 0;
  const valuedItems = resources.map((r: any) => {
    const sym = (r.symbol || '').toUpperCase();
    const unitPrice = prices[sym] || 0;
    const itemValue = (r.amount || 0) * unitPrice;
    totalValue += itemValue;
    return {
      symbol: r.symbol,
      amount: r.amount || 0,
      unitPrice,
      totalValue: itemValue,
    };
  });

  valuedItems.sort((a: any, b: any) => b.totalValue - a.totalValue);

  return (
    <Layout>
      <div className="w-full max-w-[1100px] mx-auto space-y-6">
        <div className="text-center mt-4 mb-2">
          <h1
            className="text-3xl font-extrabold text-white tracking-wider"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
          >
            {language === 'es' ? 'Valor de Inventario' : 'Inventory Value'}
          </h1>
          <p className="text-sm font-medium text-slate-300 mt-1 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Estimación en tiempo real del valor en COIN de tus recursos e inventario acumulado.'
              : 'Real-time estimation of the COIN value of your accumulated inventory.'}
          </p>
        </div>

        {/* Total Value Banner Card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <ResourceIcon symbol="Coin" size={48} />
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase block">
                  {language === 'es' ? 'Valor Total Estimado' : 'Total Estimated Value'}
                </span>
                <span className="text-3xl font-black text-amber-400">
                  {formatNumber(totalValue)} COIN
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="resource-item-badge p-2.5">
                <span className="text-slate-400 block text-[10px]">
                  {language === 'es' ? 'Recursos Distintos' : 'Distinct Items'}
                </span>
                <span className="text-white text-base">{resources.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Valued Inventory Grid */}
        <Card
          title={
            language === 'es' ? '📦 Recursos y Valor Individual' : '📦 Resources & Individual Value'
          }
        >
          {valuedItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {valuedItems.map((item: any, idx: number) => (
                <div
                  key={item.symbol || idx}
                  className="resource-item-badge p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ResourceIcon symbol={item.symbol} size={32} />
                    <div>
                      <span className="font-extrabold text-white text-sm block">{item.symbol}</span>
                      <span className="text-xs text-slate-400">
                        {formatNumber(item.amount)}{' '}
                        <span className="text-[10px]">
                          {language === 'es' ? 'unidades' : 'units'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-amber-400 font-black text-sm block">
                      {formatNumber(item.totalValue)} COIN
                    </span>
                    {item.unitPrice > 0 && (
                      <span className="text-[10px] text-slate-500 block">
                        @{formatNumber(item.unitPrice)}/u
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">
              {language === 'es'
                ? 'No se encontraron recursos en tu inventario.'
                : 'No resources found in your inventory.'}
            </p>
          )}
        </Card>
      </div>
    </Layout>
  );
}
