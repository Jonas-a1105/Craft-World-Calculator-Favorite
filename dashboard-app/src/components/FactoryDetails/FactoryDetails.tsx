import React, { useEffect, useRef, useMemo } from 'react';
import anime from 'animejs';
import styles from './FactoryDetails.module.css';
import type { FactoryCategory, LevelData } from '../../types/game';
import { toCapitalCase } from '../../utils/string';
import { type TokenPrices } from '../../utils/priceService';
import type { PlayerAccountInfo, PlayerMine } from '../../utils/accountService';
import type { PriceDeltas } from '../../hooks/usePriceHistory';
import type { ResourceConfig } from '../../hooks/usePlayerConfig';
import { getEmoji, MASTERY_YIELD_PER_LEVEL } from '../../utils/gameHelpers';

interface FactoryDetailsProps {
  factoryName: string;
  category: FactoryCategory;
  emoji: string;
  maxLevel: number;
  basePowerCost: number;
  inputs: Array<{ name: string; amount: number; emoji: string }>;
  prices?: TokenPrices;
  coinPriceUsd?: number;
  factoriesCount?: number;
  currentConfigLevel?: number;
  playerCfg?: ResourceConfig;
  accountInfo?: PlayerAccountInfo | null;
  priceDeltas?: PriceDeltas;
  currentLevelData?: LevelData;
  gameBalance?: number;
  walletBalance?: number;
}

function formatNum(val: number, d = 2): string {
  if (val === 0) return '0';
  if (Math.abs(val) < 0.0001) return val.toExponential(2);
  if (Math.abs(val) < 0.01) return val.toFixed(6);
  if (Math.abs(val) < 1) return val.toFixed(4);
  if (Math.abs(val) < 1000) return val.toFixed(d);
  if (Math.abs(val) < 1000000) return val.toLocaleString(undefined, { maximumFractionDigits: d });
  return (val / 1000000).toFixed(2) + 'M';
}

function formatCoin(val: number): string {
  if (val === 0) return '0';
  if (val < 0.0001) return val.toFixed(6);
  if (val < 0.01) return val.toFixed(5);
  if (val < 1) return val.toFixed(4);
  return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDelta(val: number | null): string {
  if (val === null) return '—';
  const prefix = val >= 0 ? '▲' : '▼';
  return `${prefix} ${Math.abs(val).toFixed(2)}%`;
}

function formatProfit(val: number): string {
  if (val === 0) return '—';
  const prefix = val >= 0 ? '+' : '';
  if (Math.abs(val) < 0.01) return `${prefix}${val.toFixed(4)}`;
  return `${prefix}${val.toFixed(2)}`;
}

function formatPowerKw(watts: number): string {
  if (watts === 0) return '—';
  if (watts >= 1000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${watts.toFixed(0)} W`;
}

export const FactoryDetails: React.FC<FactoryDetailsProps> = ({
  factoryName,
  category,
  maxLevel,
  basePowerCost,
  inputs,
  prices,
  coinPriceUsd,
  factoriesCount,
  currentConfigLevel,
  playerCfg,
  accountInfo,
  priceDeltas,
  currentLevelData,
  gameBalance,
  walletBalance
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: [0.98, 1],
        duration: 350,
        easing: 'easeOutQuad'
      });
    }
  }, [factoryName]);

  const tokenPrice = prices?.[factoryName];
  const priceDelta = priceDeltas?.[factoryName];

  const cfg: ResourceConfig = playerCfg || { factories: 0, level: 1, mastery: 0, workers: 0, workshop: 0, boost: 1 };
  const lvlData = currentLevelData;

  // ─── Computations ───
  const baseYield = lvlData?.yield || 100;
  const effectiveYield = baseYield + cfg.mastery * MASTERY_YIELD_PER_LEVEL;
  const yieldFactor = baseYield / effectiveYield;

  const finalInput1Amt = (lvlData?.input1_amt || 0) * yieldFactor;
  const finalInput2Amt = (lvlData?.input2_amt || 0) * yieldFactor;

  const speedModifier = 1 + (cfg.workshop / 100) + (cfg.workers / 100);
  const boostMult = cfg.boost || 1;
  const finalCycleDurationSec = Math.max(0.1, (lvlData?.duration_sec || 3600) / (speedModifier * boostMult));
  const cyclesPerHour = 3600 / finalCycleDurationSec;
  const cyclesPerDay = cyclesPerHour * 24;

  const outputPerCycle = lvlData?.output || 0;
  const outputPerHr = outputPerCycle * cyclesPerHour;
  const outputPer24h = outputPerCycle * cyclesPerDay;
  const powerCostPerHour = (lvlData?.power_cost || 0) * cyclesPerHour * cfg.factories;

  let inputCostPerCycle = 0;
  if (lvlData?.input1 && lvlData.input1_amt > 0 && prices?.[lvlData.input1]) {
    inputCostPerCycle += finalInput1Amt * prices[lvlData.input1].buy;
  }
  if (lvlData?.input2 && lvlData.input2_amt > 0 && prices?.[lvlData.input2]) {
    inputCostPerCycle += finalInput2Amt * prices[lvlData.input2].buy;
  }

  const revenuePerCycle = tokenPrice ? outputPerCycle * tokenPrice.sell : 0;
  const profitPerCycle = revenuePerCycle - inputCostPerCycle;
  const marginPct = revenuePerCycle > 0 ? (profitPerCycle / revenuePerCycle) * 100 : 0;
  const profitPerHour = profitPerCycle * cyclesPerHour * cfg.factories;
  const profitPer24h = profitPerCycle * cyclesPerDay * cfg.factories;

  const xpPerCycle = lvlData?.xp_per_output || 0;
  const xpPerHour = xpPerCycle * cyclesPerHour * cfg.factories;
  const xpPer24h = xpPerCycle * cyclesPerDay * cfg.factories;
  const xpPerCoin = inputCostPerCycle > 0 ? xpPerCycle / inputCostPerCycle : 0;

  // Factory individual levels
  const factoryLevels = useMemo(() => {
    if (!accountInfo?.factories) return [];
    const levels: number[] = [];
    accountInfo.factories.forEach((f: PlayerMine) => {
      const symbol = (f.definition?.id || f.id || '').toUpperCase();
      if (symbol === factoryName) {
        levels.push(f.level);
      }
    });
    return levels.sort((a, b) => b - a);
  }, [accountInfo?.factories, factoryName]);

  // Input prices
  const inp1Price = lvlData?.input1 && prices?.[lvlData.input1] ? prices[lvlData.input1] : undefined;
  const inp2Price = lvlData?.input2 && prices?.[lvlData.input2] ? prices[lvlData.input2] : undefined;

  const categoryLabel = category === 'basic' ? 'Recurso Base' : category === 'keys' ? 'Llave / Especial' : 'Crafteado';
  const categoryClass = category === 'basic' ? 'bg-badge-basic' : category === 'keys' ? 'bg-badge-keys' : 'bg-badge-crafted';

  return (
    <section ref={cardRef} className={`bento-card ${styles.card}`}>
      {/* ─── Header ─── */}
      <div className={styles.factoryInfoHeader}>
        <div className={styles.factoryMainIcon}>
          <img
            src={`/assets/factories/${toCapitalCase(factoryName)}.gif`}
            className={styles.factoryGif}
            alt={factoryName}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const name = factoryName;
              if (target.src.endsWith('.gif')) target.src = `/assets/factories/${toCapitalCase(name)}Pause.png`;
              else if (target.src.includes('Pause.png')) target.src = `/assets/factories/${toCapitalCase(name)}.png`;
              else if (target.src.endsWith('.png') && !target.src.includes('/assets/resources/'))
                target.src = `/assets/resources/${toCapitalCase(name)}.png`;
              else target.src = '/assets/resources/Mud.png';
            }}
          />
        </div>
        <div className={styles.headerInfo}>
          <h2 className={styles.factoryName}>{factoryName}</h2>
          <span className={`factory-type-badge ${categoryClass}`}>{categoryLabel}</span>
          <div className={styles.headerBadges}>
            {gameBalance !== undefined && gameBalance > 0 && (
              <span className={styles.badgeGame}>🎮 {formatNum(gameBalance)}</span>
            )}
            {walletBalance !== undefined && walletBalance > 0 && (
              <span className={styles.badgeWallet}>💼 {formatNum(walletBalance)}</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Data Grid ─── */}
      <div className={styles.dataGrid}>

        {/* ── INPUTS ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>📥 ENTRADA</div>
          <div className={styles.inputRow}>
            {lvlData?.input1 && lvlData.input1_amt > 0 ? (
              <div className={styles.inputCard}>
                <img
                  src={`/assets/resources/${toCapitalCase(lvlData.input1)}.png`}
                  className={styles.inputIcon}
                  alt={lvlData.input1}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className={styles.inputName}>{lvlData.input1}</span>
                <span className={styles.inputAmt}>{formatNum(finalInput1Amt)}</span>
                {inp1Price && <span className={styles.inputCostVal}>{formatCoin(finalInput1Amt * inp1Price.buy)} C</span>}
              </div>
            ) : null}
            {lvlData?.input2 && lvlData.input2_amt > 0 ? (
              <div className={styles.inputCard}>
                <img
                  src={`/assets/resources/${toCapitalCase(lvlData.input2)}.png`}
                  className={styles.inputIcon}
                  alt={lvlData.input2}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className={styles.inputName}>{lvlData.input2}</span>
                <span className={styles.inputAmt}>{formatNum(finalInput2Amt)}</span>
                {inp2Price && <span className={styles.inputCostVal}>{formatCoin(finalInput2Amt * inp2Price.buy)} C</span>}
              </div>
            ) : lvlData?.input1 && lvlData.input1_amt > 0 ? null : (
              <span className={styles.noData}>Sin insumos</span>
            )}
          </div>
          {inputCostPerCycle > 0 && (
            <div className={styles.costTotal}>
              Coste total: <span className={styles.costTotalVal}>{formatCoin(inputCostPerCycle)} COIN/ciclo</span>
            </div>
          )}
        </div>

        {/* ── OUTPUT ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>📤 SALIDA</div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>/ciclo</span>
              <span className={styles.metricValue}>{formatNum(outputPerCycle)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>/min</span>
              <span className={styles.metricValue}>{formatNum(finalCycleDurationSec > 0 ? outputPerCycle / (finalCycleDurationSec / 60) : 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>/hora</span>
              <span className={styles.metricValue}>{formatNum(outputPerHr)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>/24h</span>
              <span className={styles.metricValue}>{formatNum(outputPer24h)}</span>
            </div>
          </div>
        </div>

        {/* ── PRICES ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>💰 PRECIO</div>
          <div className={styles.priceRow}>
            <div className={`${styles.priceCard} ${styles.priceBase}`}>
              <span className={styles.priceCardLabel}>BASE</span>
              <span className={styles.priceCardValue}>{tokenPrice ? formatCoin(tokenPrice.mid) : '—'}</span>
            </div>
            <div className={`${styles.priceCard} ${styles.priceBuy}`}>
              <span className={styles.priceCardLabel}>BUY</span>
              <span className={styles.priceCardValue}>{tokenPrice ? formatCoin(tokenPrice.buy) : '—'}</span>
            </div>
            <div className={`${styles.priceCard} ${styles.priceSell}`}>
              <span className={styles.priceCardLabel}>SELL</span>
              <span className={styles.priceCardValue}>{tokenPrice ? formatCoin(tokenPrice.sell) : '—'}</span>
            </div>
            {priceDelta && (
              <>
                <div className={styles.priceCard}>
                  <span className={styles.priceCardLabel}>Δ1h</span>
                  <span className={styles.priceCardValue} style={{ color: (priceDelta.delta1h || 0) >= 0 ? '#39ff14' : '#f87171' }}>
                    {formatDelta(priceDelta.delta1h)}
                  </span>
                </div>
                <div className={styles.priceCard}>
                  <span className={styles.priceCardLabel}>Δ24h</span>
                  <span className={styles.priceCardValue} style={{ color: (priceDelta.delta24h || 0) >= 0 ? '#39ff14' : '#f87171' }}>
                    {formatDelta(priceDelta.delta24h)}
                  </span>
                </div>
              </>
            )}
            {tokenPrice?.recommendation && (
              <div className={styles.priceCard}>
                <span className={styles.priceCardLabel}>SEÑAL</span>
                <span className={styles.priceCardValue} style={{
                  color: tokenPrice.recommendation === 'BUY' ? '#22c55e' : tokenPrice.recommendation === 'SELL' ? '#ef4444' : '#9ca3af'
                }}>
                  {tokenPrice.recommendation === 'BUY' ? '▲ BUY' : tokenPrice.recommendation === 'SELL' ? '▼ SELL' : '● HOLD'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── COST & PROFIT ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>💵 COSTO & GANANCIA</div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Costo/ciclo</span>
              <span className={styles.metricValue} style={{ color: '#f87171' }}>{formatCoin(inputCostPerCycle)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Venta (SELL)</span>
              <span className={styles.metricValue} style={{ color: '#c084fc' }}>{tokenPrice ? formatCoin(tokenPrice.sell) : '—'}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Margen</span>
              <span className={styles.metricValue} style={{ color: marginPct >= 0 ? '#39ff14' : '#f87171' }}>
                {marginPct >= 0 ? '+' : ''}{marginPct.toFixed(1)}%
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Ganancia/ciclo</span>
              <span className={styles.metricValue} style={{ color: profitPerCycle >= 0 ? '#39ff14' : '#f87171' }}>
                {formatProfit(profitPerCycle)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Ganancia/hr</span>
              <span className={styles.metricValue} style={{ color: profitPerHour >= 0 ? '#39ff14' : '#f87171' }}>
                {cfg.factories > 0 ? formatProfit(profitPerHour) : '—'}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Ganancia/24h</span>
              <span className={styles.metricValue} style={{ color: profitPer24h >= 0 ? '#39ff14' : '#f87171' }}>
                {cfg.factories > 0 ? formatProfit(profitPer24h) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── XP ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>⭐ EXPERIENCIA</div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>XP/ciclo</span>
              <span className={styles.metricValue} style={{ color: '#fbbf24' }}>{formatNum(xpPerCycle, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>XP/hr</span>
              <span className={styles.metricValue} style={{ color: '#fbbf24' }}>{formatNum(xpPerHour, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>XP/24h</span>
              <span className={styles.metricValue} style={{ color: '#fbbf24' }}>{formatNum(xpPer24h, 0)}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>XP/🪙</span>
              <span className={styles.metricValue} style={{ color: '#fbbf24' }}>{inputCostPerCycle > 0 ? formatNum(xpPerCoin, 0) : '—'}</span>
            </div>
          </div>
        </div>

        {/* ── FACTORIES ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>🏭 FÁBRICAS</div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Activas</span>
              <span className={styles.metricValue} style={{ color: '#00f0ff' }}>{cfg.factories || '0'}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Niveles</span>
              <span className={styles.metricValue} style={{ color: '#00f0ff', fontSize: '0.85rem' }}>
                {factoryLevels.length > 0 ? factoryLevels.join(', ') : '—'}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Duración ciclo</span>
              <span className={styles.metricValue}>{lvlData?.duration || '—'}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Power cost/hr</span>
              <span className={styles.metricValue} style={{ color: '#d8b4fe' }}>{formatPowerKw(powerCostPerHour)}</span>
            </div>
          </div>
        </div>

        {/* ── BONUSES ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>⚡ BONIFICACIONES</div>
          <div className={styles.bonusRow}>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Maestría</span>
              <span className={styles.bonusValue}>{cfg.mastery} ({(cfg.mastery * MASTERY_YIELD_PER_LEVEL).toFixed(1)}%)</span>
            </div>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Taller</span>
              <span className={styles.bonusValue}>{cfg.workshop}%</span>
            </div>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Workers</span>
              <span className={styles.bonusValue}>{cfg.workers}%</span>
            </div>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Boost</span>
              <span className={styles.bonusValue}>x{cfg.boost}</span>
            </div>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Yield efectivo</span>
              <span className={styles.bonusValue}>{(effectiveYield / 100).toFixed(3)}x</span>
            </div>
            <div className={styles.bonusPill}>
              <span className={styles.bonusLabel}>Velocidad</span>
              <span className={styles.bonusValue}>x{speedModifier.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── YIELD INFO ── */}
        <div className={styles.dataSection}>
          <div className={styles.sectionTitle}>📊 RENDIMIENTO</div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Yield base (nivel)</span>
              <span className={styles.metricValue}>{baseYield.toFixed(1)}%</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Yield + maestría</span>
              <span className={styles.metricValue} style={{ color: '#39ff14' }}>{effectiveYield.toFixed(1)}%</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Reducción insumos</span>
              <span className={styles.metricValue} style={{ color: '#39ff14' }}>{(1 - yieldFactor) * 100 > 0 ? `-${((1 - yieldFactor) * 100).toFixed(2)}%` : '0%'}</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Ciclos/hora</span>
              <span className={styles.metricValue}>{cyclesPerHour.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


