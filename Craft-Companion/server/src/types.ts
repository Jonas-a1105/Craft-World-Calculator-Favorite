import type { Request } from 'express';

export type UserAccount = {
  id: string;
  craftWorldUid?: string;
  craftWorldDisplayName?: string;
  craftWorldAvatarUrl?: string;
  craftWorldLevel?: number;
  craftWorldAccessToken?: string;
  craftWorldRefreshToken?: string;
  craftWorldTokenExpiresAt?: string;
  craftWorldScopes?: string;
  craftWorldClientId?: string;
  craftWorldClientSecret?: string;
  createdAt: string;
  lastLoginAt?: string;
  lastCachedHome?: Record<string, unknown>;
};

export interface AuthenticatedRequest extends Request {
  sessionUser?: UserAccount;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export type ResourceAmount = { symbol: string; amount: number };

export type CraftworldExternalProfile = {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  level?: number;
};

export type CraftworldExternalCraftWorld = {
  level?: number;
  resourceBalances?: ResourceAmount[];
};

export type CraftworldExternalMasterpieces = {
  claimedMasterpieceIds?: string[];
  activeBattlePasses?: Array<{ id?: string; name?: string; endsAt?: string }>;
};

export type AuthUserPayload = { id: string; craftWorldUid?: string };
