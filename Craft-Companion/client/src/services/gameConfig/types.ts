/**
 * Tipos de la configuración estática oficial de Craft World.
 * Fuente: POST https://craft-world.gg/graphql — query
 * AggregatedCraftWorldConfigurationQuery (endpoint público del cliente del juego,
 * proporcionado por el equipo de Craft World el 2026-10-12).
 */

export interface ConfigResource {
  symbol: string;
  amount: number;
}

export interface FactoryLevelDefinition {
  cost: ConfigResource[];
  input: ConfigResource[];
  output: ConfigResource | null;
  millisecondsPerCompletion: number;
  batteryCost: number;
}

export interface FactoryDefinition {
  id: string;
  displayName: string;
  experiencePerOutput: number;
  levels: FactoryLevelDefinition[];
  cost?: ConfigResource[];
}

export interface MineLevelDefinition {
  input: ConfigResource[];
  output: ConfigResource | null;
  millisecondsPerCompletion: number;
  cost: ConfigResource[];
  adAvailable: boolean;
  batteryCost: number;
}

export interface MineDefinition {
  id: string;
  levels: MineLevelDefinition[];
}

export interface ProficiencyLevel {
  requiredAmount: number;
  inputDiscountFactor: number;
}

export interface ProficiencyResourceConfig {
  symbol: string;
  levels: ProficiencyLevel[];
}

export interface WorkshopSkillLevel {
  requiredSkillPoints: number;
  speedBonusPercentage: number;
}

export interface WorkshopSkillConfig {
  symbol: string;
  levels: WorkshopSkillLevel[];
}

export interface GameTaxes {
  tradeInputTaxRate: number;
  withdrawTaxRate: number;
  partnerTokenPurchaseTaxRate: number;
}

export interface AreaBoostConfiguration {
  unlockLevelIndex: number;
  timeReductions: number[];
  unlockedAmount: number;
}

export interface GameConfiguration {
  maxPower: number;
  powerPerRefill: number;
  millisecondsToRefill: number;
  areaBoostConfiguration: AreaBoostConfiguration;
  tax: GameTaxes;
}

export interface TradeTierConfiguration {
  dailyRefillAmount: number;
  capacity: number;
}

export interface TradeConfiguration {
  free: TradeTierConfiguration;
  proAccount: TradeTierConfiguration;
  tradePass: TradeTierConfiguration;
}

export interface TraitDefinition {
  id: string;
  rarity: string;
  resourceSymbols: string[];
  value: number;
  weight: number;
}

export interface WorkerAbilityDefinition {
  id: string;
  cooldownMs: number;
  resourceSymbols: string[];
  effect: { type: string; boostValue: number; durationMs: number };
}

export interface BoosterDefinition {
  id: string;
  type: string;
  boostValue: number;
  durationMs: number;
}

export interface AccountLevelRow {
  points: number;
  index: number;
}

export interface LandPlotAreaDefinition {
  type: string;
  symbol: string;
  factorySlotsCount: number;
  factorySlotUnlockLevels: number[];
  refundFactor: number;
  cost: ConfigResource[];
  workerHut: boolean;
}

export interface LandPlotDefinition {
  name: string;
  unlockLevel: number;
  alwaysVisible: boolean;
  requiresBlueprint: boolean;
  eventName?: string | null;
  areas: LandPlotAreaDefinition[];
}

export interface ResearchDefinition {
  symbol: string;
  durationInMilliseconds: number;
  requiredLevel: number;
  requirement?: { researchedSymbols: string[]; researchLevel: number } | null;
}

/**
 * Bloques adicionales del config que el típado detallado aún no cubre: se
 * conservan con tipado laxo para no perder datos en el snapshot.
 */
export interface GameConfigData {
  checksum: string;
  factoryDefinitions: FactoryDefinition[];
  mineDefinitions: MineDefinition[];
  factoryDemolishCrystalCost?: number;
  landPlotDefinitions: LandPlotDefinition[];
  levels: AccountLevelRow[];
  gameConfiguration: GameConfiguration;
  tradeConfiguration?: TradeConfiguration;
  crystalPassConfiguration?: { daysActive: number; crystalsPerDay: number };
  timeSkip?: unknown;
  masterpieceConfiguration?: { requiredBuildings: Array<{ type: string; level: number }> };
  leagueDefinitions?: Array<{ id: string; name: string; upgradeCount: number; downgradeCount: number }>;
  playerBaseConfiguration?: unknown;
  workshopConfiguration: {
    workshopSkills: WorkshopSkillConfig[];
    skillPointsPerWorkshopLevel?: number[];
    workshopResetCrystalCost?: number;
  };
  proficiencyConfiguration: { resources: ProficiencyResourceConfig[] };
  researches?: ResearchDefinition[];
  powerPackDefinitions?: Array<{ id: string; factor: number }>;
  boosterDefinitions?: BoosterDefinition[];
  eggs?: unknown[];
  blueprintDefinitions?: unknown[];
  blueprintRarityDefinitions?: unknown[];
  chestDefinitions?: unknown[];
  traitDefinitions?: TraitDefinition[];
  workerAbilityDefinitions?: WorkerAbilityDefinition[];
  retirement?: unknown;
  [key: string]: unknown;
}

export interface GameConfigSnapshot {
  meta: { checksum: string; builtAt: string; source: string };
  data: GameConfigData;
}
