import { Router, type Response } from 'express';
import { getUserById, updateUserTokens, updateUserHomeCache } from '../storage/userStorage.js';
import { refreshCraftworldToken } from '../services/craftworldOauth.js';
import type { AuthenticatedRequest, UserAccount } from '../types.js';
import { getErrorMessage } from '../types.js';
import {
  getExternalProfile,
  getExternalCraftWorld,
  getExternalMasterpieces,
  getExternalCraft,
  getExternalExchange,
  getExternalOnchain,
  getExternalInventory,
  getExternalPurchases,
  getExternalPriceList,
  getExternalDynoProductionCycle,
} from '../services/craftworldExternalApi.js';

export const craftworldRouter = Router();

async function getFreshAccessToken(user: UserAccount, force = false): Promise<string> {
  const clientId = user.craftWorldClientId || process.env.CRAFTWORLD_OAUTH_CLIENT_ID || 'client_019f6f6c-3dbc-754a-a0ab-2fcf87a72975';
  const clientSecret = user.craftWorldClientSecret || process.env.CRAFTWORLD_OAUTH_CLIENT_SECRET || 'secret_019f6f6c-3dbd-7b33-9113-1838eee440ce';

  // Proactive refresh if expiring in less than 5 minutes (300,000 ms) or if forced
  const isExpiringSoon =
    !user.craftWorldTokenExpiresAt ||
    new Date(user.craftWorldTokenExpiresAt).getTime() <= Date.now() + 300000;

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

async function getUserAndToken(req: AuthenticatedRequest) {
  const userId = req.sessionUser?.id || (req as unknown as { user?: { id: string } }).user?.id || '';
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');
  const accessToken = await getFreshAccessToken(user);
  return { user, accessToken };
}

craftworldRouter.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, accessToken } = await getUserAndToken(req);
    if (!accessToken) {
      return res.json({
        uid: user.craftWorldUid || user.id,
        displayName: user.craftWorldDisplayName || 'Craft Master',
        level: user.craftWorldLevel || 10,
        avatarUrl: user.craftWorldAvatarUrl,
      });
    }
    const profile = await getExternalProfile(accessToken);
    res.json(profile);
  } catch (err: unknown) {
    res.status(502).json({ message: getErrorMessage(err) || 'Unable to load profile.' });
  }
});

craftworldRouter.get('/craft-world', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraftWorld(accessToken);
    res.json(data);
  } catch (err: unknown) {
    res.status(502).json({ message: getErrorMessage(err) || 'Unable to load craft world data.' });
  }
});

craftworldRouter.get('/masterpieces', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalMasterpieces(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load masterpieces.', code: error.code });
  }
});

craftworldRouter.get('/craft', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraft(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load craft data.', code: error.code });
  }
});

craftworldRouter.get('/exchange', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalExchange(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load exchange data.', code: error.code });
  }
});

craftworldRouter.get('/onchain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalOnchain(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load onchain data.', code: error.code });
  }
});

craftworldRouter.get('/inventory', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalInventory(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load inventory data.', code: error.code });
  }
});

craftworldRouter.get('/purchases', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPurchases(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load purchases data.', code: error.code });
  }
});

craftworldRouter.get('/price-list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPriceList(accessToken);
    res.json(data);
  } catch (err: unknown) {
    res.status(502).json({ message: getErrorMessage(err) || 'Unable to load price list.' });
  }
});

craftworldRouter.get('/dyno-cycle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalDynoProductionCycle(accessToken);
    res.json(data);
  } catch (err: unknown) {
    res.status(502).json({ message: getErrorMessage(err) || 'Unable to load dyno production cycle.' });
  }
});

craftworldRouter.get('/home', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, accessToken } = await getUserAndToken(req);
    const [
      profile,
      craftWorld,
      masterpieces,
      craft,
      exchange,
      onchain,
      inventory,
      purchases,
      priceList,
      dynoCycle,
    ] = await Promise.all([
      getExternalProfile(accessToken).catch(
        (err) => (console.warn('Failed profile:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalCraftWorld(accessToken).catch(
        (err) => (console.warn('Failed craft-world:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalMasterpieces(accessToken).catch(
        (err) => (console.warn('Failed masterpieces:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalCraft(accessToken).catch(
        (err) => (console.warn('Failed craft:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalExchange(accessToken).catch(
        (err) => (console.warn('Failed exchange:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalOnchain(accessToken).catch(
        (err) => (console.warn('Failed onchain:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalInventory(accessToken).catch(
        (err) => (console.warn('Failed inventory:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalPurchases(accessToken).catch(
        (err) => (console.warn('Failed purchases:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalPriceList(accessToken).catch(
        (err) => (console.warn('Failed price-list:', err instanceof Error ? err.message : String(err)), null),
      ),
      getExternalDynoProductionCycle(accessToken).catch(
        (err) => (console.warn('Failed dyno-cycle:', err instanceof Error ? err.message : String(err)), null),
      ),
    ]);

    const hasAnySuccess = Boolean(profile || craftWorld || inventory || craft);
    const cachedHome = (user.lastCachedHome || {}) as Record<string, unknown>;
    const homePayload: Record<string, unknown> = {
      profile: profile || cachedHome.profile || {
        uid: user.craftWorldUid || user.id,
        displayName: user.craftWorldDisplayName || 'Craft Master',
        level: user.craftWorldLevel || 10,
        avatarUrl: user.craftWorldAvatarUrl,
      },
      craftWorld: craftWorld || cachedHome.craftWorld,
      masterpieces: masterpieces || cachedHome.masterpieces,
      craft: craft || cachedHome.craft,
      exchange: exchange || cachedHome.exchange,
      onchain: onchain || cachedHome.onchain,
      inventory: inventory || cachedHome.inventory,
      purchases: purchases || cachedHome.purchases,
      priceList: priceList || cachedHome.priceList,
      dynoCycle: dynoCycle || cachedHome.dynoCycle,
      serverTime: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    if (hasAnySuccess) {
      user.lastCachedHome = homePayload;
      await updateUserHomeCache(user.id, homePayload).catch((e: unknown) =>
        console.warn('Failed updating home cache in db:', getErrorMessage(e)),
      );
    }

    res.json(homePayload);
  } catch (err: unknown) {
    console.error('Error in /api/craftworld/home:', getErrorMessage(err));
    const userId = req.sessionUser?.id || (req as unknown as { user?: { id: string } }).user?.id || '';
    const fallbackUser = await getUserById(userId);
    if (fallbackUser?.lastCachedHome) {
      console.log('Serving cached home snapshot to prevent disconnect screen');
      return res.json(fallbackUser.lastCachedHome);
    }
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 401 || String(error.message || '').includes('token') ? 401 : 502;
    res
      .status(status)
      .json({ message: error.message || getErrorMessage(err) || 'Unable to load home data.', code: error.code });
  }
});
