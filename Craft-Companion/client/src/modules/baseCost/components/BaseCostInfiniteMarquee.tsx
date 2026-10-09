import React from 'react';
import { ResourceIcon } from '../../../components/GameIcon';
import { formatCoin } from '../services/baseCostCalculatorService';

export interface MarqueeResourceItem {
  token: string;
  name: string;
  price: number;
  category?: string;
  color?: string;
}

interface BaseCostInfiniteMarqueeProps {
  items: MarqueeResourceItem[];
}

export const BaseCostInfiniteMarquee: React.FC<BaseCostInfiniteMarqueeProps> = ({
  items,
}) => {
  if (!items || items.length === 0) return null;

  // Duplicate the list to create a seamless infinite loop
  const displayItems = [...items, ...items];

  return (
    <div className="w-full overflow-hidden select-none relative group py-1">
      {/* Edge gradients matching app background for smooth fade in/out */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#141415] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#141415] to-transparent z-10" />

      {/* Marquee Track Container */}
      <div className="flex gap-3 w-max animate-base-cost-marquee group-hover:[animation-play-state:paused]">
        {displayItems.map((item, idx) => (
          <div
            key={`${item.token}-${idx}`}
            className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#18181c] hover:bg-[#202026] transition-all shadow-md shrink-0 border-none select-none cursor-default"
          >
            {/* Resource Icon from App */}
            <ResourceIcon symbol={item.token} size={28} className="drop-shadow-sm shrink-0" />

            {/* Token Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-slate-100">
                  {item.name}
                </span>
                {item.category && (
                  <span className="text-[9px] font-mono uppercase text-slate-500">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-300">
                <span>{formatCoin(item.price)}</span>
                <ResourceIcon symbol="COIN" size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded CSS for smooth 60fps infinite marquee animation */}
      <style>{`
        @keyframes baseCostMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-base-cost-marquee {
          animation: baseCostMarquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
};
