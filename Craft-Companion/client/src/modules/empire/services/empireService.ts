import type {
  BuildingSummaryItem,
  PlotFactorySummary,
  EmpireOverviewStats,
} from '../types';
import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
  CraftworldBuilding,
  CraftworldEgg,
} from '../../../types';

export function formatPlotName(name?: string, lang = 'es'): string {
  if (!name) return lang === 'es' ? 'Parcela' : 'Plot';
  const clean = name.replace(/_/g, ' ');
  if (lang === 'es') {
    if (name.includes('EARTH')) return 'Parcela de Tierra';
    if (name.includes('FLEXIBLE')) return 'Parcela Flexible';
    if (name.includes('BLUEPRINT_PLOT_A')) return 'Parcela de Planos A';
    if (name.includes('BLUEPRINT_PLOT_B')) return 'Parcela de Planos B';
    if (name.includes('BLUEPRINT')) return 'Parcela de Planos';
  }
  return clean;
}

export function formatBuildingType(type: string, lang = 'es'): string {
  if (!type) return '';
  const map: Record<string, { es: string; en: string }> = {
    POWER_PLANT: { es: 'Planta de Poder', en: 'Power Plant' },
    BATTERY: { es: 'Batería', en: 'Battery' },
    VAULT: { es: 'Bóveda', en: 'Vault' },
    TOWN_HALL: { es: 'Ayuntamiento', en: 'Town Hall' },
    RESEARCH_CENTER: { es: 'Centro de Investigación', en: 'Research Center' },
    WORKSHOP: { es: 'Taller', en: 'Workshop' },
    PROFICIENCY: { es: 'Maestría', en: 'Proficiency' },
    HATCHERY: { es: 'Criadero (Hatchery)', en: 'Hatchery' },
    HOUSE: { es: 'Casa', en: 'House' },
    EXCHANGE: { es: 'Mercado (Exchange)', en: 'Exchange' },
    EDUCATIONAL: { es: 'Academia', en: 'Academy' },
    COSMETIC: { es: 'Decoración', en: 'Cosmetic' },
  };
  const entry = map[type];
  if (entry) return lang === 'es' ? entry.es : entry.en;
  return type.replace(/_/g, ' ');
}

export function calculateEmpireOverviewStats(
  data: CraftworldHomePayload | null | undefined,
): EmpireOverviewStats {
  const craftWorld = data?.craftWorld || {};
  const landPlots = craftWorld.landPlots || [];
  const dynos = craftWorld.dynos || [];
  const workers = craftWorld.workers || [];
  const inventory = Array.isArray(data?.inventory) ? { eggs: [] } : (data?.inventory || {});
  const eggs: CraftworldEgg[] = inventory.eggs || [];
  const totalEggs = eggs.reduce((acc: number, e: CraftworldEgg) => acc + (Number(e?.amount) || 0), 0);

  const totalFactories = landPlots.reduce(
    (sum: number, p: CraftworldLandPlot) =>
      sum +
      (p.areas || []).reduce(
        (aSum: number, a: CraftworldLandArea) => aSum + (a.factories?.length || 0),
        0,
      ),
    0,
  );

  const dynosOrEggsText = dynos.length > 0 ? String(dynos.length) : `${totalEggs} 🥚`;

  return {
    totalPlots: landPlots.length,
    totalFactories,
    totalWorkers: workers.length,
    dynosOrEggsText,
  };
}

export function summarizeBuildings(
  playerBase?: CraftworldBuilding[] | null,
): Record<string, BuildingSummaryItem> {
  const buildingSummary: Record<string, BuildingSummaryItem> = {};
  (playerBase || []).forEach((b: CraftworldBuilding) => {
    if (!b?.type) return;
    if (!buildingSummary[b.type]) {
      buildingSummary[b.type] = { count: 0, maxLevel: 0, levels: [] };
    }
    buildingSummary[b.type].count += 1;
    const lvl = typeof b.level === 'number' ? b.level : 1;
    buildingSummary[b.type].levels.push(lvl);
    if (lvl > buildingSummary[b.type].maxLevel) {
      buildingSummary[b.type].maxLevel = lvl;
    }
  });
  return buildingSummary;
}

export function extractPlotFactorySummary(
  plot?: CraftworldLandPlot | null,
): PlotFactorySummary {
  const areas = plot?.areas || [];
  const allPlotFactories: string[] = [];
  areas.forEach((a: CraftworldLandArea) => {
    (a.factories || []).forEach((f: CraftworldFactoryInstance) => {
      const token = f?.factory?.definition?.id || f?.id || f?.symbol || 'FACTORY';
      allPlotFactories.push(token);
    });
  });

  const counts: Record<string, number> = {};
  allPlotFactories.forEach((t) => {
    counts[t] = (counts[t] || 0) + 1;
  });

  return {
    factories: allPlotFactories,
    counts,
  };
}
