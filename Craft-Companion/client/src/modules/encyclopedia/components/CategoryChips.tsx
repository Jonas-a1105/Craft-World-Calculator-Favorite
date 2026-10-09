import React from 'react';
import { CatalogItem } from '../types';
import { ResourceIcon, FactoryIcon } from '../../../components/GameIcon';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  resources: CatalogItem[];
  buildings: CatalogItem[];
  events?: CatalogItem[];
  selectedItemId: string;
  onSelect: (item: CatalogItem) => void;
  showEvents?: boolean;
}

export const CategoryChips: React.FC<Props> = ({
  resources,
  buildings,
  events,
  selectedItemId,
  onSelect,
  showEvents = true,
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border-none outline-none ring-0 transition-all duration-150 shrink-0 select-none ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/25'
                    : 'bg-[#141416] text-slate-400 font-medium hover:text-slate-200 hover:bg-[#202026]'
                }`}
              >
                <ResourceIcon symbol={item.iconSymbol} size={15} />
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border-none outline-none ring-0 transition-all duration-150 shrink-0 select-none ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/25'
                    : 'bg-[#141416] text-slate-400 font-medium hover:text-slate-200 hover:bg-[#202026]'
                }`}
              >
                <FactoryIcon symbol={item.iconSymbol} size={15} />
                <span className="whitespace-nowrap">{language === 'es' ? item.nameEs : item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events row */}
      {showEvents && events && events.length > 0 && (
        <>
          <div className="h-px bg-white/[0.04] w-full" />
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-0.5 w-full min-w-0 cursor-grab active:cursor-grabbing">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-purple-400 uppercase shrink-0 select-none px-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {language === 'es' ? 'EVENTOS' : 'EVENTS'}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {events.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border-none outline-none ring-0 transition-all duration-150 shrink-0 select-none ${
                      isSelected
                        ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30'
                        : 'bg-[#141416] text-purple-300/80 font-medium hover:text-purple-200 hover:bg-[#221c2c]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span className="whitespace-nowrap">{language === 'es' ? item.nameEs : item.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 font-mono">
                      {language === 'es' ? item.badgeEs : item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
