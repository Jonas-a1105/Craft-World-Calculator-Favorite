import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import styles from './FactoryList.module.css';
import type { FactoryCategory } from '../../types/game';

interface FactoryListProps {
  factoriesList: string[];
  activeFactory: string;
  onSelectFactory: (name: string) => void;
  getCategory: (name: string) => FactoryCategory;
  getLevelsCount: (name: string) => number;
  getConfigForResource?: (name: string) => { factories: number; level: number };
}

export const FactoryList: React.FC<FactoryListProps> = ({
  factoriesList,
  activeFactory,
  onSelectFactory,
  getCategory,
  getLevelsCount,
  getConfigForResource
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Stagger reveal animation whenever the filtered list changes
  useEffect(() => {
    if (listRef.current && listRef.current.children.length > 0) {
      anime({
        targets: listRef.current.children,
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [10, 0],
        delay: anime.stagger(15),
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [factoriesList]);

  return (
    <section className={`bento-card ${styles.card}`}>
      <div className={styles.cardHeader}>
        <h2 className="card-title">🏭 LISTA DE FABRICAS</h2>
        <span className="badge">{factoriesList.length}</span>
      </div>
      <div ref={listRef} className={styles.factoriesGrid}>
        {factoriesList.map((name) => {
          const cat = getCategory(name);
          const lvlCount = getLevelsCount(name);
          const isActive = name === activeFactory;
          const cfg = getConfigForResource ? getConfigForResource(name) : { factories: 0, level: 1 };

          const toCapitalCase = (str: string): string => {
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          };
          const iconPath = `/assets/resources/${toCapitalCase(name)}.png`;

          // Resolve badge CSS class
          const badgeClass =
            cat === 'basic' ? 'badgeBasic' : cat === 'keys' ? 'badgeKeys' : 'badgeCrafted';

          return (
            <div
              key={name}
              className={`${styles.factoryItem} ${isActive ? styles.factoryItemActive : ''}`}
              onClick={() => onSelectFactory(name)}
            >
              <div className={styles.itemLeft}>
                <img
                  src={iconPath}
                  className={styles.itemIcon}
                  alt={name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/resources/Mud.png';
                  }}
                />
                <div>
                  <span className={styles.itemName}>{name}</span>
                  <div className={styles.itemLevel}>
                    {lvlCount} niveles
                    {cfg.factories > 0 && (
                      <span className={styles.ownedInfo}>
                        {' • '}x{cfg.factories} (Lvl {cfg.level})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`badge ${badgeClass}`}>
                {cat === 'basic' ? 'Base' : cat === 'keys' ? 'Llave' : 'Craft'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
