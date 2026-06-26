import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import styles from './BentoGrid.module.css';

interface BentoGridProps {
  children: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      // Staggered bento cards reveal animation using anime.js
      anime({
        targets: gridRef.current.children,
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.95, 1],
        easing: 'spring(1, 80, 12, 0)',
        delay: anime.stagger(80)
      });
    }
  }, []);

  return (
    <main ref={gridRef} className={styles.grid}>
      {children}
    </main>
  );
};
