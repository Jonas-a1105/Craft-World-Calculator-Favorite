import React, { useState, useEffect, useRef } from 'react';
import styles from './ResourceSelectorDropdown.module.css';

interface ResourceSelectorDropdownProps {
  activeFactory: string;
  factoriesList: string[];
  onSelectFactory: (name: string) => void;
}

export const ResourceSelectorDropdown: React.FC<ResourceSelectorDropdownProps> = ({
  activeFactory,
  factoriesList,
  onSelectFactory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getResourceIconPath = (symbol: string): string => {
    if (!symbol) return '/assets/resources/Sulfur.png';
    const formatted = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    return `/assets/resources/${formatted}.png`;
  };

  const handleItemClick = (name: string) => {
    onSelectFactory(name);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.triggerBtn} ${isOpen ? styles.active : ''}`}
        type="button"
        title="Seleccionar fábrica activa"
      >
        <img
          src={getResourceIconPath(activeFactory)}
          className={styles.triggerIcon}
          alt={activeFactory || 'Recurso'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/assets/resources/Sulfur.png';
          }}
        />
        <span className={styles.triggerText}>{activeFactory || 'SULFUR'}</span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {factoriesList.map((name) => (
            <button
              key={name}
              onClick={() => handleItemClick(name)}
              className={`${styles.menuItem} ${activeFactory === name ? styles.menuItemActive : ''}`}
              type="button"
            >
              <img
                src={getResourceIconPath(name)}
                className={styles.itemIcon}
                alt={name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/assets/resources/Sulfur.png';
                }}
              />
              <span className={styles.itemText}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
