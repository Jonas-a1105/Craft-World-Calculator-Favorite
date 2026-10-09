export type MasterpieceLeagueId = 'bronze' | 'bronze2' | 'silver' | 'gold' | 'platinum';

export type ContributionTierId = '10%' | '25%' | '50%' | '100%' | '150%' | '250%';

export interface MasterpieceLeagueInfo {
  id: MasterpieceLeagueId;
  labelEn: string;
  labelEs: string;
  matchLabel: string;
  pointsCurrent: number;
  pointsTotal: number;
  timeLeft: string;
  isUserLeague?: boolean;
}

export interface PowerBracketStep {
  batchLimit: number | '∞';
  power: number;
}

export interface MasterpieceResourceMeta {
  symbol: string;
  nameEn: string;
  nameEs: string;
  baseCrowns: number;
  basePower: number;
  baseMarketPriceEstimate: number;
  goldTier250Required: number;
  powerBrackets?: PowerBracketStep[];
}

export interface EfficiencyItem {
  rank: number;
  symbol: string;
  name: string;
  multiplier: number;
  units: number;
  bracketIndex: number;
  powerBrackets: PowerBracketStep[];
  crowns: number;
  power: number;
  marketPrice: number;
  totalCrowns: number;
  totalPower: number;
  totalCost: number;
  efficiency: number;
}

export interface TierContributionItem {
  symbol: string;
  name: string;
  required: number;
  contributed: number;
  percent: number;
}
