import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { ResourceIcon, getFactoryIconUrl, getFactoryPauseIconUrl } from '../../../components/GameIcon';
import { Badge } from '../../../components/ui';
import { useTranslation } from '../../../utils/i18n';

interface Props {
  item: CatalogItem;
}

export const SelectedBanner: React.FC<Props> = ({ item }) => {
  const { language } = useTranslation();
  const [isPaused, setIsPaused] = useState(false);
  const [candidateIdx, setCandidateIdx] = useState(0);

  const rawName = language === 'es' ? item.nameEs : item.name;
  const cleanName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const norm = (item.iconSymbol || '').trim().toLowerCase();
  const cap = norm.charAt(0).toUpperCase() + norm.slice(1);

  const candidates = React.useMemo(() => {
    if (isPaused) {
      return [
        getFactoryPauseIconUrl(item.iconSymbol),
        `/assets/factories/${cap}Pause.png`,
        `/assets/factories/${cap}.png`,
        `/assets/factories/${cap}.gif`,
        `/assets/resources/${cap}.png`,
      ];
    }
    return [
      getFactoryIconUrl(item.iconSymbol),
      `/assets/factories/${cap}.gif`,
      `/assets/factories/${cap}Modal.png`,
      `/assets/factories/${cap}.png`,
      `/assets/factories/${cap}Pause.png`,
      `/assets/resources/${cap}.png`,
    ];
  }, [item.iconSymbol, isPaused, cap]);

  React.useEffect(() => {
    setCandidateIdx(0);
  }, [item.id, isPaused]);

  const hasExhaustedCandidates = candidateIdx >= candidates.length;
  const currentImgUrl = candidates[candidateIdx];

  const handleImgError = () => {
    setCandidateIdx((prev) => prev + 1);
  };

  return (
    <div className="bg-[#18181c] rounded-[22px] sm:rounded-[28px] p-3.5 sm:p-5 mb-5 shadow-xl border-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 select-none min-w-0 w-full overflow-hidden">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Factory Visual Frame with Animation */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-[#121216] border border-white/[0.06] flex items-center justify-center shrink-0 shadow-lg group">
          {!hasExhaustedCandidates ? (
            <img
              key={`${item.id}-${isPaused}-${candidateIdx}`}
              src={currentImgUrl}
              alt={cleanName}
              className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:scale-105 select-none"
              onError={handleImgError}
            />
          ) : (
            <ResourceIcon symbol={item.iconSymbol} size={40} />
          )}

          {/* Resource logo badge overlay */}
          <div
            className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-[#18181c] rounded-full shadow-lg border border-white/10 flex items-center justify-center pointer-events-none"
            title={`${cleanName} (${item.id})`}
          >
            <ResourceIcon symbol={item.iconSymbol} size={18} />
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="text-base sm:text-lg md:text-xl font-game text-white tracking-wide leading-tight break-words"
              style={{
                fontFamily: "'TheImpostor', sans-serif",
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              }}
              title={rawName}
            >
              {cleanName}
            </h2>
            <Badge variant="neutral" size="sm" className="bg-[#24242a] text-slate-300 rounded-full border-none shrink-0 text-[10px] font-semibold py-0.5 px-2">
              {language === 'es' ? item.badgeEs : item.badge}
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Token: <span className="text-slate-200 font-semibold">{item.id}</span>
          </p>
        </div>
      </div>

      {/* Animation toggle button */}
      {!item.isBuilding && (
        <div className="flex justify-end sm:justify-start shrink-0">
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-[#121216] text-[11px] font-mono text-slate-400 hover:text-slate-200 border-none transition-colors shadow-sm cursor-pointer"
            title={language === 'es' ? 'Pausar o reanudar animación' : 'Pause or play animation'}
          >
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{isPaused ? (language === 'es' ? 'Pausado' : 'Paused') : (language === 'es' ? 'Animación activa' : 'Live animation')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
