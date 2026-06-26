import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { type TokenPrices } from '../../utils/priceService';
import {
  CHART_COLORS,
  GRADIENTS,
  getEfficiencyColor,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
  AXIS_STYLE,
  GRID_STYLE,
  REFERENCE_LINE_STYLE,
  formatCompact,
  LEGEND_STYLE,
} from '../../utils/rechartsTheme';
import styles from './MasterpieceSimulator.module.css';

interface MasterpieceSimulatorProps {
  prices: TokenPrices;
}

// Representative Masterpiece stats for craftable resources in Craft World
const MASTERPIECE_STATS: Record<string, { crowns: number; xp: number; basePower: number }> = {
  "SCREWS": { crowns: 80, xp: 1200, basePower: 400 },
  "BOLTS": { crowns: 100, xp: 1500, basePower: 500 },
  "CEMENT": { crowns: 150, xp: 2500, basePower: 800 },
  "CERAMICS": { crowns: 180, xp: 3000, basePower: 900 },
  "STEEL": { crowns: 300, xp: 5000, basePower: 1500 },
  "ACID": { crowns: 500, xp: 8000, basePower: 2500 },
  "PLASTICS": { crowns: 450, xp: 7500, basePower: 2200 },
  "DYNAMITE": { crowns: 600, xp: 10000, basePower: 3000 },
  "DYNODESSERT": { crowns: 800, xp: 14000, basePower: 4000 },
  "MYSTICWEAPON": { crowns: 1200, xp: 22000, basePower: 6000 }
};

const DEFAULT_STATS = { crowns: 200, xp: 3000, basePower: 1000 };

interface ScalingRow {
  index: number;
  powerCost: number;
  efficiency: number;
  crowns: number;
  xp: number;
  isOptimal: boolean;
}

/* ─── Radar comparison data types ───────────────────────────────────────── */
interface RadarDataPoint {
  axis: string;
  [resourceKey: string]: string | number;
}

/* ─── Custom Tooltip Payloads ───────────────────────────────────────────── */
interface ScalingTooltipPayload {
  index: number;
  powerCost: number;
  efficiency: number;
  crowns: number;
  xp: number;
  isOptimal: boolean;
}

/* ─── Helpers for radar normalisation ───────────────────────────────────── */
const RADAR_KEYS: (keyof typeof MASTERPIECE_STATS)["length"] extends number
  ? readonly string[]
  : never = ['SCREWS', 'BOLTS', 'CEMENT', 'STEEL', 'ACID', 'DYNAMITE', 'DYNODESSERT', 'MYSTICWEAPON'] as const;

function buildRadarData(selected: string): RadarDataPoint[] {
  // Pick current + 2-3 reference resources for context
  const referenceKeys = RADAR_KEYS.filter(k => k !== selected).slice(0, 3);
  const keysToShow = [selected, ...referenceKeys];

  // Normalise to 0-100 scale per axis
  const allStats = Object.values(MASTERPIECE_STATS);
  const maxCrowns = Math.max(...allStats.map(s => s.crowns));
  const maxXp = Math.max(...allStats.map(s => s.xp));
  const maxPower = Math.max(...allStats.map(s => s.basePower));

  const axes: { label: string; key: keyof typeof DEFAULT_STATS; max: number }[] = [
    { label: 'Coronas', key: 'crowns', max: maxCrowns },
    { label: 'XP', key: 'xp', max: maxXp },
    { label: 'Energía Base', key: 'basePower', max: maxPower },
  ];

  return axes.map(({ label, key, max }) => {
    const point: RadarDataPoint = { axis: label };
    keysToShow.forEach(k => {
      const s = MASTERPIECE_STATS[k] ?? DEFAULT_STATS;
      point[k] = Math.round((s[key] / max) * 100);
    });
    return point;
  });
}

const RADAR_COLORS: Record<number, string> = {
  0: CHART_COLORS.cyan,
  1: CHART_COLORS.pink,
  2: CHART_COLORS.orange,
  3: CHART_COLORS.purple,
};

export const MasterpieceSimulator: React.FC<MasterpieceSimulatorProps> = ({ prices }) => {
  const [selectedToken, setSelectedToken] = useState<string>('STEEL');
  const [contributionQty, setContributionQty] = useState<number>(5);
  const [hasCrystalPass, setHasCrystalPass] = useState<boolean>(false);

  // Get craftable tokens sorted
  const tokenKeys = Object.keys(prices).filter(key => key !== 'COIN' && key !== 'ENERGY').sort();

  // Get active stats
  const stats = MASTERPIECE_STATS[selectedToken] || DEFAULT_STATS;

  // Cost scaling calculations
  // Each unit contributed on the same day increases the power cost by 35% of the base power.
  // Crystal Pass reduces the final power cost by 10%.
  const scalingRows = useMemo((): ScalingRow[] => {
    const rows: ScalingRow[] = [];
    const basePower = stats.basePower;
    const passReduction = hasCrystalPass ? 0.9 : 1.0;

    for (let i = 1; i <= Math.max(contributionQty, 10); i++) {
      // Linear scaling: cost increases by 35% per subsequent unit
      const multiplier = 1 + 0.35 * (i - 1);
      const powerCost = Math.round(basePower * multiplier * passReduction);
      // Efficiency relative to base cost (1st unit is 100%)
      const efficiency = (basePower * passReduction) / powerCost * 100;
      // 1st and 2nd units are generally optimal (> 75% efficiency)
      const isOptimal = efficiency >= 75;

      rows.push({
        index: i,
        powerCost,
        efficiency,
        crowns: stats.crowns,
        xp: stats.xp,
        isOptimal
      });
    }
    return rows;
  }, [stats, contributionQty, hasCrystalPass]);

  // Aggregate stats for the user-selected contribution quantity
  const activeRows = useMemo(() => {
    return scalingRows.slice(0, contributionQty);
  }, [scalingRows, contributionQty]);

  const totalPowerSpent = activeRows.reduce((sum, r) => sum + r.powerCost, 0);
  const totalCrownsEarned = activeRows.reduce((sum, r) => sum + r.crowns, 0);
  const totalXpEarned = activeRows.reduce((sum, r) => sum + r.xp, 0);

  const averageEfficiency = activeRows.length > 0
    ? activeRows.reduce((sum, r) => sum + r.efficiency, 0) / activeRows.length
    : 100;

  // Optimal suggestion logic
  const optimalContributionLimit = useMemo(() => {
    // Find the first index where efficiency drops below 75%
    const subOptimalIndex = scalingRows.findIndex(r => r.efficiency < 75);
    return subOptimalIndex !== -1 ? subOptimalIndex : 2;
  }, [scalingRows]);

  // Financial equivalents for the power spent
  const ENERGY_KW_RATIO = 1000;
  const energyTokensNeeded = totalPowerSpent / ENERGY_KW_RATIO;
  const energyPrice = prices['ENERGY'];
  const totalEnergyCostCoin = energyPrice ? energyTokensNeeded * energyPrice.buy : 0;
  const totalEnergyCostUsd = energyPrice ? energyTokensNeeded * energyPrice.usdBuy : 0;

  // Format helper functions
  const formatCoin = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatUsd = (num: number) => num.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ─── Chart data ──────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    scalingRows.map(row => ({
      ...row,
      name: `#${row.index}`,
      efficiencyRound: Math.round(row.efficiency * 10) / 10,
    })),
  [scalingRows]);

  const radarData = useMemo(() => buildRadarData(selectedToken), [selectedToken]);
  const radarResourceKeys = useMemo(() => {
    const referenceKeys = RADAR_KEYS.filter(k => k !== selectedToken).slice(0, 3);
    return [selectedToken, ...referenceKeys];
  }, [selectedToken]);

  // ─── Custom Tooltip for ComposedChart ────────────────────────────────
  const ScalingTooltipContent = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) return null;
      const row = payload[0]?.payload as ScalingTooltipPayload | undefined;
      if (!row) return null;
      return (
        <div style={TOOLTIP_STYLE}>
          <p style={TOOLTIP_LABEL_STYLE}>Unidad {label}</p>
          <p style={{ ...TOOLTIP_ITEM_STYLE, color: getEfficiencyColor(row.efficiency) }}>
            ⚡ Costo Energía: {row.powerCost.toLocaleString('es-ES')} W
          </p>
          <p style={{ ...TOOLTIP_ITEM_STYLE, color: CHART_COLORS.cyan }}>
            📊 Eficiencia: {row.efficiency.toFixed(1)}%
          </p>
          <p style={{ ...TOOLTIP_ITEM_STYLE, color: CHART_COLORS.purple }}>
            👑 Coronas: +{row.crowns}
          </p>
          <p style={{ ...TOOLTIP_ITEM_STYLE, color: CHART_COLORS.green }}>
            ✨ XP: +{row.xp.toLocaleString('es-ES')}
          </p>
        </div>
      );
    },
    [],
  );

  // ─── Custom Tooltip for RadarChart ──────────────────────────────────
  const RadarTooltipContent = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) return null;
      return (
        <div style={TOOLTIP_STYLE}>
          <p style={TOOLTIP_LABEL_STYLE}>{label as string}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} style={{ ...TOOLTIP_ITEM_STYLE, color: entry.color ?? '#fff' }}>
              {String(entry.name)}: {entry.value}%
            </p>
          ))}
        </div>
      );
    },
    [],
  );

  return (
    <section className={`bento-card ${styles.card}`}>
      <h2 className={styles.title}>🏆 SIMULADOR DE OBRAS MAESTRAS (MASTERPIECE)</h2>

      <div className={styles.simulatorLayout}>
        {/* Left Column: Configuration Controls */}
        <div className={styles.controlsCard}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Recurso a Contribuir</label>
            <select
              className={styles.tokenSelect}
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              {tokenKeys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Cantidad a Contribuir Hoy</label>
            <input
              type="number"
              className={styles.inputField}
              value={contributionQty}
              onChange={(e) => setContributionQty(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>

          <div className={styles.toggleRow}>
            <span className={styles.controlLabel} style={{ textTransform: 'none', color: '#fff' }}>
              🎟️ Pase de Cristal Activo (-10% Energía)
            </span>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={hasCrystalPass}
                onChange={(e) => setHasCrystalPass(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Core Info Box */}
          <div className={styles.controlGroup} style={{ background: 'rgba(255,255,255,0.015)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className={styles.controlLabel} style={{ color: 'var(--color-pink)' }}>Datos Base del Recurso</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Corona por unidad:</span>
                <span className={styles.monoVal} style={{ color: 'var(--color-blue)' }}>+{stats.crowns} 👑</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Experiencia por unidad:</span>
                <span className={styles.monoVal} style={{ color: 'var(--color-green)' }}>+{stats.xp} XP</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Costo de energía base:</span>
                <span className={styles.monoVal}>{stats.basePower} W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Interactive Results */}
        <div className={styles.resultsPanel}>
          {/* Smart Recommendation Card */}
          {contributionQty > optimalContributionLimit && (
            <div className={styles.recommendationCard}>
              <span className={styles.recomIcon}>⚠️</span>
              <div className={styles.recomContent}>
                <span className={styles.recomTitle}>Sugerencia de Eficiencia Diaria</span>
                <p className={styles.recomText}>
                  Contribuir {contributionQty} {selectedToken} hoy reduce tu eficiencia promedio a{' '}
                  <strong style={{ color: 'var(--color-pink)' }}>{averageEfficiency.toFixed(1)}%</strong> debido al escalado de costos del juego.
                  <br />
                  Te recomendamos contribuir un máximo de{' '}
                  <strong style={{ color: 'var(--color-green)' }}>{optimalContributionLimit} unidades hoy</strong>, y repartir las otras{' '}
                  <strong>{contributionQty - optimalContributionLimit}</strong> en los siguientes días. ¡Esto mantendrá tu eficiencia por encima del 75%!
                </p>
              </div>
            </div>
          )}

          {/* Stats Counters Grid */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statBoxLabel}>Coronas Totales</span>
              <span className={styles.statBoxVal} style={{ color: 'var(--color-blue)' }}>
                {totalCrownsEarned.toLocaleString('es-ES')} 👑
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxLabel}>Experiencia Ganada</span>
              <span className={styles.statBoxVal} style={{ color: 'var(--color-green)' }}>
                {totalXpEarned.toLocaleString('es-ES')} XP
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statBoxLabel}>Eficiencia Promedio</span>
              <span className={styles.statBoxVal} style={{ color: averageEfficiency >= 75 ? 'var(--color-green)' : 'var(--color-pink)' }}>
                {averageEfficiency.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Cost Progression Chart (replaces old table) */}
          <div className={styles.chartSection}>
            <h3 className={styles.tableTitle}>📉 Escalado Progresivo del Costo de Energía</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mpEfficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.cyan.start} />
                      <stop offset="100%" stopColor={GRADIENTS.cyan.end} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid {...GRID_STYLE} />

                  <XAxis
                    dataKey="name"
                    {...AXIS_STYLE}
                  />

                  {/* Left Y-axis: Power Cost */}
                  <YAxis
                    yAxisId="left"
                    {...AXIS_STYLE}
                    tickFormatter={(v: number) => formatCompact(v)}
                    label={{
                      value: 'Costo (W)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: CHART_COLORS.orange, fontSize: 11, fontFamily: "'Outfit', sans-serif" },
                    }}
                  />

                  {/* Right Y-axis: Efficiency % */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 110]}
                    {...AXIS_STYLE}
                    tickFormatter={(v: number) => `${v}%`}
                    label={{
                      value: 'Eficiencia %',
                      angle: 90,
                      position: 'insideRight',
                      style: { fill: CHART_COLORS.cyan, fontSize: 11, fontFamily: "'Outfit', sans-serif" },
                    }}
                  />

                  <Tooltip content={ScalingTooltipContent} />

                  <Legend
                    wrapperStyle={LEGEND_STYLE}
                    formatter={(value: string) => {
                      const labels: Record<string, string> = {
                        powerCost: '⚡ Costo Energía (W)',
                        efficiencyRound: '📊 Eficiencia (%)',
                      };
                      return labels[value] ?? value;
                    }}
                  />

                  {/* Optimal contribution limit */}
                  <ReferenceLine
                    x={`#${optimalContributionLimit + 1}`}
                    yAxisId="left"
                    {...REFERENCE_LINE_STYLE}
                    label={{
                      value: `⚠️ Límite óptimo (#${optimalContributionLimit})`,
                      position: 'top',
                      fill: CHART_COLORS.pink,
                      fontSize: 10,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  />

                  {/* 75% efficiency reference line */}
                  <ReferenceLine
                    y={75}
                    yAxisId="right"
                    stroke={CHART_COLORS.yellow}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    label={{
                      value: '75% eficiencia',
                      position: 'left',
                      fill: CHART_COLORS.yellow,
                      fontSize: 10,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  />

                  {/* Area under efficiency line */}
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiencyRound"
                    fill="url(#mpEfficiencyGrad)"
                    stroke="none"
                    animationDuration={800}
                    name="efficiencyRound"
                  />

                  {/* Power cost bars with dynamic colour */}
                  <Bar
                    yAxisId="left"
                    dataKey="powerCost"
                    barSize={24}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                    name="powerCost"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`bar-${entry.index}`}
                        fill={getEfficiencyColor(entry.efficiency)}
                        fillOpacity={entry.index <= contributionQty ? 1 : 0.3}
                      />
                    ))}
                  </Bar>

                  {/* Efficiency line overlay */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiencyRound"
                    stroke={CHART_COLORS.cyan}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_COLORS.cyan, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#fff', stroke: CHART_COLORS.cyan, strokeWidth: 2 }}
                    animationDuration={800}
                    name="efficiencyRound"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart: Resource Comparison */}
          <div className={styles.chartSection}>
            <h3 className={styles.tableTitle}>🕸️ Comparación de Recursos Masterpiece</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid
                    stroke="rgba(250, 64, 96, 0.12)"
                    strokeDasharray="3 6"
                  />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: '#a78bfa', fontSize: 12, fontFamily: "'Outfit', sans-serif" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#a78bfa', fontSize: 9 }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip content={RadarTooltipContent} />
                  <Legend
                    wrapperStyle={LEGEND_STYLE}
                  />
                  {radarResourceKeys.map((key, i) => (
                    <Radar
                      key={key}
                      name={key}
                      dataKey={key}
                      stroke={RADAR_COLORS[i] ?? CHART_COLORS.teal}
                      fill={RADAR_COLORS[i] ?? CHART_COLORS.teal}
                      fillOpacity={i === 0 ? 0.35 : 0.08}
                      strokeWidth={i === 0 ? 2 : 1}
                      animationDuration={800}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Summary Stripe */}
          <div className={styles.financialSummaryStripe}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.financialTitle}>Costo Energético de Contribución:</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Demanda total: {totalPowerSpent.toLocaleString('es-ES')} W-h ({energyTokensNeeded.toFixed(2)} ENERGY tokens)
              </span>
            </div>
            {energyPrice ? (
              <div style={{ textAlign: 'right' }}>
                <span className={styles.financialVal}>{formatCoin(totalEnergyCostCoin)} COIN</span>
                <span className={styles.financialUsd}>({formatUsd(totalEnergyCostUsd)})</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-pink)' }}>Sin precio de ENERGY</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
