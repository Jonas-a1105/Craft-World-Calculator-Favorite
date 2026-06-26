/**
 * Recharts Theme — Centralized design tokens for all charts
 * Matches the app's neon-dark design system from variables.css
 */

// ─── Color Palette ─────────────────────────────────────────
export const CHART_COLORS = {
  cyan: '#00f0ff',
  green: '#39ff14',
  pink: '#FA4060',
  orange: '#ff9e00',
  purple: '#c084fc',
  red: '#f87171',
  blue: '#6366f1',
  yellow: '#facc15',
  teal: '#2dd4bf',
  lime: '#a3e635',
} as const;

/** Ordered array for automatic color assignment to data series */
export const COLOR_SEQUENCE = [
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.blue,
  CHART_COLORS.yellow,
  CHART_COLORS.teal,
  CHART_COLORS.lime,
  CHART_COLORS.red,
];

// ─── Gradient Definitions ──────────────────────────────────
export const GRADIENTS = {
  cyan: { start: 'rgba(0, 240, 255, 0.35)', end: 'rgba(0, 240, 255, 0.02)' },
  pink: { start: 'rgba(250, 64, 96, 0.35)', end: 'rgba(250, 64, 96, 0.02)' },
  green: { start: 'rgba(57, 255, 20, 0.35)', end: 'rgba(57, 255, 20, 0.02)' },
  orange: { start: 'rgba(255, 158, 0, 0.35)', end: 'rgba(255, 158, 0, 0.02)' },
  purple: { start: 'rgba(192, 132, 252, 0.35)', end: 'rgba(192, 132, 252, 0.02)' },
};

// ─── Axis & Grid Styles ────────────────────────────────────
export const AXIS_STYLE = {
  tick: {
    fill: '#a78bfa',
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
  },
  axisLine: {
    stroke: 'rgba(250, 64, 96, 0.15)',
    strokeWidth: 1,
  },
  tickLine: {
    stroke: 'rgba(250, 64, 96, 0.1)',
  },
};

export const GRID_STYLE = {
  strokeDasharray: '3 6',
  stroke: 'rgba(250, 64, 96, 0.08)',
  vertical: false as const,
};

// ─── Tooltip Styles ────────────────────────────────────────
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(10, 1, 18, 0.95)',
  border: '1px solid rgba(250, 64, 96, 0.3)',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(250, 64, 96, 0.15)',
  backdropFilter: 'blur(12px)',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.8rem',
  color: '#f8fafc',
};

export const TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: '#d8b4fe',
  fontWeight: 700,
  fontSize: '0.85rem',
  marginBottom: '6px',
  fontFamily: "'Outfit', sans-serif",
};

export const TOOLTIP_ITEM_STYLE: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.78rem',
  padding: '2px 0',
};

// ─── Legend Style ──────────────────────────────────────────
export const LEGEND_STYLE: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: '0.78rem',
  color: '#d8b4fe',
};

// ─── Reference Line Style ──────────────────────────────────
export const REFERENCE_LINE_STYLE = {
  stroke: '#FA4060',
  strokeWidth: 2,
  strokeDasharray: '6 4',
  opacity: 0.7,
};

// ─── Animation Config ──────────────────────────────────────
export const ANIMATION_CONFIG = {
  duration: 800,
  easing: 'ease-out' as const,
};

// ─── Helpers ───────────────────────────────────────────────

/** Get color from sequence by index (wraps around) */
export function getSeriesColor(index: number): string {
  return COLOR_SEQUENCE[index % COLOR_SEQUENCE.length];
}

/** Generate an efficiency color from green → yellow → red */
export function getEfficiencyColor(efficiency: number): string {
  if (efficiency >= 80) return CHART_COLORS.green;
  if (efficiency >= 60) return CHART_COLORS.yellow;
  if (efficiency >= 40) return CHART_COLORS.orange;
  return CHART_COLORS.pink;
}

/** Format large numbers in a compact way */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

/** Format seconds as human-readable duration */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// React import needed for CSSProperties type
import React from 'react';
