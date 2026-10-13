import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad de modales (QW6): al abrirse — mueve el foco dentro del
 * diálogo, atrapa Tab/Shift+Tab en su contenido y, al cerrarse, devuelve el
 * foco al elemento que abrió el modal. El cierre con Escape y el bloqueo del
 * scroll del body lo gestiona cada modal (ya existente).
 *
 * Uso: `const dialogRef = useModalA11y(isOpen); <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true">…`
 */
export function useModalA11y(isOpen: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Evitar scroll visual al enfocar programáticamente dentro del modal.
    const moveInitialFocus = () => {
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      (first ?? dialog).focus({ preventScroll: true });
    };
    // Pequeño defer para esperar portales/animaciones de entrada
    const raf = requestAnimationFrame(moveInitialFocus);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !dialog.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else if (!active || active === last || !dialog.contains(active)) {
        first.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurar el foco al disparador que abrió el modal
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        prev.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return dialogRef;
}

export default useModalA11y;
