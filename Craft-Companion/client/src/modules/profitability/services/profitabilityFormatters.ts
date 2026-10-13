// Presentación: formateo de visualización del módulo Profitability.
// Razón de cambio única: diseño/UX (textos legibles, precisión numérica).
// El cálculo de dominio (cycleAdjuster) devuelve datos puros (RawBaseMaterial[]);
// la conversión a texto legible ocurre aquí, en el borde de la UI.
import { formatNumber } from '../../../utils/formatters';
import type { RawBaseMaterial } from '../types';

/**
 * Convierte la lista de materiales base en texto legible:
 * "EARTH (12,3), WATER (4,5)".
 */
export function formatRawBaseMaterials(materials: RawBaseMaterial[]): string {
  return materials
    .map((m) => `${m.token} (${formatNumber(m.amountPerCycle, 1)})`)
    .join(', ');
}
