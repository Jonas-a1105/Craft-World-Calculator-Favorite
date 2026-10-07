import React from 'react';
import { CatalogItem } from '../types';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  resources: CatalogItem[];
  buildings: CatalogItem[];
  selectedItemId: string;
  onSelect: (item: CatalogItem) => void;
}

export const CategoryChips: React.FC<Props> = ({
  resources,
  buildings,
  selectedItemId,
  onSelect,
}) => {
  const { language } = useTranslation();

  return (
    <div className="bg-[#18181c] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 shadow-xl border-none space-y-3 mb-6 w-full min-w-0 max-w-full overflow-hidden select-none">
      {/* Resources row */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 cursor-grab active:cursor-grabbing">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-indigo-400 uppercase shrink-0 select-none px-1">
          {language === 'es' ? 'RECURSOS' : 'RESOURCES'}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {resources.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-none transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : 'bg-[#141416] text-slate-400 hover:text-slate-200 hover:bg-[#202026]'
                }`}
              >
                <ResourceIcon symbol={item.iconSymbol} size={14} />
                <span className="whitespace-nowrap">{language === 'es' ? item.nameEs : item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle inner card separator */}
      <div className="h-px bg-white/[0.04] w-full" />

      {/* Buildings row */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 cursor-grab active:cursor-grabbing">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-emerald-400 uppercase shrink-0 select-none px-1">
          {language === 'es' ? 'EDIFICIOS' : 'BUILDINGS'}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {buildings.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-none transition-all duration-150 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : 'bg-[#141416] text-slate-400 hover:text-slate-200 hover:bg-[#202026]'
                }`}
              >
                <FactoryIcon symbol={item.iconSymbol} size={14} />
                <span className="whitespace-nowrap">{language === 'es' ? item.nameEs : item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
