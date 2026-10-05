import { useRef, useCallback } from 'react';

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.8;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  return {
    ref,
    dragEvents: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
    },
  };
}

export default useDragScroll;
