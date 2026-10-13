// Primitivas visuales compartidas (LP1): un solo lenguaje de tarjeta para
// toda la app. Cualquier KPI con icono + etiqueta + valor + delta debe ser
// un MetricCard; cualquier etiqueta informativa un StatPill; cualquier
// cabecera de módulo un PageHeader (que ya integra el PriceTrustBanner).
import React from 'react';
import { PriceTrustBanner } from '../PriceTrustBanner';

type Tone = 'emerald' | 'amber' | 'rose' | 'sky' | 'zinc';

const TONE_TEXT: Record<Tone, string> = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  sky: 'text-sky-400',
  zinc: 'text-zinc-300',
};

const TONE_BG: Record<Tone, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  rose: 'bg-rose-500/15 text-rose-300',
  sky: 'bg-sky-500/15 text-sky-300',
  zinc: 'bg-oled-pill text-zinc-300',
};

/* ---------------------------- StatPill ---------------------------- */
export interface StatPillProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: Tone;
  title?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  icon,
  children,
  tone = 'zinc',
  title,
}) => (
  <span
    title={title}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${TONE_BG[tone]}`}
  >
    {icon}
    <span className="truncate">{children}</span>
  </span>
);

/* ---------------------------- MetricCard ---------------------------- */
export interface MetricCardProps {
  /** Etiqueta pequeña superior. */
  label: React.ReactNode;
  /** Valor grande principal. */
  value: React.ReactNode;
  /** Unidad/sufijo tras el valor (ej. "COIN", "%", "detectadas"). */
  unit?: React.ReactNode;
  /** Texto auxiliar pequeño bajo el valor. */
  subtitle?: React.ReactNode;
  /** Icono a la izquierda de la etiqueta. */
  icon?: React.ReactNode;
  tone?: Tone;
  hint?: string;
  /** 'compact' = tarjeta pequeña (modales/filas); 'kpi' = tarjeta grande estilo Home. */
  variant?: 'compact' | 'kpi';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  icon,
  tone = 'zinc',
  hint,
  variant = 'compact',
  className = '',
}) =>
  variant === 'kpi' ? (
    <div
      title={hint}
      className={`bg-oled-card hover:bg-oled-850 rounded-[24px] sm:rounded-[32px] p-3.5 sm:p-5 shadow-lg flex flex-col justify-between transition-all duration-200 select-none border-none min-w-0 ${className}`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {icon}
        <span className="text-[11px] sm:text-sm font-semibold text-slate-200 truncate">
          {label}
        </span>
      </div>
      <div className="mt-3 sm:mt-4 min-w-0">
        <div
          className={`text-base sm:text-2xl font-bold font-sans tracking-tight leading-tight truncate ${
            tone === 'zinc' ? 'text-white' : TONE_TEXT[tone]
          }`}
        >
          {value}
          {unit && (
            <span className="text-xs font-semibold text-slate-400 font-sans ml-1">{unit}</span>
          )}
        </div>
        {subtitle && (
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div
      title={hint}
      className={`bg-oled-850 p-3 rounded-2xl flex flex-col justify-between min-w-0 ${className}`}
    >
      <span className="text-zinc-400 text-[11px] font-medium truncate flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <p
        className={`text-base sm:text-lg font-mono font-bold mt-1 truncate ${TONE_TEXT[tone]}`}
      >
        {value}
        {unit && <span className="text-[11px] font-semibold text-zinc-400 ml-1">{unit}</span>}
      </p>
      {subtitle && <span className="text-[11px] text-zinc-400 truncate">{subtitle}</span>}
    </div>
  );

/* ---------------------------- PageHeader ---------------------------- */
export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Si true (default), monta el banner global de confianza de precios (QW2). */
  showTrust?: boolean;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  showTrust = true,
  className = '',
}) => (
  <div className={`flex flex-col items-center text-center gap-3 select-none w-full ${className}`}>
    <h1 className="font-game text-xl sm:text-2xl md:text-3xl text-white tracking-wide uppercase drop-shadow-md">
      {title}
    </h1>
    {showTrust && <PriceTrustBanner />}
    {description && (
      <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed px-2">
        {description}
      </p>
    )}
    {actions && <div className="flex flex-wrap items-center justify-center gap-2 mt-1">{actions}</div>}
  </div>
);

export default { StatPill, MetricCard, PageHeader };
