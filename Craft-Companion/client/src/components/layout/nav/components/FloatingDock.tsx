import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../utils/i18n';
import { NAV_ITEMS } from '../navConfig';
import { useDockPhysics } from '../hooks/useDockPhysics';
import './FloatingDock.css';

export const FloatingDock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const {
    dockStageRef,
    dockShelfRef,
    dockReflectionRef,
    tooltipRef,
    slotRefs,
    coreRefs,
    tooltipText,
    showTooltip,
    hideTooltip,
    showActivePageBadge,
    triggerPopAnimation,
  } = useDockPhysics(language);

  const handleSlotClick = (index: number, path: string) => {
    triggerPopAnimation(index);
    showActivePageBadge(index, 2000);
    navigate(path);
  };

  const currentPath = location.pathname;

  // Auto-scroll active item into center and show page name popover badge on mobile
  React.useEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex((item) => item.path === currentPath);
    if (activeIndex === -1) return;

    const shelf = dockShelfRef.current;
    const slot = slotRefs.current[activeIndex];

    if (shelf && slot) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const timer = setTimeout(() => {
          const targetScrollLeft = slot.offsetLeft + slot.offsetWidth / 2 - shelf.clientWidth / 2;
          shelf.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'smooth',
          });
          showActivePageBadge(activeIndex, 2200);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPath, showActivePageBadge]);

  return (
    <div
      ref={dockStageRef}
      id="dock-stage"
      className="dock-perspective-stage fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex flex-col items-center justify-end max-w-full"
    >
      {/* Floating Dynamic Tooltip / Page Name Popover Badge */}
      <div
        ref={tooltipRef}
        id="dock-tooltip"
        className="absolute pointer-events-none opacity-0 scale-95 transition-[opacity,transform] duration-200 ease-out z-50 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-100 tracking-wide border-0 bg-[#1c1d24]/95 backdrop-blur-md whitespace-nowrap shadow-none"
        style={{
          bottom: 'calc(100% + 14px)',
          transform: 'translateX(-50%)',
        }}
      >
        <span>{tooltipText}</span>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#1c1d24]/95 border-0" />
      </div>

      {/* Primary macOS Glass Shelf (Swipeable on Mobile) */}
      <div
        ref={dockShelfRef}
        id="dock-shelf"
        className="glass-dock relative flex items-center justify-start sm:justify-center px-2.5 sm:px-3 rounded-[24px] sm:rounded-[26px] overflow-x-auto sm:overflow-visible no-scrollbar pointer-events-auto scroll-smooth max-w-[calc(100vw-20px)]"
      >
        <div
          id="dock-items-wrapper"
          className="flex items-center gap-1.5 sm:gap-2 relative shrink-0"
        >
          {NAV_ITEMS.map((item, index) => {
            const active = currentPath === item.path;
            const isSettings = index === NAV_ITEMS.length - 1;

            return (
              <React.Fragment key={item.path}>
                {isSettings && (
                  <div
                    className="dock-separator mx-0.5 sm:mx-1"
                    aria-hidden="true"
                  />
                )}

                <div
                  ref={(el) => {
                    slotRefs.current[index] = el;
                  }}
                  data-name={language === 'es' ? item.labelEs : item.labelEn}
                  className="dock-slot relative h-[44px] sm:h-[50px] flex items-center justify-center cursor-pointer shrink-0"
                  style={{ width: '48px' }}
                  onMouseEnter={() => showTooltip(index)}
                  onMouseLeave={hideTooltip}
                  onClick={() => handleSlotClick(index, item.path)}
                  title={language === 'es' ? item.labelEs : item.labelEn}
                >
                  <div
                    ref={(el) => {
                      coreRefs.current[index] = el;
                    }}
                    className={`dock-icon-core w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] rounded-[12px] sm:rounded-[15px] flex items-center justify-center border-0 outline-none ${
                      active ? 'is-active' : ''
                    }`}
                  >
                    {item.icon(active)}
                  </div>

                  <span
                    className={`active-dot absolute -bottom-1 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full transition-opacity duration-200 ${
                      active
                        ? 'bg-emerald-400 opacity-100'
                        : 'bg-white/40 opacity-0'
                    }`}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mirrored Reflection Beneath Dock */}
      <div
        ref={dockReflectionRef}
        id="dock-reflection-shelf"
        className="dock-reflection glass-dock absolute rounded-[22px] sm:rounded-[26px] pointer-events-none -bottom-4 sm:-bottom-5"
        style={{ height: '36px', width: '500px' }}
      />
    </div>
  );
};

export default FloatingDock;
