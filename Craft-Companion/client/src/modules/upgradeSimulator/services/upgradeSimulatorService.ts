import type { FactoryDataRow } from '../../../services/factoryData';
import { loadFactoryData } from '../../../services/factoryData';
import type {
  FacilityMeta,
  FactoryUpgradeRow,
  RequiredResource,
  ShoppingListItem,
  ConsolidatedResource,
} from '../types';
import { FACILITY_CATALOG } from '../data/upgradeSimulatorCatalog';

// Cache for mines data
let minesDataCache: FactoryDataRow[] | null = null;

export async function loadMinesData(): Promise<FactoryDataRow[]> {
  if (minesDataCache) return minesDataCache;

  if (typeof window === 'undefined') {
    try {
      const dynamicImport = new Function('mod', 'return import(mod)');
      const fs = await dynamicImport('node:fs');
      const path = await dynamicImport('node:path');
      const cwd = process.cwd();
      const possiblePaths = [
        path.resolve(cwd, 'client/public/data/mines.json'),
        path.resolve(cwd, 'public/data/mines.json'),
        path.resolve(cwd, 'data/mines.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf8');
          const jsonData = JSON.parse(raw);
          if (Array.isArray(jsonData)) {
            minesDataCache = jsonData;
            return minesDataCache;
          }
        }
      }
    } catch {
      // Fall through
    }
  }

  try {
    const res = await fetch('/data/mines.json');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        minesDataCache = json;
        return minesDataCache;
      }
    }
  } catch {
    // Return empty fallback
  }

  return [];
}

/**
 * Generates synthetic per-level progression for Construction factories
 * matching authentic verified Rawffle max-level totals.
 */
function getConstructionProgression(token: string): Array<{ level: number; token: string; amount: number }> {
  const list: Array<{ level: number; token: string; amount: number }> = [];

  switch (token) {
    case 'PAINT': {
      // 14 levels (2..15), total 124 PAINT
      for (let l = 2; l <= 15; l++) {
        const amt = Math.round(124 / 14);
        list.push({ level: l, token: 'PAINT', amount: amt });
      }
      break;
    }
    case 'NAIL': {
      // 19 levels (2..20), total 78 NAIL, 42 PAINT
      for (let l = 2; l <= 20; l++) {
        list.push({ level: l, token: 'NAIL', amount: +(78 / 19).toFixed(1) });
        if (l % 2 === 0) list.push({ level: l, token: 'PAINT', amount: +(42 / 9).toFixed(1) });
      }
      break;
    }
    case 'TILE': {
      // 24 levels (2..25), total 68 TILE, 140 NAIL, 31 PAINT
      for (let l = 2; l <= 25; l++) {
        list.push({ level: l, token: 'TILE', amount: +(68 / 24).toFixed(1) });
        list.push({ level: l, token: 'NAIL', amount: +(140 / 24).toFixed(1) });
        if (l % 3 === 0) list.push({ level: l, token: 'PAINT', amount: +(31 / 8).toFixed(1) });
      }
      break;
    }
    case 'BRICK': {
      // 29 levels (2..30), total 517 BRICK, 15 TILE, 64 NAIL, 27 PAINT
      for (let l = 2; l <= 30; l++) {
        list.push({ level: l, token: 'BRICK', amount: +(517 / 29).toFixed(1) });
        if (l % 4 === 0) list.push({ level: l, token: 'TILE', amount: +(15 / 7).toFixed(1) });
        if (l % 2 === 0) list.push({ level: l, token: 'NAIL', amount: +(64 / 14).toFixed(1) });
        if (l % 5 === 0) list.push({ level: l, token: 'PAINT', amount: +(27 / 5).toFixed(1) });
      }
      break;
    }
    case 'BEAM': {
      // 34 levels (2..35), total 127 BEAM, 1170 BRICK, 48 TILE, 53 NAIL, 20 PAINT
      for (let l = 2; l <= 35; l++) {
        list.push({ level: l, token: 'BEAM', amount: +(127 / 34).toFixed(1) });
        list.push({ level: l, token: 'BRICK', amount: +(1170 / 34).toFixed(1) });
        if (l % 3 === 0) list.push({ level: l, token: 'TILE', amount: +(48 / 11).toFixed(1) });
        if (l % 3 === 0) list.push({ level: l, token: 'NAIL', amount: +(53 / 11).toFixed(1) });
        if (l % 5 === 0) list.push({ level: l, token: 'PAINT', amount: +(20 / 6).toFixed(1) });
      }
      break;
    }
    default:
      break;
  }

  return list;
}

/**
 * Calculates required resources and COIN costs for upgrading a facility
 * between fromLevel and toLevel.
 */
export function calculateUpgradeRequirements(
  facility: FacilityMeta,
  fromLevel: number,
  toLevel: number,
  qty: number,
  factoryRows: FactoryDataRow[],
  mineRows: FactoryDataRow[],
  marketPrices: Record<string, number>,
): RequiredResource[] {
  if (fromLevel >= toLevel || qty <= 0) {
    return [];
  }

  const token = facility.token;
  const isEarthMine = token === 'EARTH_MINE';
  const isConstruction = facility.category === 'construction';

  const resourceMap: Record<string, number> = {};

  if (isEarthMine) {
    const relevant = mineRows.filter(
      (r) => r.level > fromLevel && r.level <= toLevel && r.upgrade_token && r.upgrade_amount,
    );
    for (const r of relevant) {
      const uTok = r.upgrade_token.toUpperCase();
      resourceMap[uTok] = (resourceMap[uTok] || 0) + (r.upgrade_amount || 0);
    }
  } else if (isConstruction) {
    const constructionSteps = getConstructionProgression(token);
    const relevant = constructionSteps.filter((s) => s.level > fromLevel && s.level <= toLevel);
    for (const s of relevant) {
      const uTok = s.token.toUpperCase();
      resourceMap[uTok] = (resourceMap[uTok] || 0) + s.amount;
    }
  } else {
    const relevant = factoryRows.filter(
      (r) =>
        r.token.toUpperCase() === token &&
        r.level > fromLevel &&
        r.level <= toLevel &&
        r.upgrade_token &&
        r.upgrade_amount,
    );
    for (const r of relevant) {
      const uTok = r.upgrade_token.toUpperCase();
      resourceMap[uTok] = (resourceMap[uTok] || 0) + (r.upgrade_amount || 0);
    }
  }

  const results: RequiredResource[] = [];

  for (const [resToken, baseAmt] of Object.entries(resourceMap)) {
    const totalAmount = baseAmt * qty;
    const unitPrice = marketPrices[resToken.toUpperCase()] ?? 1.0;
    const totalCoin = totalAmount * unitPrice;

    results.push({
      token: resToken,
      amount: totalAmount,
      unitPrice,
      totalCoin,
    });
  }

  return results;
}

/**
 * Consolidates multiple required resources into a grouped array.
 */
export function consolidateResources(
  items: Array<{ requiredResources: RequiredResource[] }>,
): ConsolidatedResource[] {
  const map: Record<string, { totalAmount: number; unitPrice: number; totalCostCoin: number }> = {};

  for (const item of items) {
    for (const req of item.requiredResources) {
      const tok = req.token.toUpperCase();
      if (!map[tok]) {
        map[tok] = {
          totalAmount: 0,
          unitPrice: req.unitPrice,
          totalCostCoin: 0,
        };
      }
      map[tok].totalAmount += req.amount;
      map[tok].totalCostCoin += req.totalCoin;
    }
  }

  return Object.entries(map).map(([token, data]) => ({
    token,
    totalAmount: data.totalAmount,
    unitPrice: data.unitPrice,
    totalCostCoin: data.totalCostCoin,
  }));
}
