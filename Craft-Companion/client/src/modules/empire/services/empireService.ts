import type {
  BuildingSummaryItem,
  PlotFactorySummary,
  EmpireOverviewStats,
} from '../types';

export function formatPlotName(name: string, lang = 'es'): string {
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
  const map: Record<string, { es: string; en: string; icon: string }> = {
    POWER_PLANT: { es: 'Planta de Poder', en: 'Power Plant', icon: '⚡' },
    BATTERY: { es: 'Batería', en: 'Battery', icon: '🔋' },
    VAULT: { es: 'Bóveda', en: 'Vault', icon: '🏦' },
    TOWN_HALL: { es: 'Ayuntamiento', en: 'Town Hall', icon: '🏛️' },
    RESEARCH_CENTER: { es: 'Centro de Investigación', en: 'Research Center', icon: '🔬' },
    WORKSHOP: { es: 'Taller', en: 'Workshop', icon: '🛠️' },
    PROFICIENCY: { es: 'Maestría', en: 'Proficiency', icon: '⭐' },
    HATCHERY: { es: 'Criadero (Hatchery)', en: 'Hatchery', icon: '🥚' },
    HOUSE: { es: 'Casa', en: 'House', icon: '🏡' },
    EXCHANGE: { es: 'Mercado (Exchange)', en: 'Exchange', icon: '⚖️' },
    EDUCATIONAL: { es: 'Academia', en: 'Academy', icon: '🎓' },
    COSMETIC: { es: 'Decoración', en: 'Cosmetic', icon: '🌳' },
  };
  const entry = map[type];
  if (entry) return `${entry.icon} ${lang === 'es' ? entry.es : entry.en}`;
  return type.replace(/_/g, ' ');
}

export function calculateEmpireOverviewStats(data: any): EmpireOverviewStats {
  const craftWorld = data?.craftWorld || {};
  const landPlots = craftWorld.landPlots || [];
  const dynos = craftWorld.dynos || [];
  const workers = craftWorld.workers || [];
  const inventory = data?.inventory || {};
  const eggs = inventory.eggs || [];
  const totalEggs = eggs.reduce((acc: number, e: any) => acc + (Number(e?.amount) || 0), 0);

  const totalFactories = landPlots.reduce(
    (sum: number, p: any) =>
      sum +
      (p.areas || []).reduce(
        (aSum: number, a: any) => aSum + (a.factories?.length || 0),
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

export function summarizeBuildings(playerBase: any[]): Record<string, BuildingSummaryItem> {
  const buildingSummary: Record<string, BuildingSummaryItem> = {};
  (playerBase || []).forEach((b: any) => {
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

export function extractPlotFactorySummary(plot: any): PlotFactorySummary {
  const areas = plot?.areas || [];
  const allPlotFactories: string[] = [];
  areas.forEach((a: any) => {
    (a.factories || []).forEach((f: any) => {
      const token = f?.factory?.definition?.id || f?.id || 'FACTORY';
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
