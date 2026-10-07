import type { WalletItem } from '../types';

export function formatWalletAddress(address?: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getWalletInitial(type?: string, address?: string): string {
  const isSmart = (type || '').toLowerCase().includes('smart');
  if (isSmart) return 'S';
  if (address && address.length >= 3) {
    return address.slice(2, 3).toUpperCase();
  }
  return 'W';
}

export function getWalletLabel(
  wallet: WalletItem,
  index: number,
  language: string,
): string {
  if (wallet.primary) {
    return language === 'es' ? 'Wallet Principal' : 'Primary Wallet';
  }
  if (wallet.type) {
    return wallet.type;
  }
  return `Wallet ${index + 1}`;
}

export function resolveUserDisplayName(rawDisplayName?: string, id?: string): string {
  if (rawDisplayName && rawDisplayName.trim()) return rawDisplayName.trim();
  if (id && id.trim()) return id.trim();
  return 'Player';
}
