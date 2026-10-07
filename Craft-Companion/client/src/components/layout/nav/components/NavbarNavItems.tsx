import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDragScroll } from '../../../../hooks/useDragScroll';
import { NAV_ITEMS } from '../navConfig';

interface NavbarNavItemsProps {
  language: string;
  currentPath: string;
}

export const NavbarNavItems = ({
  language,
  currentPath,
}: NavbarNavItemsProps) => {
  const { ref: navRef, dragEvents } = useDragScroll<HTMLDivElement>();

  useEffect(() => {
    if (!navRef.current) return;
    const timeout = setTimeout(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [currentPath, navRef]);

  return (
    <div
      ref={navRef}
      {...dragEvents}
      className="flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1 px-2 max-w-[850px] cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {NAV_ITEMS.map((item) => {
        const active = currentPath === item.path;
        const label = language === 'es' ? item.labelEs : item.labelEn;

        return (
          <Link
            key={item.path}
            to={item.path}
            data-active={active}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-white text-[#141415] shadow-lg shadow-white/20 scale-105'
                  : 'bg-[#202024] text-slate-300 group-hover:bg-[#29292f] group-hover:text-white group-hover:scale-105'
              }`}
            >
              {item.icon(active)}
            </div>

            <span
              className={`text-[11px] font-main transition-colors duration-200 tracking-wide ${
                active
                  ? 'text-white font-bold'
                  : 'text-slate-400 font-medium group-hover:text-slate-200'
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
