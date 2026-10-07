export interface LandingSuiteSection {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  tabs: string[];
  card1: {
    num: string;
    title: string;
    desc: string;
    item1Title: string;
    item1Time: string;
    item2Title: string;
    item2Time: string;
  };
  card2: {
    num: string;
    title: string;
    desc: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    tableName: string;
    verifiedBadge: string;
  };
  card3: {
    num: string;
    title: string;
    desc: string;
    filterRegion: string;
    filterTime: string;
    exportButton: string;
  };
}

export interface PricingPlan {
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  featuresTitle: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export interface LandingPricingSection {
  badge: string;
  title: string;
  subtitle: string;
  billing: {
    annually: string;
    monthly: string;
    discount: string;
  };
  plans: {
    hobby: PricingPlan;
    growth: PricingPlan;
    scale: PricingPlan;
  };
}

export interface MetricItem {
  icon: string;
  value: string;
  label: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  stars: number;
}

export interface LandingImpactSection {
  badge: string;
  title: string;
  subtitle: string;
  ratingBadge: {
    score: string;
    basedOn: string;
  };
  metrics: MetricItem[];
  testimonialsRow1: TestimonialItem[];
  testimonialsRow2: TestimonialItem[];
}

export interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface LandingFaqSection {
  badge: string;
  title: string;
  subtitle: string;
  contact: {
    location: string;
    phone: string;
    email: string;
  };
  questions: FaqQuestion[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface LandingFooterSection {
  brandInitial: string;
  brandName: string;
  headline: string;
  ctaButton: string;
  links: FooterLink[];
  copyright: string;
}

export interface CookieCategory {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  badge?: string;
  isAlwaysActive?: boolean;
}

export interface LandingCookiesSection {
  title: string;
  subtitle: string;
  strictlyNecessary: CookieCategory;
  performance: CookieCategory;
  targeting: CookieCategory;
  savePreferences: string;
  acceptAll: string;
}

export interface LandingTranslations {
  brandName: string;
  nav: {
    features: string;
    impact: string;
    platform?: string;
    talentPool?: string;
    caseStudies?: string;
    pricing: string;
    faq?: string;
    scheduleDemo: string;
    startFree?: string;
  };
  hero: {
    badge: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    trustedBy: string;
  };
  suite: LandingSuiteSection;
  pricing: LandingPricingSection;
  impact: LandingImpactSection;
  faq: LandingFaqSection;
  footer: LandingFooterSection;
  cookies: LandingCookiesSection;
}

// Re-export content from dedicated content module
export { LANDING_CONTENT } from './landingContent';
