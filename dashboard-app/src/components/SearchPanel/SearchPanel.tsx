import React from 'react';
import styles from './SearchPanel.module.css';

interface SearchPanelProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter
}) => {
  return (
    <section className={`bento-card ${styles.card}`}>
      <h2 className="card-title">🔍 BUSCADOR Y FILTROS</h2>
      <div className={styles.searchControls}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar fábrica o ingrediente..."
            autoComplete="off"
          />
        </div>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Todos
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'basic' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('basic')}
          >
            Recursos Base
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'crafted' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('crafted')}
          >
            Crafteados
          </button>
          <button
            className={`${styles.filterBtn} ${activeFilter === 'keys' ? styles.filterBtnActive : ''}`}
            onClick={() => setActiveFilter('keys')}
          >
            Llaves & Especiales
          </button>
        </div>
      </div>
    </section>
  );
};
