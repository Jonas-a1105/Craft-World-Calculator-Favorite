import React from 'react';
import type { CraftData } from '../../types';
import Card from '../../../../components/Card';
import { useTranslation } from '../../../../utils/i18n';
import { formatNumber } from '../../../../utils/formatters';
import { displayNumber } from '../../utils/formatters';
import { ResourceIcon, FactoryIcon } from '../../../../components/GameIcon';
import { EmptyState } from '../EmptyState';
import { ScopeUnauthorizedCard } from '../ScopeUnauthorizedCard';

export interface CraftTabProps {
  craft?: CraftData;
  onReauthorize: () => void;
}

export const CraftTab: React.FC<CraftTabProps> = ({ craft, onReauthorize }) => {
  const { language } = useTranslation();

  if (!craft) {
    return <ScopeUnauthorizedCard scope="craft:read" onReauthorize={onReauthorize} />;
  }

  const unlockedVaults = craft.vaults?.filter((v) => v.isUnlocked)?.length ?? 0;
  const totalVaults = craft.vaults?.length ?? 0;
  const powerTotal = craft.power || 0;
  const powerUsed = craft.powerUsed || 0;
  const powerAvail = Math.max(0, powerTotal - powerUsed);
  const powerPercent =
    powerTotal > 0
      ? Math.min(100, Math.max(0, Math.round((powerAvail / powerTotal) * 100)))
      : 0;

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
        {/* Card 1: Energía y Puntos */}
        <Card
          title={language === 'es' ? '⚡ Energía y Puntos' : '⚡ Power & Points'}
          action={
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full">
              {powerPercent}% {language === 'es' ? 'disp.' : 'avail.'}
            </span>
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          <div className="space-y-3">
            <div className="bg-[#202024] rounded-[24px] p-4 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">
                  {language === 'es' ? 'Poder Disponible' : 'Available Power'}
                </span>
                <span className="text-cyan-400 font-mono font-black text-xs">
                  {formatNumber(powerAvail)} / {formatNumber(craft.power)}
                </span>
              </div>
              <div className="w-full bg-[#151518] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${powerPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-[#202024] hover:bg-[#28282e] rounded-full p-3 px-4 flex justify-between items-center text-xs transition-colors shadow-sm">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <span>🏋️</span>
                <span>{language === 'es' ? 'Puntos de Habilidad' : 'Skill Points'}</span>
              </span>
              <strong className="text-purple-400 font-mono font-black text-sm">
                {displayNumber(craft.skillPoints)}
              </strong>
            </div>
          </div>
        </Card>

        {/* Card 2: Bóvedas (Vaults) */}
        <Card
          title={language === 'es' ? '🏛️ Bóvedas (Vaults)' : '🏛️ Vaults'}
          action={
            totalVaults ? (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {unlockedVaults}/{totalVaults} {language === 'es' ? 'activas' : 'active'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {craft.vaults?.length ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {craft.vaults.map((v, i) => (
                <div
                  key={v.symbol || i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                      <ResourceIcon symbol={v.symbol} size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block leading-tight truncate">
                        {v.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight block">
                        {v.isUnlocked
                          ? language === 'es'
                            ? 'Desbloqueado'
                            : 'Unlocked'
                          : language === 'es'
                            ? 'Bloqueado'
                            : 'Locked'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-emerald-400 font-black font-mono block">
                      {formatNumber(v.amount)}
                    </span>
                    <span className="text-slate-500 text-[10px] font-mono block">
                      / {formatNumber(v.capacity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>{language === 'es' ? 'Sin datos de bóvedas' : 'No vaults data'}</EmptyState>
          )}
        </Card>

        {/* Card 3: Taller (Workshop) */}
        <Card
          title={language === 'es' ? '🛠️ Taller (Workshop)' : '🛠️ Workshop'}
          action={
            craft.workshop?.length ? (
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full">
                {craft.workshop.length} {language === 'es' ? 'talleres' : 'workshops'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {craft.workshop?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {craft.workshop.map((w, i) => (
                <div
                  key={w.symbol || i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2.5 px-3 flex items-center justify-between text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1.5">
                    <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                      <FactoryIcon symbol={w.symbol} size={20} />
                    </div>
                    <span className="text-slate-200 font-bold text-xs truncate">{w.symbol}</span>
                  </div>
                  <span className="bg-amber-500/15 text-amber-400 text-[11px] px-2 py-0.5 rounded-full font-black font-mono shrink-0">
                    Nv. {w.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>{language === 'es' ? 'Sin datos de taller' : 'No workshop data'}</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};
