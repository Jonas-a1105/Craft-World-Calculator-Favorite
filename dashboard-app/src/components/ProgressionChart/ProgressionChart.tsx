import React, { useCallback, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush,
} from 'recharts';
import styles from './ProgressionChart.module.css';
import type { LevelData } from '../../types/game';
import {
  AXIS_STYLE,
  GRID_STYLE,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
  CHART_COLORS,
  GRADIENTS,
  REFERENCE_LINE_STYLE,
  ANIMATION_CONFIG,
  formatCompact,
  formatDuration,
} from '../../utils/rechartsTheme';

/* ───────────────── Props interface (unchanged) ───────────────── */

interface ProgressionChartProps {
  levels: LevelData[];
  currentLevel: number;
  setCurrentLevel: (lvl: number) => void;
}

/* ─────────────── Custom Tooltip ──────────────────────────────── */

const CustomTooltip: React.FC<any> = ({
  active,
  payload,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload as LevelData;

  const rows: { label: string; value: string; color: string }[] = [
    { label: 'Producción', value: `${formatCompact(data.output)} uds`, color: CHART_COLORS.cyan },
    { label: 'Duración', value: formatDuration(data.duration_sec), color: CHART_COLORS.pink },
    { label: 'Energía', value: `⚡ ${formatCompact(data.power_cost)}`, color: CHART_COLORS.orange },
    { label: 'XP / Unidad', value: formatCompact(data.xp_per_output), color: CHART_COLORS.purple },
    { label: 'Prod / Día', value: formatCompact(data.production_per_day), color: CHART_COLORS.green },
    { label: 'XP / Día', value: formatCompact(data.xp_per_day), color: CHART_COLORS.teal },
  ];

  if (data.input1) {
    rows.push({
      label: 'Input 1',
      value: `${data.input1} ×${data.input1_amt}`,
      color: CHART_COLORS.yellow,
    });
  }
  if (data.input2) {
    rows.push({
      label: 'Input 2',
      value: `${data.input2} ×${data.input2_amt}`,
      color: CHART_COLORS.yellow,
    });
  }
  if (data.cost_symbol) {
    rows.push({
      label: 'Mejora',
      value: `${data.cost_symbol} ${formatCompact(data.cost_amount)}`,
      color: CHART_COLORS.red,
    });
  }

  return (
    <div style={TOOLTIP_STYLE} className={styles.tooltip}>
      <p style={TOOLTIP_LABEL_STYLE}>Nivel {data.level}</p>
      {rows.map((r) => (
        <div key={r.label} style={{ ...TOOLTIP_ITEM_STYLE, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#a78bfa' }}>{r.label}</span>
          <span style={{ color: r.color, fontWeight: 600 }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────── Custom Legend ───────────────────────────────── */

interface LegendEntry {
  value: string;
  color: string;
}

const LEGEND_ITEMS: LegendEntry[] = [
  { value: 'Producción / Ciclo', color: CHART_COLORS.cyan },
  { value: 'Duración del Ciclo', color: CHART_COLORS.pink },
  { value: 'Coste Energético', color: CHART_COLORS.orange },
];

const renderLegend = (): React.ReactElement => (
  <div className={styles.chartLegend}>
    {LEGEND_ITEMS.map((entry) => (
      <span key={entry.value} className={styles.legendItem}>
        <span
          className={styles.legendDot}
          style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}
        />
        {entry.value}
      </span>
    ))}
  </div>
);

/* ─────────────── Main Component ─────────────────────────────── */

export const ProgressionChart: React.FC<ProgressionChartProps> = ({
  levels,
  currentLevel,
  setCurrentLevel,
}) => {
  /* ── Click handler ── */
  const handleChartClick = useCallback(
    (state: any) => {
      if (state?.activePayload && state.activePayload.length > 0) {
        const clickedLevel = (state.activePayload[0].payload as LevelData).level;
        setCurrentLevel(clickedLevel);
      }
    },
    [setCurrentLevel],
  );

  /* ── Compute max power for proportional bar sizing ── */
  const maxPower = useMemo(
    () => Math.max(...levels.map((l) => l.power_cost), 1),
    [levels],
  );

  /* ── Normalized data: add a scaled power field for the bar overlay ── */
  interface ChartRow extends LevelData {
    powerScaled: number;
  }

  const chartData: ChartRow[] = useMemo(
    () =>
      levels.map((l) => ({
        ...l,
        // Scale power cost relative to maxOutput so bars are visible but subtle
        powerScaled:
          levels.length > 0
            ? (l.power_cost / maxPower) * Math.max(...levels.map((x) => x.output)) * 0.3
            : 0,
      })),
    [levels, maxPower],
  );

  /* ── Empty-state guard ── */
  if (levels.length <= 1) {
    return (
      <section className={`bento-card ${styles.card}`}>
        <h2 className="card-title">📈 PROGRESIÓN DE PRODUCCIÓN</h2>
        <div className={styles.emptyState}>
          No hay suficientes niveles para trazar progresión.
        </div>
      </section>
    );
  }

  return (
    <section className={`bento-card ${styles.card}`}>
      <h2 className="card-title">📈 PROGRESIÓN DE PRODUCCIÓN</h2>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
            onClick={handleChartClick}
          >
            {/* ── SVG Gradient Defs ── */}
            <defs>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRADIENTS.cyan.start} />
                <stop offset="100%" stopColor={GRADIENTS.cyan.end} />
              </linearGradient>
              <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GRADIENTS.orange.start} />
                <stop offset="100%" stopColor={GRADIENTS.orange.end} />
              </linearGradient>
            </defs>

            {/* ── Grid ── */}
            <CartesianGrid {...GRID_STYLE} />

            {/* ── X Axis ── */}
            <XAxis
              dataKey="level"
              {...AXIS_STYLE}
              tickFormatter={(v: number) => `Nv ${v}`}
              interval="preserveStartEnd"
            />

            {/* ── Left Y Axis — Production ── */}
            <YAxis
              yAxisId="left"
              {...AXIS_STYLE}
              tickFormatter={(v: number) => formatCompact(v)}
              label={{
                value: 'Producción',
                angle: -90,
                position: 'insideLeft',
                fill: CHART_COLORS.cyan,
                fontSize: 11,
                fontFamily: "'Outfit', sans-serif",
                dy: 30,
              }}
            />

            {/* ── Right Y Axis — Duration ── */}
            <YAxis
              yAxisId="right"
              orientation="right"
              {...AXIS_STYLE}
              tickFormatter={(v: number) => formatDuration(v)}
              label={{
                value: 'Duración',
                angle: 90,
                position: 'insideRight',
                fill: CHART_COLORS.pink,
                fontSize: 11,
                fontFamily: "'Outfit', sans-serif",
                dy: -30,
              }}
            />

            {/* ── Tooltip ── */}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(250,64,96,0.2)', strokeWidth: 1 }} />

            {/* ── Legend ── */}
            <Legend content={renderLegend} />

            {/* ── Reference Line at current level ── */}
            <ReferenceLine
              x={currentLevel}
              yAxisId="left"
              {...REFERENCE_LINE_STYLE}
              label={{
                value: `Nv ${currentLevel}`,
                position: 'top',
                fill: CHART_COLORS.pink,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
              }}
            />

            {/* ── Bar: Power Cost (subtle overlay) ── */}
            <Bar
              yAxisId="left"
              dataKey="powerScaled"
              name="Coste Energético"
              fill="url(#gradOrange)"
              stroke={CHART_COLORS.orange}
              strokeWidth={0.5}
              barSize={6}
              opacity={0.55}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing}
            />

            {/* ── Area: Production per Cycle ── */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="output"
              name="Producción / Ciclo"
              stroke={CHART_COLORS.cyan}
              strokeWidth={2.5}
              fill="url(#gradCyan)"
              dot={{ r: 3, fill: CHART_COLORS.cyan, stroke: '#0a0112', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.cyan, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing}
            />

            {/* ── Line: Cycle Duration ── */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="duration_sec"
              name="Duración del Ciclo"
              stroke={CHART_COLORS.pink}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.pink, stroke: '#0a0112', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.pink, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing}
            />

            {/* ── Brush for level-range zoom ── */}
            <Brush
              dataKey="level"
              height={22}
              stroke={CHART_COLORS.pink}
              fill="rgba(10, 1, 18, 0.8)"
              travellerWidth={8}
              tickFormatter={(v: number) => `${v}`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
