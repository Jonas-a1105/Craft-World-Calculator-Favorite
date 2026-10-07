import { useEffect, useRef, useState, useCallback } from 'react';
import { NAV_ITEMS } from '../navConfig';

interface SlotPhysicsState {
  currentScale: number;
  targetScale: number;
  currentWidth: number;
  targetWidth: number;
  isPopping: boolean;
}

export function useDockPhysics(language: string) {
  const dockStageRef = useRef<HTMLDivElement>(null);
  const dockShelfRef = useRef<HTMLDivElement>(null);
  const dockReflectionRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coreRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [tooltipText, setTooltipText] = useState<string>('');

  const physicsStatesRef = useRef<SlotPhysicsState[]>(
    NAV_ITEMS.map(() => ({
      currentScale: 1,
      targetScale: 1,
      currentWidth: 48,
      targetWidth: 48,
      isPopping: false,
    }))
  );

  const pointerPosRef = useRef<{ x: number | null; y: number | null; isNear: boolean }>({
    x: null,
    y: null,
    isNear: false,
  });

  const hoveredIndexRef = useRef<number | null>(null);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current) {
      tooltipRef.current.classList.remove('opacity-100', 'scale-100');
      tooltipRef.current.classList.add('opacity-0', 'scale-95');
    }
    hoveredIndexRef.current = null;
  }, []);

  const showTooltip = useCallback(
    (index: number) => {
      const slot = slotRefs.current[index];
      const item = NAV_ITEMS[index];
      const stage = dockStageRef.current;
      if (!slot || !item || !tooltipRef.current || !stage) return;

      const label = language === 'es' ? item.labelEs : item.labelEn;
      setTooltipText(label);

      const stageRect = stage.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      const relativeX = slotRect.left + slotRect.width / 2 - stageRect.left;
      tooltipRef.current.style.left = `${relativeX}px`;
      tooltipRef.current.classList.remove('opacity-0', 'scale-95');
      tooltipRef.current.classList.add('opacity-100', 'scale-100');
      hoveredIndexRef.current = index;
    },
    [language]
  );

  const triggerPopAnimation = useCallback((index: number) => {
    const state = physicsStatesRef.current[index];
    const core = coreRefs.current[index];

    if (state && core) {
      state.isPopping = true;
      const currScale = state.currentScale;

      core.style.setProperty('--curr-scale', currScale.toFixed(3));
      core.classList.remove('animate-dock-pop-forward');
      void core.offsetWidth; // Force reflow
      core.classList.add('animate-dock-pop-forward');

      setTimeout(() => {
        core.classList.remove('animate-dock-pop-forward');
        state.isPopping = false;
      }, 450);
    }
  }, []);

  useEffect(() => {
    let animId: number;

    const getResponsiveConfig = () => {
      const width = window.innerWidth;
      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;

      let baseSlotWidth = 48;
      if (isMobile) {
        baseSlotWidth = Math.min(36, Math.max(28, Math.floor((width - 36) / NAV_ITEMS.length) - 3));
      } else if (isTablet) {
        baseSlotWidth = 44;
      }

      return {
        baseSlotWidth,
        gap: isMobile ? 4 : 8,
        maxScale: isMobile ? 1.32 : 1.48,
        radius: isMobile ? 65 : 80,
        lerpFactor: 0.22,
        depth3D: 0,
        lateralMult: isMobile ? 0.4 : 0.7,
        dockPaddingX: isMobile ? 16 : 24,
        separatorWidth: 1.5 + (isMobile ? 6 : 8),
      };
    };

    let cfg = getResponsiveConfig();

    const onResize = () => {
      cfg = getResponsiveConfig();
    };

    window.addEventListener('resize', onResize, { passive: true });

    const handlePointer = (clientX: number, clientY: number) => {
      pointerPosRef.current.x = clientX;
      pointerPosRef.current.y = clientY;

      if (!dockShelfRef.current) return;
      const shelfRect = dockShelfRef.current.getBoundingClientRect();

      // Strict bounds: Only trigger hover when pointer actually enters the shelf area
      if (
        clientY >= shelfRect.top &&
        clientY <= shelfRect.bottom &&
        clientX >= shelfRect.left &&
        clientX <= shelfRect.right
      ) {
        pointerPosRef.current.isNear = true;
      } else {
        pointerPosRef.current.isNear = false;
        hideTooltip();
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => {
      pointerPosRef.current.isNear = false;
      pointerPosRef.current.x = null;
      pointerPosRef.current.y = null;
      hideTooltip();
    };
    const onMouseLeaveDoc = () => {
      pointerPosRef.current.isNear = false;
      pointerPosRef.current.x = null;
      pointerPosRef.current.y = null;
      hideTooltip();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveDoc, { passive: true });

    const getMagnificationFactor = (cursorX: number, itemCenterX: number, radius: number) => {
      const distance = Math.abs(cursorX - itemCenterX);
      if (distance >= radius) return 0;
      return 0.5 * (1 + Math.cos((Math.PI * distance) / radius));
    };

    const loop = () => {
      const stage = dockStageRef.current;
      const shelf = dockShelfRef.current;
      const reflection = dockReflectionRef.current;
      const states = physicsStatesRef.current;

      if (stage && shelf) {
        const stageCenterX = window.innerWidth / 2;
        const separatorIdx = NAV_ITEMS.length - 1;

        let currentTotalSlotsWidth = 0;
        for (let i = 0; i < states.length; i++) {
          currentTotalSlotsWidth += states[i].currentWidth;
        }
        const currentDockContentWidth =
          currentTotalSlotsWidth +
          (states.length - 1) * cfg.gap +
          cfg.separatorWidth;
        const dockLeftX = stageCenterX - currentDockContentWidth / 2;

        let accumulatedX = dockLeftX;
        const slotScreenCenters: number[] = [];
        for (let i = 0; i < states.length; i++) {
          if (i === separatorIdx) accumulatedX += cfg.separatorWidth;
          const center = accumulatedX + states[i].currentWidth / 2;
          slotScreenCenters.push(center);
          accumulatedX += states[i].currentWidth + cfg.gap;
        }

        let newTotalDockWidth =
          cfg.dockPaddingX + cfg.separatorWidth + (states.length - 1) * cfg.gap;

        const { x: mouseX, isNear } = pointerPosRef.current;

        for (let i = 0; i < states.length; i++) {
          const state = states[i];
          const itemCenterX = slotScreenCenters[i];

          if (isNear && mouseX !== null) {
            const factor = getMagnificationFactor(mouseX, itemCenterX, cfg.radius);
            state.targetScale = 1 + (cfg.maxScale - 1) * factor;
            const lateralExtra =
              (state.targetScale - 1) * cfg.baseSlotWidth * cfg.lateralMult;
            state.targetWidth = cfg.baseSlotWidth + lateralExtra;
          } else {
            state.targetScale = 1;
            state.targetWidth = cfg.baseSlotWidth;
          }

          const scaleDelta = state.targetScale - state.currentScale;
          if (Math.abs(scaleDelta) > 0.0004) {
            state.currentScale += scaleDelta * cfg.lerpFactor;
          } else {
            state.currentScale = state.targetScale;
          }

          const widthDelta = state.targetWidth - state.currentWidth;
          if (Math.abs(widthDelta) > 0.05) {
            state.currentWidth += widthDelta * cfg.lerpFactor;
          } else {
            state.currentWidth = state.targetWidth;
          }

          newTotalDockWidth += state.currentWidth;

          const slotEl = slotRefs.current[i];
          if (slotEl) {
            slotEl.style.width = `${state.currentWidth.toFixed(2)}px`;
            slotEl.style.zIndex = String(Math.round(state.currentScale * 100));
          }

          const coreEl = coreRefs.current[i];
          if (coreEl && !state.isPopping) {
            const scale = state.currentScale;
            // Crisp 2D scaling - prevents GPU 3D rasterization blurriness and eliminates all shadows
            if (scale > 1.002) {
              coreEl.style.transform = `scale(${scale.toFixed(3)})`;
            } else {
              coreEl.style.transform = 'none';
            }
            coreEl.style.boxShadow = 'none';
          }
        }

        const roundedWidth = Math.round(newTotalDockWidth);
        shelf.style.width = `${roundedWidth}px`;
        if (reflection) {
          reflection.style.width = `${roundedWidth}px`;
        }

        if (hoveredIndexRef.current !== null && tooltipRef.current && stage) {
          const hoveredIdx = hoveredIndexRef.current;
          const currentSlot = slotRefs.current[hoveredIdx];
          if (currentSlot) {
            const stageRect = stage.getBoundingClientRect();
            const rect = currentSlot.getBoundingClientRect();
            tooltipRef.current.style.left = `${rect.left + rect.width / 2 - stageRect.left}px`;
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('mouseleave', onMouseLeaveDoc);
    };
  }, [hideTooltip]);

  return {
    dockStageRef,
    dockShelfRef,
    dockReflectionRef,
    tooltipRef,
    slotRefs,
    coreRefs,
    tooltipText,
    showTooltip,
    hideTooltip,
    triggerPopAnimation,
  };
}
