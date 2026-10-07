import React from 'react';
import type { HomeTabId, HomeTabConfig } from '../types';
import { useTranslation } from '../../../utils/i18n';

export interface HomeTabsNavProps {
  activeTab: HomeTabId;
  onTabChange: (tab: HomeTabId) => void;
}

export const HomeTabsNav: React.FC<HomeTabsNavProps> = ({ activeTab, onTabChange }) => {
  const { language } = useTranslation();

  const tabs: HomeTabConfig[] = [
    { id: 'overview', label: language === 'es' ? 'Visión General' : 'Overview' },
    { id: 'craft', label: language === 'es' ? 'Crafting & Bóvedas' : 'Crafting & Vaults' },
    {
      id: 'inventory',
      label: language === 'es' ? 'Inventario & Cofres' : 'Inventory & Chests',
    },
    { id: 'exchange', label: language === 'es' ? 'Mercado / Exchange' : 'Exchange' },
    { id: 'onchain', label: language === 'es' ? 'On-Chain & Wallets' : 'On-Chain' },
    {
      id: 'purchases',
      label: language === 'es' ? 'Pases & Compras' : 'Passes & Purchases',
    },
  ];

  return (
    <div className="w-full min-w-0 border-b border-white/10 overflow-hidden">
      <div className="flex items-center justify-start lg:justify-center gap-1 sm:gap-3 md:gap-6 overflow-x-auto scroll-smooth whitespace-nowrap px-1 sm:px-2 pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-[13px] tracking-wider uppercase transition-colors shrink-0 cursor-pointer border-b-2 bg-transparent ${
                isActive
                  ? 'text-emerald-400 border-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border-transparent font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
