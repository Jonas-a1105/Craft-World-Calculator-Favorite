import { env } from '../config/env.js';
import { refreshCraftworldToken } from './craftworldOauth.js';
import { updateUserTokens } from '../storage/userStorage.js';
import type { UserAccount } from '../types.js';
import { getErrorMessage } from '../types.js';

/**
 * Ensures the user has a valid access token.
 * Refreshes proactively if the token expires within 5 minutes (300_000 ms).
 */
export async function getFreshAccessToken(user: UserAccount, force = false): Promise<string> {
  const clientId = user.craftWorldClientId || env.CRAFTWORLD_OAUTH_CLIENT_ID;
  const clientSecret = user.craftWorldClientSecret || env.CRAFTWORLD_OAUTH_CLIENT_SECRET;

  const isExpiringSoon =
    !user.craftWorldTokenExpiresAt ||
    new Date(user.craftWorldTokenExpiresAt).getTime() <= Date.now() + 300_000;

  if (!force && !isExpiringSoon && user.craftWorldAccessToken) {
    return user.craftWorldAccessToken;
  }

  if (!user.craftWorldRefreshToken) {
    return user.craftWorldAccessToken || '';
  }

  try {
    console.log(`[Token Refresh] Refreshing token for user ${user.id} (force=${force})...`);
    const refreshed = await refreshCraftworldToken(
      user.craftWorldRefreshToken,
      clientId,
      clientSecret,
    );
    user.craftWorldAccessToken = refreshed.accessToken;
    if (refreshed.refreshToken) {
      user.craftWorldRefreshToken = refreshed.refreshToken;
    }
    user.craftWorldClientId = clientId;
    user.craftWorldClientSecret = clientSecret;
    user.craftWorldTokenExpiresAt = new Date(Date.now() + (refreshed.expiresIn || 3600) * 1000).toISOString();

    await updateUserTokens(user.id, {
      accessToken: user.craftWorldAccessToken,
      refreshToken: user.craftWorldRefreshToken,
      tokenExpiresAt: user.craftWorldTokenExpiresAt,
      clientId,
      clientSecret,
    });
    console.log(`[Token Refresh] Successfully refreshed token for user ${user.id}`);
    return refreshed.accessToken;
  } catch (err: unknown) {
    console.warn(`[Token Refresh] Failed to refresh token for user ${user.id}:`, getErrorMessage(err));
    return user.craftWorldAccessToken || '';
  }
}
