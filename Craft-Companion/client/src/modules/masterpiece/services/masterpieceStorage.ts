import { INITIAL_USER_CONTRIBUTIONS } from '../data/masterpieceData';

const CONTRIBUTIONS_KEY = 'craftworld.masterpiece.contributions';
const POWER_PRICE_KEY = 'craftworld.masterpiece.powerPrice';

export function loadStoredContributions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CONTRIBUTIONS_KEY);
    if (!raw) return { ...INITIAL_USER_CONTRIBUTIONS };
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null
      ? { ...INITIAL_USER_CONTRIBUTIONS, ...parsed }
      : { ...INITIAL_USER_CONTRIBUTIONS };
  } catch {
    return { ...INITIAL_USER_CONTRIBUTIONS };
  }
}

export function saveStoredContributions(contributions: Record<string, number>): void {
  try {
    localStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  } catch (e) {
    console.warn('[Masterpiece] Failed to save contributions to localStorage', e);
  }
}

export function loadStoredPowerPrice(): number {
  try {
    const raw = localStorage.getItem(POWER_PRICE_KEY);
    if (!raw) return 10.0;
    const val = parseFloat(raw);
    return Number.isFinite(val) && val >= 0 ? val : 10.0;
  } catch {
    return 10.0;
  }
}

export function saveStoredPowerPrice(price: number): void {
  try {
    localStorage.setItem(POWER_PRICE_KEY, String(price));
  } catch (e) {
    console.warn('[Masterpiece] Failed to save power price to localStorage', e);
  }
}
