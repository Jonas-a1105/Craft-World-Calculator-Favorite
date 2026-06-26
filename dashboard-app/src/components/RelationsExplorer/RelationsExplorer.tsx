import React, { useEffect, useRef, useState, useMemo } from 'react';
import anime from 'animejs';
import styles from './RelationsExplorer.module.css';
import { toCapitalCase } from '../../utils/string';
import { FACTORIES_DATA } from '../../assets/data/factories';
import { type TokenPrices } from '../../utils/priceService';

const RAW_RESOURCES = ["EARTH", "WATER", "FIRE", "DYNOFISH", "MAGICSHARD", "BURNTRICE"];

interface RelationNode {
  name: string;
  emoji: string;
  isFactory?: boolean;
}

interface RelationsExplorerProps {
  currentFactory: string;
  parents: RelationNode[];
  children: RelationNode[];
  onSelectFactory: (name: string) => void;
  prices?: TokenPrices;
}

interface RecipeNode {
  name: string;
  qty: number;
  isRaw: boolean;
  children: RecipeNode[];
}

// Interactive subcomponent for rendering collapsible tree nodes
const RecipeTreeNode: React.FC<{
  node: RecipeNode;
  prices?: TokenPrices;
  onSelectFactory: (name: string) => void;
}> = ({ node, prices, onSelectFactory }) => {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;
  
  const tokenPrice = prices?.[node.name];
  const priceText = tokenPrice 
    ? `${(node.qty * tokenPrice.mid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} COIN`
    : '';

  return (
    <div className={styles.treeNodeWrapper}>
      <div className={styles.treeNodeHeader}>
        {hasChildren ? (
          <button className={styles.collapseToggle} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span className={styles.bulletDot}>•</span>
        )}
        <img
          src={`/assets/resources/${toCapitalCase(node.name)}.png`}
          className={styles.treeNodeIcon}
          alt={node.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/resources/Mud.png'; // fallback
          }}
        />
        <span 
          className={styles.treeNodeName}
          onClick={() => !node.isRaw && onSelectFactory(node.name)}
          style={{ cursor: node.isRaw ? 'default' : 'pointer', textDecoration: node.isRaw ? 'none' : 'underline' }}
        >
          {node.name}
        </span>
        <span className={styles.treeNodeQty}>
          x{node.qty.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
        {priceText && <span className={styles.treeNodePrice}>({priceText})</span>}
      </div>

      {hasChildren && !collapsed && (
        <div className={styles.treeNodeChildren}>
          {node.children.map((child, idx) => (
            <RecipeTreeNode
              key={idx}
              node={child}
              prices={prices}
              onSelectFactory={onSelectFactory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const RelationsExplorer: React.FC<RelationsExplorerProps> = ({
  currentFactory,
  parents,
  children,
  onSelectFactory,
  prices
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  // Bounce scale animations on dependency changes
  useEffect(() => {
    if (containerRef.current) {
      const nodes = containerRef.current.querySelectorAll(`.${styles.relationItemNode}`);
      if (nodes.length > 0) {
        anime({
          targets: nodes,
          scale: [0.85, 1],
          opacity: [0, 1],
          delay: anime.stagger(40),
          easing: 'easeOutQuad',
          duration: 300
        });
      }
    }
  }, [parents, children, currentFactory]);

  // Build recursive recipe tree (1 unit of outputName)
  const recipeTree = useMemo((): RecipeNode => {
    const buildTree = (name: string, qty: number): RecipeNode => {
      const levels = FACTORIES_DATA[name];
      const isRaw = !levels || RAW_RESOURCES.includes(name);

      if (isRaw) {
        return { name, qty, isRaw, children: [] };
      }

      const fl = levels[0];
      const out = fl.output || 1;
      const childrenList: RecipeNode[] = [];

      if (fl.input1) {
        childrenList.push(buildTree(fl.input1, qty * (fl.input1_amt / out)));
      }
      if (fl.input2) {
        childrenList.push(buildTree(fl.input2, qty * (fl.input2_amt / out)));
      }

      return { name, qty, isRaw, children: childrenList };
    };

    return buildTree(currentFactory, 1);
  }, [currentFactory]);

  // Aggregate raw ingredients needed
  const rawIngredientsSummary = useMemo((): { name: string; qty: number; costCoin: number }[] => {
    const summary: Record<string, number> = {};

    const aggregate = (name: string, qty: number) => {
      const levels = FACTORIES_DATA[name];
      const isRaw = !levels || RAW_RESOURCES.includes(name);

      if (isRaw) {
        summary[name] = (summary[name] || 0) + qty;
        return;
      }

      const fl = levels[0];
      const out = fl.output || 1;
      if (fl.input1) aggregate(fl.input1, qty * (fl.input1_amt / out));
      if (fl.input2) aggregate(fl.input2, qty * (fl.input2_amt / out));
    };

    aggregate(currentFactory, 1);

    return Object.entries(summary).map(([name, qty]) => {
      const p = prices?.[name];
      const costCoin = p ? qty * p.mid : 0;
      return { name, qty, costCoin };
    }).sort((a, b) => b.qty - a.qty);
  }, [currentFactory, prices]);

  const totalRawCost = rawIngredientsSummary.reduce((sum, item) => sum + item.costCoin, 0);

  return (
    <section className={`bento-card ${styles.card}`}>
      <h2 className="card-title">🔗 RELACIONES DE CRAFTEO</h2>
      <div ref={containerRef} className={styles.relationsExplorer}>
        
        {/* Columna Insumos */}
        <div className={styles.relationColumn}>
          <span className={styles.relationHeaderTitle}>Produce a partir de:</span>
          <div className={styles.relationList}>
            {parents.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Sin dependencias
              </span>
            ) : (
              parents.map((p) => {
                const clickHandler = p.isFactory ? () => onSelectFactory(p.name) : undefined;
                return (
                  <div
                    key={p.name}
                    className={styles.relationItemNode}
                    onClick={clickHandler}
                    style={{
                      cursor: p.isFactory ? 'pointer' : 'default',
                      borderColor: p.isFactory ? 'var(--border-color)' : 'rgba(255, 255, 255, 0.05)',
                      color: p.isFactory ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    <img
                      src={`/assets/resources/${toCapitalCase(p.name)}.png`}
                      className={styles.relationIcon}
                      alt={p.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/resources/Mud.png';
                      }}
                    />
                    <span>{p.name}</span>
                    {!p.isFactory && <span className={styles.baseLabel}>(Base)</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.relationArrow}>➡️</div>

        {/* Columna Actual */}
        <div className={`${styles.relationColumn} ${styles.currentItemCol}`}>
          <span className={styles.relationHeaderTitle}>Fábrica Actual:</span>
          <div className={styles.currentItemBox}>
            <img
              src={`/assets/factories/${toCapitalCase(currentFactory)}.gif`}
              className={styles.currentFactoryGif}
              alt={currentFactory}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const name = currentFactory;
                if (target.src.endsWith('.gif')) {
                  target.src = `/assets/factories/${toCapitalCase(name)}Pause.png`;
                } else if (target.src.includes('Pause.png')) {
                  target.src = `/assets/factories/${toCapitalCase(name)}.png`;
                } else if (target.src.endsWith('.png') && !target.src.includes('/assets/resources/')) {
                  target.src = `/assets/resources/${toCapitalCase(name)}.png`;
                } else {
                  target.src = '/assets/resources/Mud.png';
                }
              }}
            />
            <span className={styles.currentFactoryName}>{currentFactory}</span>
          </div>
        </div>

        <div className={styles.relationArrow}>➡️</div>

        {/* Columna Siguiente Cadenas */}
        <div className={styles.relationColumn}>
          <span className={styles.relationHeaderTitle}>Se usa para fabricar:</span>
          <div className={styles.relationList}>
            {children.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Ninguna fábrica lo usa
              </span>
            ) : (
              children.map((c) => (
                <div
                  key={c.name}
                  className={styles.relationItemNode}
                  onClick={() => onSelectFactory(c.name)}
                >
                  <img
                    src={`/assets/resources/${toCapitalCase(c.name)}.png`}
                    className={styles.relationIcon}
                    alt={c.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/resources/Mud.png';
                    }}
                  />
                  <span>{c.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recipe Tree Map Section */}
      <div className={styles.treeSection} ref={treeRef}>
        <h3 className={styles.treeTitle}>🗺️ ÁRBOL COMPLETO DE LA RECETA</h3>
        <p className={styles.treeDesc}>
          Flujo recursivo de ingredientes y sub-recursos hasta los recursos base (Tierra, Agua, Fuego, etc.) para fabricar 1 unidad.
        </p>

        <div className={styles.treeRootContainer}>
          <RecipeTreeNode
            node={recipeTree}
            prices={prices}
            onSelectFactory={onSelectFactory}
          />
        </div>

        {/* Summary Card for Raw Resources */}
        <div className={styles.rawSummaryCard}>
          <h4 className={styles.summaryTitle}>🎒 Recursos Base Totales Necesarios (Para 1 unidad)</h4>
          <div className={styles.rawGrid}>
            {rawIngredientsSummary.map((item) => (
              <div key={item.name} className={styles.rawRow}>
                <div className={styles.rawNameWrapper}>
                  <img
                    src={`/assets/resources/${toCapitalCase(item.name)}.png`}
                    className={styles.rawIcon}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/resources/Mud.png';
                    }}
                  />
                  <span className={styles.rawName}>{item.name}</span>
                </div>
                <div className={styles.rawValues}>
                  <span className={styles.rawQty}>
                    x{item.qty.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}
                  </span>
                  {item.costCoin > 0 && (
                    <span className={styles.rawCost}>
                      ({item.costCoin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} COIN)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.totalRawStripe}>
            <span>Costo Total Estimado en Recursos Base:</span>
            <span className={styles.totalRawCostVal}>
              {totalRawCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} COIN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
