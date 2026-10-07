import React from 'react';
import type { PurchasesData } from '../../types';
import Card from '../../../../components/Card';
import { useTranslation } from '../../../../utils/i18n';
import { formatShopItem, formatAdPlacement } from '../../utils/formatters';
import { ResourceIcon } from '../../../../components/GameIcon';
import { StatusBadge } from '../StatusBadge';
import { EmptyState } from '../EmptyState';
import { ScopeUnauthorizedCard } from '../ScopeUnauthorizedCard';

export interface PurchasesTabProps {
  purchases?: PurchasesData;
  onReauthorize: () => void;
}

export const PurchasesTab: React.FC<PurchasesTabProps> = ({ purchases, onReauthorize }) => {
  const { language } = useTranslation();

  if (!purchases) {
    return <ScopeUnauthorizedCard scope="purchases:read" onReauthorize={onReauthorize} />;
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
        {/* Card 1: Beneficios & Pases */}
        <Card
          title={language === 'es' ? '💎 Beneficios & Pases' : '💎 Perks & Pass'}
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          <div className="space-y-2.5 text-xs">
            <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center transition-colors shadow-sm">
              <span className="text-slate-200 font-semibold flex items-center gap-2">
                <span>🚫</span>
                <span>{language === 'es' ? 'Sin Anuncios' : 'No-Ads Active'}</span>
              </span>
              <StatusBadge
                active={Boolean(purchases.isNoAdsActive)}
                text={
                  purchases.isNoAdsActive
                    ? language === 'es'
                      ? 'Activo'
                      : 'Active'
                    : language === 'es'
                      ? 'Inactivo'
                      : 'Inactive'
                }
              />
            </div>

            <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center transition-colors shadow-sm">
              <span className="text-slate-200 font-semibold flex items-center gap-2">
                <span>🔄</span>
                <span>{language === 'es' ? 'Transferencias' : 'Transfer Active'}</span>
              </span>
              <StatusBadge
                active={Boolean(purchases.isTransferActive)}
                text={
                  purchases.isTransferActive
                    ? language === 'es'
                      ? 'Activo'
                      : 'Active'
                    : language === 'es'
                      ? 'Inactivo'
                      : 'Inactive'
                }
              />
            </div>

            {purchases.crystalPass && (
              <div className="bg-[#202024] rounded-[24px] p-3.5 space-y-2 shadow-sm border-none">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                    <ResourceIcon symbol="Coin" size={16} /> Crystal Pass
                  </span>
                  <StatusBadge
                    active={purchases.crystalPass.hasActivePass}
                    text={purchases.crystalPass.hasActivePass ? 'Activo' : 'Inactivo'}
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400">
                    {language === 'es' ? 'Días Restantes' : 'Remaining Days'}:
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {purchases.crystalPass.remainingDays} / {purchases.crystalPass.maxDays}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    {language === 'es' ? 'Cristales Reclamables' : 'Claimable Crystals'}:
                  </span>
                  <span className="font-mono font-black text-emerald-400">
                    {purchases.crystalPass.claimableCrystals}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Historial de Tienda */}
        <Card
          title={language === 'es' ? '🛍️ Historial de Tienda' : '🛍️ Shop Purchases'}
          action={
            purchases.shopItemPurchases?.length ? (
              <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-full">
                {purchases.shopItemPurchases.length} {language === 'es' ? 'compras' : 'items'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {purchases.shopItemPurchases?.length ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {purchases.shopItemPurchases.map((p, i) => (
                <div
                  key={i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                >
                  <span className="text-slate-200 font-bold truncate pr-2">
                    {formatShopItem(p.shopItemId, language)}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                    {new Date(p.purchasedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'Sin compras en tienda' : 'No shop purchases'}
            </EmptyState>
          )}
        </Card>

        {/* Card 3: Anuncios Vistos */}
        <Card
          title={language === 'es' ? '📺 Anuncios Vistos' : '📺 Ad Watch Counts'}
          action={
            purchases.adWatchCounts?.length ? (
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded-full">
                {purchases.adWatchCounts.reduce(
                  (acc, a) => acc + (Number(a.count) || 0),
                  0,
                )}{' '}
                {language === 'es' ? 'total' : 'total'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {purchases.adWatchCounts?.length ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {purchases.adWatchCounts.map((ad, i) => (
                <div
                  key={i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="text-sm">📺</span>
                    <span className="text-slate-200 font-bold truncate">
                      {formatAdPlacement(ad.adPlacement, language)}
                    </span>
                  </div>
                  <span className="bg-cyan-500/15 text-cyan-400 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                    x{ad.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'Sin conteos de anuncios' : 'No ad counts'}
            </EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};
