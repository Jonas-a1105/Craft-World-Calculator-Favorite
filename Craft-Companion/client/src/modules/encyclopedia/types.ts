export type EncyclopediaCategory = 'resources' | 'buildings' | 'events';

export interface CatalogItem {
  id: string;
  name: string;
  nameEs: string;
  category: EncyclopediaCategory;
  badge: string;
  badgeEs: string;
  iconSymbol: string;
  isBuilding?: boolean;
}

export interface EventRecipe {
  symbol: string;
  name: string;
  nameEs: string;
  duration: string;
  outputAmount: number;
  outputToken: string;
  inputs: Array<{ token: string; amount: number }>;
}

export interface EventGuideStep {
  step: number;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  tip?: string;
  tipEs?: string;
}

export interface EventFaqItem {
  question: string;
  questionEs: string;
  answer: string;
  answerEs: string;
}

export interface EventBatteryComparison {
  metric: string;
  metricEs: string;
  regular: string;
  event: string;
  change: string;
}

export interface EventKarmaTier {
  category: 'Common' | 'Rare' | 'Legendary';
  categoryEs: 'Común' | 'Raro' | 'Legendario';
  karma: number;
  karmaFormatted: string;
  workerNumber: number;
  bonus: string;
  bonusEs: string;
}

export interface MasterpiecePrizeBreakdown {
  mpNumber: number;
  name: string;
  nameEs: string;
  thRequirement: number;
  image?: string;
  prizes: Array<{
    rank: string;
    rankEs: string;
    reward: string;
    rewardEs: string;
  }>;
  notionUrl?: string;
}

export interface OfficialEventMedia {
  bannerImage?: string;
  flowImage?: string;
  timelineImage?: string;
  onboardingImage?: string;
  overviewPrizeImage?: string;
  mp1PrizeImage?: string;
  mp2PrizeImage?: string;
  mp3PrizeImage?: string;
  workersImage?: string;
  karmaModelImage?: string;
  statueImage?: string;
}

export interface OfficialEvent {
  id: string;
  catalogId: string;
  number: number;
  title: string;
  titleEs: string;
  tagline: string;
  taglineEs: string;
  partner: string;
  prizeSymbol: string;
  poolFactor: string;
  startDate: string;
  endDate: string;
  status: 'concluded' | 'active' | 'upcoming';
  levelRequirement: number;
  prizePoolSummary: string;
  prizePoolSummaryEs: string;
  description: string;
  descriptionEs: string;
  lore?: {
    hook: string;
    hookEs: string;
    body: string;
    bodyEs: string;
  };
  officialLinks?: Array<{
    label: string;
    labelEs: string;
    url: string;
    category: 'game' | 'social' | 'portal' | 'notion';
  }>;
  batteryOverhaul?: EventBatteryComparison[];
  karmaWorkers?: EventKarmaTier[];
  masterpieces?: MasterpiecePrizeBreakdown[];
  mediaImages?: OfficialEventMedia;
  mechanics: Array<{
    title: string;
    titleEs: string;
    description: string;
    descriptionEs: string;
  }>;
  recipes: EventRecipe[];
  rewardsTiers: Array<{
    tier: string;
    tierEs: string;
    description: string;
    descriptionEs: string;
  }>;
  guideSteps?: EventGuideStep[];
  faqs?: EventFaqItem[];
}

export interface LevelProgression {
  level: number;
  upgradeCostToken: string;
  upgradeCostAmount: number;
  upgradeCostDiff?: number;
  isMaterialSwitch: boolean;
  durationSeconds: number;
  durationFormatted: string;
  durationRaw?: string;
  durationDiffFormatted?: string;
  outputAmount: number;
  outputDiff?: number;
  power: number;
  powerDiff?: number;
  prodPerDay: number;
  prodPerDayDiff?: number;
  input1Token?: string;
  input1Amount?: number;
  input2Token?: string;
  input2Amount?: number;
  yieldPercent?: number;
  xpPerOutput?: number;
  xpPerDay?: number;
  xpPerBattery?: number;
  productionChange?: number;
  input1DailyConsumption?: number;
  input2DailyConsumption?: number;
  powerPerUnit?: number;
  capacity?: number;
  maxCount?: number;
  requiredTownHallLevel?: number;
  slots?: number;
  residents?: number;
  size?: string;
  trainingTime?: string;
  incubationDiscount?: string;
  talentChances?: Record<string, string>;
  powerRecoveryStep?: string;
  unlockLevel?: number;
}

export interface SummaryStats {
  maxLevel: number;
  prodPerDayAtMax: number;
  powerAtMax: number;
  cycleDurationAtMaxSeconds: number;
  cycleDurationAtMaxFormatted?: string;
  xpPerDayAtMax?: number;
}

export type TableViewMode = 'essential' | 'all';

