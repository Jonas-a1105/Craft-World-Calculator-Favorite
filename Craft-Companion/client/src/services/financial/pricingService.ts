/**
 * PricingService — Fuente Única de la Verdad para toda la matemática financiera
 * del cliente (precios, ganancias, márgenes, ROI y conversiones de moneda).
 *
 * POLÍTICAS ESTANDARIZADAS (válidas en TODO el flujo):
 * 1. Redondeo: Half-Up (0.5 siempre hacia arriba en magnitud) con corrección
 *    de epsilon para neutralizar la imprecisión binaria de IEEE-754.
 * 2. Margen vs Markup:
 *    - marginPercentOnRevenue: (utilidad / revenue) * 100  → tablas de rentabilidad.
 *    - markupPercentOnCost:    (utilidad / costo) * 100    → crafteo vs mercado, arbitraje.
 * 3. Conversiones COIN ⇄ USD siempre pasan por coinToUsd / usdToCoin;
 *    ningún componente multiplica priceUsd directamente.
 *
 * Las magnitudes del dominio (precios crypto COIN ~1e-4) siguen representándose
 * como number; la precisión se garantiza no redondeando hasta la capa de salida
 * (presentación / contratos), cumpliendo la política definida aquí.
 */

/** Tolerancia económica: diferencias por debajo se consideran iguales a cero. */
export const PRICE_EPSILON = 1e-9;

/** Decimales canónicos por tipo de salida. */
export const COIN_DECIMALS = 6;
export const PERCENT_DECIMALS = 2;

/** Convierte cualquier entrada a un número finito; si no, devuelve el fallback. */
export function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** true si el valor es económicamente indistinguible de cero. */
export function isEffectivelyZero(value: number): boolean {
  return !Number.isFinite(value) || Math.abs(value) <= PRICE_EPSILON;
}

/**
 * Redondeo Half-Up (empates lejos de cero) con corrección de imprecisión binaria.
 * roundHalfUp(1.005, 2) === 1.01 aunque 1.005 en float sea 1.004999...
 * roundHalfUp(-1.005, 2) === -1.01 (mismo comportamiento en magnitud).
 */
export function roundHalfUp(value: number, decimals = 0): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  // Number.EPSILON relativo corrige la representación binaria (siempre alza la
  // magnitud ~1 ulp) sin sesgar empates reales: los valores que están más de
  // 1 ulp por debajo del empate siguen redondeando hacia abajo.
  const corrected = value * factor * (1 + Number.EPSILON);
  const rounded = (corrected < 0 ? -1 : 1) * Math.round(Math.abs(corrected)) / factor;
  // Normaliza -0 a +0 para no propagarlo a la UI.
  return rounded === 0 ? 0 : rounded;
}

/** Suma exacta de una lista (compensación de Kahan) para evitar deriva de floats. */
export function sumPrecise(values: number[]): number {
  let sum = 0;
  let compensation = 0;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    const y = v - compensation;
    const t = sum + y;
    compensation = (t - sum) - y;
    sum = t;
  }
  return sum;
}

// ─── Ganancia ────────────────────────────────────────────────────────────────

/** Utilidad bruta = ingresos − costo. */
export function calcProfit(revenue: number, cost: number): number {
  return toFiniteNumber(revenue) - toFiniteNumber(cost);
}

/**
 * Margen sobre ingresos: (revenue − costo) / revenue * 100.
 * null cuando no hay ingresos (división indefinida).
 */
export function marginPercentOnRevenue(revenue: number, cost: number): number | null {
  const r = toFiniteNumber(revenue);
  if (isEffectivelyZero(r)) return null;
  return (calcProfit(r, cost) / r) * 100;
}

/**
 * Markup sobre costo: (revenue − costo) / costo * 100.
 * null cuando no hay costo base (división indefinida).
 */
export function markupPercentOnCost(revenue: number, cost: number): number | null {
  const c = toFiniteNumber(cost);
  if (isEffectivelyZero(c)) return null;
  return (calcProfit(revenue, c) / c) * 100;
}

/**
 * ROI sobre una inversión: (ganancia / inversión) * 100.
 * null cuando la inversión es cero.
 */
export function roiPercent(gain: number, investment: number): number | null {
  const inv = toFiniteNumber(investment);
  if (isEffectivelyZero(inv)) return null;
  return (toFiniteNumber(gain) / inv) * 100;
}

/** Variación porcentual de current vs previous; null si previous es cero. */
export function percentChange(current: number, previous: number): number | null {
  const prev = toFiniteNumber(previous);
  if (isEffectivelyZero(prev)) return null;
  return ((toFiniteNumber(current) - prev) / prev) * 100;
}

/** Ahorro % al preferir la alternativa barata: (caro − barato) / caro * 100. */
export function savingsPercentVs(expensive: number, cheap: number): number | null {
  const hi = toFiniteNumber(expensive);
  if (isEffectivelyZero(hi)) return null;
  return ((hi - toFiniteNumber(cheap)) / hi) * 100;
}

// ─── Conversión de moneda ────────────────────────────────────────────────────

/** COIN → USD usando la cotización dada; 0 si la tasa no es válida. */
export function coinToUsd(coinAmount: number, coinPriceUsd: number): number {
  if (isEffectivelyZero(coinPriceUsd)) return 0;
  return toFiniteNumber(coinAmount) * coinPriceUsd;
}

/** USD → COIN usando la cotización dada; 0 si la tasa no es válida. */
export function usdToCoin(usdAmount: number, coinPriceUsd: number): number {
  if (isEffectivelyZero(coinPriceUsd)) return 0;
  return toFiniteNumber(usdAmount) / coinPriceUsd;
}

/**
 * Resuelve la cotización COIN/USD efectiva aplicando el fallback canónico
 * cuando la tasa en vivo no está disponible o es inválida.
 */
export function resolveCoinUsdPrice(
  livePriceUsd: number | null | undefined,
  fallbackUsd: number,
): number {
  return typeof livePriceUsd === 'number' && Number.isFinite(livePriceUsd) && livePriceUsd > 0
    ? livePriceUsd
    : fallbackUsd;
}
