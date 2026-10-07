import React from 'react';
import { CheckCircleBold, CloseCircleLinear } from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import { CATEGORY_FILTERS } from '../services/inventoryService';

interface InventoryCategoryFilterBarProps {
  activeCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  language: string;
}

export const InventoryCategoryFilterBar: React.FC<InventoryCategoryFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  language,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 pt-1 pb-2">
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              title={cat.label}
              style={{ padding: 0 }}
              className={`relative w-11 h-11 min-w-[44px] min-h-[44px] !p-0 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 outline-none select-none ${
                isSelected
                  ? 'bg-[#292930] scale-105 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25'
                  : 'bg-[#1c1c20] hover:bg-[#25252b] hover:scale-105 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Category Pixel Icon - Exactly 26px matching resource cards */}
              {cat.id === 'earth' && <ResourceIcon symbol="Earth" size={26} />}
              {cat.id === 'water' && <ResourceIcon symbol="Water" size={26} />}
              {cat.id === 'fire' && <ResourceIcon symbol="Fire" size={26} />}
              {cat.id === 'combined' && (
                <div className="relative w-[26px] h-[26px] flex items-center justify-center shrink-0 pointer-events-none">
                  <div className="absolute top-0">
                    <ResourceIcon symbol="Earth" size={15} />
                  </div>
                  <div className="absolute bottom-0 -left-1">
                    <ResourceIcon symbol="Water" size={15} />
                  </div>
                  <div className="absolute bottom-0 -right-1">
                    <ResourceIcon symbol="Fire" size={15} />
                  </div>
                </div>
              )}
              {cat.id === 'blueprints' && (
                <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="3"
                    fill="#0284c7"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="5"
                    y="5"
                    width="6"
                    height="5"
                    stroke="#e0f2fe"
                    strokeWidth="1.2"
                    strokeDasharray="1 1"
                    fill="none"
                  />
                  <line x1="14" y1="6" x2="19" y2="6" stroke="#e0f2fe" strokeWidth="1.2" />
                  <line x1="14" y1="9" x2="18" y2="9" stroke="#e0f2fe" strokeWidth="1.2" />
                  <line
                    x1="5"
                    y1="13"
                    x2="19"
                    y2="13"
                    stroke="#bae6fd"
                    strokeWidth="1"
                    strokeDasharray="1.5 1"
                  />
                  <line x1="5" y1="16" x2="12" y2="16" stroke="#e0f2fe" strokeWidth="1.2" />
                  <line x1="15" y1="16" x2="19" y2="16" stroke="#e0f2fe" strokeWidth="1.2" />
                  <line x1="5" y1="19" x2="16" y2="19" stroke="#e0f2fe" strokeWidth="1.2" />
                </svg>
              )}
              {cat.id === 'workers' && (
                <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8C4 5 7 3 12 3C17 3 20 5 20 8H4Z" fill="#ef4444" />
                  <path d="M3 8H21V10H3V8Z" fill="#dc2626" />
                  <rect x="4" y="9" width="16" height="12" rx="2" fill="#fbbf24" />
                  <rect
                    x="5"
                    y="10"
                    width="6"
                    height="4"
                    rx="1"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                  <rect
                    x="13"
                    y="10"
                    width="6"
                    height="4"
                    rx="1"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                  <line x1="11" y1="12" x2="13" y2="12" stroke="#0f172a" strokeWidth="1.2" />
                  <rect
                    x="6"
                    y="16"
                    width="12"
                    height="4"
                    rx="1"
                    fill="#ffffff"
                    stroke="#1f2937"
                    strokeWidth="0.8"
                  />
                  <line x1="9" y1="16" x2="9" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                  <line x1="12" y1="16" x2="12" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                  <line x1="15" y1="16" x2="15" y2="20" stroke="#1f2937" strokeWidth="0.8" />
                </svg>
              )}
              {cat.id === 'banner' && (
                <svg className="w-[26px] h-[26px] shrink-0" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="2.5"
                    rx="1"
                    fill="#f59e0b"
                    stroke="#78350f"
                    strokeWidth="0.8"
                  />
                  <circle cx="2.5" cy="4.25" r="1.5" fill="#d97706" />
                  <circle cx="21.5" cy="4.25" r="1.5" fill="#d97706" />
                  <path
                    d="M5 5.5H19V19L12 16L5 19V5.5Z"
                    fill="#d946ef"
                    stroke="#86198f"
                    strokeWidth="1"
                  />
                  <circle cx="12" cy="10.5" r="2.5" fill="#ffffff" />
                </svg>
              )}

              {/* Active Green Checkmark Badge on Selected */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 text-emerald-400 bg-black/80 rounded-full flex items-center justify-center shadow-md shrink-0">
                  <CheckCircleBold className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              )}
            </button>
          );
        })}

        {/* Clear Filter button if active */}
        {activeCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            title={language === 'es' ? 'Quitar filtro' : 'Clear filter'}
            className="w-10 h-10 min-w-[40px] min-h-[40px] p-0 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center transition-all ml-1 shrink-0 cursor-pointer"
          >
            <CloseCircleLinear className="w-5 h-5 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};
