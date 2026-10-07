import type { ReactNode } from 'react';

export interface NavItem {
  path: string;
  labelEn: string;
  labelEs: string;
  icon: (active: boolean) => ReactNode;
}

export interface UserProfile {
  displayName: string;
  level?: number;
  avatarUrl?: string;
  uid?: string;
}

export interface WalletItem {
  address?: string;
  type?: string;
  primary?: boolean;
}
