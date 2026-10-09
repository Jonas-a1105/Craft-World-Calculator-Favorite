export interface BuildingLevelData {
  level: number;
  token: string;
  name: string;
  costToken: string;
  costAmount: number;
  upgradeDurationRaw: string;
  upgradeDurationSec: number;
  cycleDurationRaw?: string;
  cycleDurationSec?: number;
  power?: number;
  prodPerDay?: number;
  powerPerHour?: number;
  input1Token?: string;
  input1Amount?: number;
  capacity?: number;
  townHallLevel?: number;
  maxCount?: number;
  residents?: number;
  slots?: number;
  incubationDiscount?: string;
  trainingTime?: string;
  talentChances?: {
    common?: string;
    uncommon?: string;
    rare?: string;
    epic?: string;
    legendary?: string;
    mythic?: string;
  };
  requiredTownHallLevel?: number;
  unlockLevel?: number;
  size?: string;
  powerRecoveryStep?: string;
}

export type BuildingsMap = Record<string, BuildingLevelData[]>;

let buildingDataCache: BuildingsMap | null = null;

export async function loadBuildingData(): Promise<BuildingsMap> {
  if (buildingDataCache) return buildingDataCache;

  // 0. Node.js environment fallback for automated tests
  if (typeof window === 'undefined') {
    try {
      const dynamicImport = new Function('mod', 'return import(mod)');
      const fs = await dynamicImport('node:fs');
      const path = await dynamicImport('node:path');
      const cwd = process.cwd();
      const possiblePaths = [
        path.resolve(cwd, 'client/public/data/buildings.json'),
        path.resolve(cwd, 'public/data/buildings.json'),
        path.resolve(cwd, 'data/buildings.json'),
        path.resolve(cwd, '../client/public/data/buildings.json'),
        path.resolve(cwd, '../../client/public/data/buildings.json'),
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf8');
          const jsonData = JSON.parse(raw);
          if (jsonData && typeof jsonData === 'object') {
            buildingDataCache = jsonData;
            return buildingDataCache!;
          }
        }
      }
    } catch {
      // Fall through to browser fetch
    }
  }

  // 1. Browser fetch
  try {
    const res = await fetch('/data/buildings.json');
    if (res.ok) {
      const jsonData = await res.json();
      if (jsonData && typeof jsonData === 'object') {
        buildingDataCache = jsonData;
        return buildingDataCache!;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch /data/buildings.json', err);
  }

  return {};
}
