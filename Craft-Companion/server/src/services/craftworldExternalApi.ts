import { randomBytes, createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const craftWorldBaseUrl = process.env.CRAFTWORLD_BASE_URL || 'https://craft-world.gg';
const externalApiBase = `${craftWorldBaseUrl}/api/2/external`;

export type ExternalApiErrorCode =
  'insufficient_scope' | 'invalid_token' | 'rate_limited' | 'server_error' | 'unknown';

export class ExternalApiError extends Error {
  code: ExternalApiErrorCode;
  status: number;
  constructor(message: string, code: ExternalApiErrorCode, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'ExternalApiError';
  }
}

export type ExternalProfile = {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  level?: number;
  leagueId?: number;
  achievements?: Array<{ type: string; subType: string; value: number; currentStreak: number }>;
  leagueTrophies?: Array<{ leagueId: number; rank1Count: number }>;
  lastSyncedAt: string;
};

export type ExternalCraftWorld = {
  experiencePoints?: number;
  level?: number;
  resources?: Array<{ symbol: string; amount: number }>;
  playerBase?: any[];
  ownedSpaceIds?: number[];
  globalCoordinate?: { x: number; y: number };
  landPlots?: any[];
  mines?: any[];
  dynos?: any[];
  workers?: any[];
  lastSyncedAt: string;
};

export type ExternalMasterpieces = {
  claimedMasterpieceIds?: (number | string)[];
  activeBattlePasses?: (number | string)[];
  seasonPasses?: (number | string)[];
  activeSeason?: any;
  lastSyncedAt: string;
};

export type ExternalCraft = {
  power: number;
  powerUsed: number;
  powerLastRefill: string;
  powerMillisecondsUntilRefill?: number;
  skillPoints: number;
  workshop: Array<{ symbol: string; level: number }>;
  proficiencies: Array<{ symbol: string; collectedAmount: number; claimedLevel: number }>;
  researches: Array<{ symbol: string; claimed: boolean; remainingInMilliseconds?: number }>;
  vaults: Array<{
    symbol: string;
    amount: number;
    capacity: number;
    isUnlocked: boolean;
    buildingUnlockLevel: number;
  }>;
  currencyBalances: Array<{ type: string; amount: number }>;
  lastSyncedAt: string;
};

export type ExternalExchange = {
  tradeAccount: {
    tradeCount: number;
    dailyRefillAmount: number;
    totalTradeAmount: number;
    capacity: number;
  };
  tradeExecutions: Array<{
    id: string;
    errorReason?: string;
    quote: {
      type: string;
      input: { symbol: string; amount: number };
      output: { symbol: string; amount: number };
    };
    trade?: {
      transactionHash: string;
      blockNumber?: number;
      input?: { symbol: string; amount: number };
      output?: { symbol: string; amount: number };
    };
  }>;
  lastSyncedAt: string;
};

export type ExternalOnchain = {
  wallets: Array<{
    address: string;
    type: string;
    provider?: string;
    providerId?: string;
    primary: boolean;
  }>;
  resourcesOnChain: Array<{ symbol: string; amount: number }>;
  lastSyncedAt: string;
};

export type ExternalInventory = {
  eggs: Array<{ definitionId: string; amount: number }>;
  eggGuaranteeProgress: Array<{
    eggDefinitionId: string;
    hatchesSinceGuarantee: number;
    hatchesUntilGuaranteed: number;
  }>;
  chests: Array<{ definitionId: string; count: number }>;
  blueprintInventory: Array<{
    definitionId: string;
    amount: number;
    starLevel: number;
    landPlotUuids: string[];
  }>;
  factoryInventory: Array<{ id: string; definitionId: string; level: number }>;
  availableBoosters: Array<{ id: string; amount: number }>;
  availablePowerPacks: Array<{ id: string; amount: number }>;
  lastSyncedAt: string;
};

export type ExternalPurchases = {
  isNoAdsActive: boolean;
  isTransferActive: boolean;
  crystalPass: {
    claimableCrystals: number;
    claimableDays: number;
    remainingDays: number;
    maxDays: number;
    hasActivePass: boolean;
    isClaimable: boolean;
  };
  shopItemPurchases: Array<{ shopItemId: string; purchasedAt: string }>;
  offers: Array<any>;
  adWatchCounts: Array<{ adPlacement: string; count: number; resetsAt: string }>;
  lastSyncedAt: string;
};

export type ExternalPriceList = {
  baseSymbol: string;
  prices: Array<{ referenceSymbol: string; amount: number; recommendation: string }>;
  lastSyncedAt: string;
};

export type ExternalDynoProductionCycle = {
  startedAt: string;
  millisecondsPerCompletion: number;
  lastSyncedAt: string;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let raw: any;
  try {
    raw = text ? JSON.parse(text) : {};
  } catch {
    throw new ExternalApiError('Invalid JSON response', 'unknown', res.status);
  }
  if (!res.ok) {
    const code = raw?.error?.code || raw?.code || 'server_error';
    const message =
      raw?.error?.description ||
      raw?.message ||
      raw?.error?.message ||
      'External API request failed.';
    throw new ExternalApiError(message, code as ExternalApiErrorCode, res.status);
  }
  return raw?.data as T;
}

function bearerHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export async function getExternalProfile(token: string): Promise<ExternalProfile> {
  const res = await fetch(`${externalApiBase}/me/profile`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalProfile>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalCraftWorld(token: string): Promise<ExternalCraftWorld> {
  const res = await fetch(`${externalApiBase}/me/craft-world`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalCraftWorld>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalMasterpieces(token: string): Promise<ExternalMasterpieces> {
  const res = await fetch(`${externalApiBase}/me/masterpieces`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalMasterpieces>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalCraft(token: string): Promise<ExternalCraft> {
  const res = await fetch(`${externalApiBase}/me/craft`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalCraft>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalExchange(token: string): Promise<ExternalExchange> {
  const res = await fetch(`${externalApiBase}/me/exchange`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalExchange>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalOnchain(token: string): Promise<ExternalOnchain> {
  const res = await fetch(`${externalApiBase}/me/onchain`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalOnchain>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalInventory(token: string): Promise<ExternalInventory> {
  const res = await fetch(`${externalApiBase}/me/inventory`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalInventory>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalPurchases(token: string): Promise<ExternalPurchases> {
  const res = await fetch(`${externalApiBase}/me/purchases`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalPurchases>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalPriceList(token: string): Promise<ExternalPriceList> {
  const res = await fetch(`${externalApiBase}/game/price-list`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalPriceList>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}

export async function getExternalDynoProductionCycle(
  token: string,
): Promise<ExternalDynoProductionCycle> {
  const res = await fetch(`${externalApiBase}/game/dyno-production-cycle`, {
    headers: bearerHeaders(token),
  });
  const data = await readJson<ExternalDynoProductionCycle>(res);
  return { ...data, lastSyncedAt: new Date().toISOString() };
}
