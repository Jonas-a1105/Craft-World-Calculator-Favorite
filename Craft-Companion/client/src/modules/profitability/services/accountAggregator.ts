import type {
  CraftworldHomePayload,
  CraftworldLandPlot,
  CraftworldLandArea,
  CraftworldFactoryInstance,
} from '../../../types';
import type { FactoryDataRow } from '../../../services/factoryData';
import { getMasteryLevel } from '../../../services/masteryModifiers';
import { getWorkshopSpeedBoostPercent } from '../../../services/workshopModifiers';
import { calculateWorkerReductionFactor } from '../../timers/services/factoryTimersService';
import type { FactoryRowConfig, BoostOption } from '../types';

export const RESOURCE_CATEGORY_MAP: Record<string, 'earth' | 'water' | 'fire' | 'special'> = {
  // Earth Category
  EARTH: 'earth',
  MUD: 'earth',
  CLAY: 'earth',
  SAND: 'earth',
  COPPER: 'earth',
  CERAMICS: 'earth',
  STONE: 'earth',
  CEMENT: 'earth',
  BOLTS: 'earth',
  LUMBER: 'earth',
  BEAM: 'earth',
  BRICK: 'earth',
  TILE: 'earth',
  NAIL: 'earth',
  PAINT: 'earth',

  // Water Category
  WATER: 'water',
  SEAWATER: 'water',
  ALGAE: 'water',
  OXYGEN: 'water',
  HYDROGEN: 'water',
  SALT: 'water',
  WETNEST: 'water',

  // Fire Category
  FIRE: 'fire',
  HEAT: 'fire',
  LAVA: 'fire',
  STEEL: 'fire',
  GLASS: 'fire',
  STEAM: 'fire',
  ENERGY: 'fire',
  WARMNEST: 'fire',

  // Special Category
  GAS: 'special',
  FUEL: 'special',
  OIL: 'special',
  ACID: 'special',
  SULFUR: 'special',
  PLASTICS: 'special',
  FIBERGLASS: 'special',
  DYNAMITE: 'special',
  KEY: 'special',
  CERAMICKEY: 'special',
  GLASSKEY: 'special',
  DYNOKEY: 'special',
  DUST: 'special',
  WIRE: 'special',
  NEST: 'special',
  DYNONEST: 'special',
  PAPERWRAP: 'special',
  SANDWRAP: 'special',
  STEAMWRAP: 'special',
  BOOK: 'special',
  ARTICLE: 'special',
  DIPLOMA: 'special',
};

export function getResourceCategory(token: string): 'earth' | 'water' | 'fire' | 'special' {
  const norm = token.toUpperCase().trim();
  return RESOURCE_CATEGORY_MAP[norm] || 'special';
}

/**
 * Normalizes raw factory definition ids or game symbols to the canonical token in factoryData
 */
export function normalizeTokenSymbol(raw?: string): string {
  if (!raw) return '';
  const upper = raw.trim().toUpperCase();
  if (upper === 'EARTH_MINE' || upper === 'EARTHMINE') return 'EARTH';
  if (upper === 'WOODCUTTER' || upper === 'WOOD') return 'LUMBER';
  if (upper === 'WATER_PUMP' || upper === 'WATERPUMP' || upper === 'WELL') return 'WATER';
  if (upper === 'FIRE_PIT' || upper === 'FIREPIT') return 'FIRE';
  return upper;
}

export interface AccountAggregatedFactory {
  token: string;
  count: number;
  highestLevel: number;
  averageWorkerPercent: number;
  workshopPercent: number;
  masteryLevel: number;
  boost: BoostOption;
}

/**
 * Aggregates all land plots, areas, and factories into a per-token summary of the player's account.
 */
export function aggregateAccountFactories(
  homeData?: CraftworldHomePayload | null,
  factoryRows: FactoryDataRow[] = [],
): Map<string, AccountAggregatedFactory> {
  const result = new Map<string, AccountAggregatedFactory>();
  if (!homeData?.craftWorld?.landPlots) return result;

  const proficiencies = homeData?.craft?.proficiencies || [];
  const workshop = homeData?.craft?.workshop || [];
  const isNoAdsActive = Boolean(homeData?.purchases?.isNoAdsActive);

  // Group instances by canonical token
  const instancesByToken = new Map<
    string,
    Array<{
      level: number;
      workerPercent: number;
      hasBooster: boolean;
    }>
  >();

  const landPlots = homeData.craftWorld.landPlots || [];
  landPlots.forEach((plot: CraftworldLandPlot) => {
    (plot.areas || []).forEach((area: CraftworldLandArea) => {
      (area.factories || []).forEach((facObj: CraftworldFactoryInstance) => {
        const fac = facObj?.factory || facObj;
        const rawSymbol = facObj?.factory?.definition?.id || facObj?.symbol || facObj?.definitionId || fac?.definition?.id || '';
        const token = normalizeTokenSymbol(rawSymbol);
        if (!token) return;

        const level =
          typeof fac?.level === 'number' && fac.level > 0
            ? fac.level
            : typeof facObj?.level === 'number' && facObj.level > 0
              ? facObj.level
              : 1;

        // Calculate worker speed reduction percent on this plot
        const reductionFactor = calculateWorkerReductionFactor(
          facObj.craftingReduction,
          facObj.workerBoostIntervals,
        );
        const workerPercent = Math.max(0, Math.round((1 - reductionFactor) * 100));

        // Detect boosters
        const hasBooster =
          (Array.isArray(facObj.boosters) && facObj.boosters.length > 0) ||
          Boolean(plot.booster) ||
          Boolean(area.booster);

        const list = instancesByToken.get(token) || [];
        list.push({ level, workerPercent, hasBooster });
        instancesByToken.set(token, list);
      });
    });
  });

  // Calculate aggregated stats for each token
  instancesByToken.forEach((instances, token) => {
    const count = instances.length;
    const highestLevel = Math.max(...instances.map((i) => i.level));
    const avgWorkerPct = Math.round(
      instances.reduce((sum, i) => sum + i.workerPercent, 0) / count,
    );
    const hasAnyBooster = instances.some((i) => i.hasBooster);
    const boost: BoostOption = hasAnyBooster || isNoAdsActive ? 'x2' : 'None';

    const workshopPct = getWorkshopSpeedBoostPercent(token, workshop);
    const mastery = getMasteryLevel(token, proficiencies);

    result.set(token, {
      token,
      count,
      highestLevel,
      averageWorkerPercent: avgWorkerPct,
      workshopPercent: workshopPct,
      masteryLevel: mastery,
      boost,
    });
  });

  return result;
}

/**
 * Creates the initial row configuration for a token from account data,
 * with fallbacks if the user does not own any factory of this type.
 */
export function getInitialFactoryRowConfig(
  token: string,
  accountMap: Map<string, AccountAggregatedFactory>,
  homeData?: CraftworldHomePayload | null,
): FactoryRowConfig {
  const norm = token.toUpperCase().trim();
  const acc = accountMap.get(norm);
  const isNoAdsActive = Boolean(homeData?.purchases?.isNoAdsActive);
  const workshop = homeData?.craft?.workshop || [];
  const proficiencies = homeData?.craft?.proficiencies || [];

  if (acc) {
    return {
      count: acc.count,
      level: acc.highestLevel,
      masteryLevel: acc.masteryLevel,
      workerPercent: acc.averageWorkerPercent,
      workshopPercent: acc.workshopPercent,
      boost: acc.boost,
    };
  }

  // Not placed on plots, but user might still have workshop and mastery unlocked
  const workshopPct = getWorkshopSpeedBoostPercent(norm, workshop);
  const mastery = getMasteryLevel(norm, proficiencies);

  return {
    count: 0,
    level: 1,
    masteryLevel: mastery,
    workerPercent: 0,
    workshopPercent: workshopPct,
    boost: isNoAdsActive ? 'x2' : 'None',
  };
}
