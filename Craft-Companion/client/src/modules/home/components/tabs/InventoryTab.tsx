import React from 'react';
import type { InventoryData, CraftWorldResource } from '../../types';
import Card from '../../../../components/Card';
import { useTranslation } from '../../../../utils/i18n';
import { formatEggName, formatBoosterName } from '../../utils/formatters';
import { FactoryIcon } from '../../../../components/GameIcon';
import { EmptyState } from '../EmptyState';
import { ScopeUnauthorizedCard } from '../ScopeUnauthorizedCard';

export interface InventoryTabProps {
  inventory?: InventoryData | CraftWorldResource[];
  onReauthorize: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, onReauthorize }) => {
  const { language } = useTranslation();

  if (!inventory || Array.isArray(inventory)) {
    return <ScopeUnauthorizedCard scope="inventory:read" onReauthorize={onReauthorize} />;
  }

  const totalEggs =
    inventory.eggs?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) ?? 0;
  const totalChests =
    inventory.chests?.reduce((sum, c) => sum + (Number(c.count) || 0), 0) ?? 0;

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-start">
        {/* Card 1: Huevos & Cofres */}
        <Card
          title={language === 'es' ? '🥚 Huevos y Cofres' : '🥚 Eggs & Chests'}
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300">
                  {language === 'es' ? 'Huevos' : 'Eggs'}
                </span>
                {inventory.eggs?.length ? (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {totalEggs} total
                  </span>
                ) : null}
              </div>

              {inventory.eggs?.length ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {inventory.eggs.map((e, i) => (
                    <div
                      key={i}
                      className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3 flex items-center justify-between transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🥚</span>
                        <span className="font-bold text-slate-200 text-xs truncate">
                          {formatEggName(e.definitionId || '')}
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-400 text-xs shrink-0">
                        x{e.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>{language === 'es' ? 'Sin huevos' : 'No eggs'}</EmptyState>
              )}
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300">
                  {language === 'es' ? 'Cofres' : 'Chests'}
                </span>
                {inventory.chests?.length ? (
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {totalChests} total
                  </span>
                ) : null}
              </div>

              {inventory.chests?.length ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {inventory.chests.map((c, i) => (
                    <div
                      key={i}
                      className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3 flex items-center justify-between transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">🎁</span>
                        <span className="font-bold text-slate-200 text-xs truncate">
                          {c.definitionId}
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-400 text-xs shrink-0">
                        x{c.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>{language === 'es' ? 'Sin cofres' : 'No chests'}</EmptyState>
              )}
            </div>
          </div>
        </Card>

        {/* Card 2: Fábricas en Reserva */}
        <Card
          title={language === 'es' ? '🏭 En Reserva' : '🏭 Stashed'}
          action={
            inventory.factoryInventory?.length ? (
              <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                {inventory.factoryInventory.length} {language === 'es' ? 'fábricas' : 'factories'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {inventory.factoryInventory?.length ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {inventory.factoryInventory.map((f, i) => (
                <div
                  key={f.id || i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                      <FactoryIcon symbol={f.definitionId} size={20} />
                    </div>
                    <span className="text-slate-200 font-bold truncate">{f.definitionId}</span>
                  </div>
                  <span className="bg-emerald-500/15 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full font-black font-mono shrink-0">
                    Nv. {(f.level ?? 0) + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {language === 'es' ? 'No hay fábricas en reserva' : 'No stashed factories'}
            </EmptyState>
          )}
        </Card>

        {/* Card 3: Boosters & Power Packs */}
        <Card
          title={language === 'es' ? '🚀 Boosters & Packs' : '🚀 Boosters & Packs'}
          action={
            inventory.availableBoosters?.length ? (
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded-full">
                {inventory.availableBoosters.length} {language === 'es' ? 'packs' : 'packs'}
              </span>
            ) : undefined
          }
          className="rounded-[32px] bg-[#18181b] shadow-xl border-none"
        >
          {inventory.availableBoosters?.length ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {inventory.availableBoosters.map((b, i) => (
                <div
                  key={i}
                  className="bg-[#202024] hover:bg-[#28282e] rounded-full p-2 px-3.5 flex justify-between items-center text-xs transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm">⚡</span>
                    <span className="text-slate-200 font-bold truncate">
                      {formatBoosterName(b.id)}
                    </span>
                  </div>
                  <span className="bg-cyan-500/15 text-cyan-400 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shrink-0">
                    x{b.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>{language === 'es' ? 'Sin boosters' : 'No boosters'}</EmptyState>
          )}
        </Card>
      </div>
    </div>
  );
};
