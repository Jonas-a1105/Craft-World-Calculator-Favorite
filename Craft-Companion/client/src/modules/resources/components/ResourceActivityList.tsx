import React from 'react';
import { AltArrowRightLinear, TagPriceBold, CheckCircleBold } from 'solar-icon-set';
import { ResourceIcon } from '../../../components/GameIcon';
import type { ActivityTrade } from '../types';

interface ResourceActivityListProps {
  trades: ActivityTrade[];
}

export const ResourceActivityList: React.FC<ResourceActivityListProps> = ({ trades }) => {
  return (
    <div className="space-y-3 pt-2">
      <h2 className="font-title text-xs md:text-sm text-white tracking-wide uppercase px-1">
        ACTIVITY
      </h2>

      <div className="space-y-2.5">
        {trades.map((t: ActivityTrade) => (
          <div
            key={t.id}
            className="w-full bg-[#202024] hover:bg-[#28282e] p-2.5 pr-4 rounded-[28px] flex items-center justify-between transition-colors shadow-md border-none select-none"
          >
            {/* Left: Avatar container matching resource card & Trade amounts */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#151518] flex items-center justify-center shrink-0">
                <ResourceIcon symbol={t.inSymbol} size={26} />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="font-mono text-xs sm:text-sm font-bold text-white">
                  {t.inAmount}
                </span>

                {/* Directional Arrow */}
                <AltArrowRightLinear className="w-4 h-4 text-slate-500 shrink-0" />

                {/* Output Token Icon & Amount */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <ResourceIcon symbol={t.outSymbol} size={20} />
                  <span className="font-mono text-xs sm:text-sm font-bold text-white">
                    {t.outAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Price Tag and Green Checkmark */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-2">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                <TagPriceBold className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                <span>{t.unitPrice}</span>
              </div>

              {/* Green Checkmark */}
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircleBold className="w-4 h-4 shrink-0" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
