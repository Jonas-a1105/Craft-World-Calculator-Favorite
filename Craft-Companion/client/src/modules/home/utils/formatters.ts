export function displayNumber(value: unknown): string {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

export function formatShopItem(id: string, lang = 'es'): string {
  if (!id) return '';
  if (id.includes('proaccount')) return lang === 'es' ? '⭐ Cuenta Pro' : '⭐ Pro Account';
  if (id.includes('noadsoffer')) return lang === 'es' ? '🚫 Oferta Sin Anuncios' : '🚫 No-Ads Offer';
  return id.replace('com.angrydynamiteslab.craftworld.', '').replace(/_/g, ' ');
}

export function formatAdPlacement(id: string, lang = 'es'): string {
  if (!id) return '';
  if (id.toLowerCase().includes('mine')) return lang === 'es' ? '⛏️ Booster Mina' : '⛏️ Mine Booster';
  if (id.toLowerCase().includes('factory')) return lang === 'es' ? '⚡ Booster Fábrica' : '⚡ Factory Booster';
  return id.replace(/_/g, ' ');
}

export function formatBoosterName(id: string): string {
  if (!id) return '';
  return id
    .replace('FACTORYBOOST_', '⚡ ')
    .replace('MINEBOOST_', '⛏️ ')
    .replace(/_/g, ' ');
}

export function formatEggName(id: string): string {
  if (!id) return '';
  return id
    .replace('MID_', 'Medio ')
    .replace('HIGH_', 'Alto ')
    .replace('LOW_', 'Básico ')
    .replace('LOW', 'Básico ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatUid(uid?: string): string {
  if (!uid) return 'N/A';
  if (uid.length > 14) {
    return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
  }
  return uid;
}
