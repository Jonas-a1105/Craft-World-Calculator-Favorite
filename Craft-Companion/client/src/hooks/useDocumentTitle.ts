import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage the browser document title.
 * Provides a clean fallback to the brand name on unmount.
 */
export function useDocumentTitle(title?: string, brand = 'Craft Companion') {
  useEffect(() => {
    const originalTitle = document.title;
    if (title) {
      document.title = `${title} | ${brand}`;
    } else {
      document.title = `${brand} - Calculadora de Economía para CraftWorld`;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [title, brand]);
}

export default useDocumentTitle;
