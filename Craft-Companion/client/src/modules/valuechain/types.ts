import type { ValueChainAnalysis, ChainStep } from '../../services/valueChainCalculator';

export type ValueChainMode = 'self_crafted' | 'market_buy';

export interface FeaturedTarget {
  token: string;
  label: string;
  desc: string;
}

export type { ValueChainAnalysis, ChainStep };
