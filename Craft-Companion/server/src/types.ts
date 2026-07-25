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
  createdAt: string;
  lastLoginAt?: string;
};

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
