import { Router, type Response } from 'express';
import { getUserById, updateUserTokens, updateUserHomeCache } from '../storage/userStorage.js';
import { refreshCraftworldToken } from '../services/craftworldOauth.js';
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

async function getFreshAccessToken(user: any, force = false): Promise<string> {
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
  } catch (err: any) {
    console.warn(`[Token Refresh] Failed to refresh token for user ${user.id}:`, err?.message);
    return user.craftWorldAccessToken || '';
  }
}

async function getUserAndToken(req: any) {
  const user = await getUserById(req.user?.id);
  if (!user) throw new Error('User not found');
  const accessToken = await getFreshAccessToken(user);
  return { user, accessToken };
}

craftworldRouter.get('/profile', async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load profile.' });
  }
});

craftworldRouter.get('/craft-world', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraftWorld(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load craft world data.' });
  }
});

craftworldRouter.get('/masterpieces', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalMasterpieces(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load masterpieces.', code: err.code });
  }
});

craftworldRouter.get('/craft', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraft(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load craft data.', code: err.code });
  }
});

craftworldRouter.get('/exchange', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalExchange(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load exchange data.', code: err.code });
  }
});

craftworldRouter.get('/onchain', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalOnchain(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load onchain data.', code: err.code });
  }
});

craftworldRouter.get('/inventory', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalInventory(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load inventory data.', code: err.code });
  }
});

craftworldRouter.get('/purchases', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPurchases(accessToken);
    res.json(data);
  } catch (err: any) {
    const status = err.status === 403 ? 403 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load purchases data.', code: err.code });
  }
});

craftworldRouter.get('/price-list', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPriceList(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load price list.' });
  }
});

craftworldRouter.get('/dyno-cycle', async (req: any, res: Response) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalDynoProductionCycle(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load dyno production cycle.' });
  }
});

craftworldRouter.get('/home', async (req: any, res: Response) => {
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
        (err) => (console.warn('Failed profile:', err.message), null),
      ),
      getExternalCraftWorld(accessToken).catch(
        (err) => (console.warn('Failed craft-world:', err.message), null),
      ),
      getExternalMasterpieces(accessToken).catch(
        (err) => (console.warn('Failed masterpieces:', err.message), null),
      ),
      getExternalCraft(accessToken).catch(
        (err) => (console.warn('Failed craft:', err.message), null),
      ),
      getExternalExchange(accessToken).catch(
        (err) => (console.warn('Failed exchange:', err.message), null),
      ),
      getExternalOnchain(accessToken).catch(
        (err) => (console.warn('Failed onchain:', err.message), null),
      ),
      getExternalInventory(accessToken).catch(
        (err) => (console.warn('Failed inventory:', err.message), null),
      ),
      getExternalPurchases(accessToken).catch(
        (err) => (console.warn('Failed purchases:', err.message), null),
      ),
      getExternalPriceList(accessToken).catch(
        (err) => (console.warn('Failed price-list:', err.message), null),
      ),
      getExternalDynoProductionCycle(accessToken).catch(
        (err) => (console.warn('Failed dyno-cycle:', err.message), null),
      ),
    ]);

    const hasAnySuccess = Boolean(profile || craftWorld || inventory || craft);
    const homePayload = {
      profile: profile || user.lastCachedHome?.profile || {
        uid: user.craftWorldUid || user.id,
        displayName: user.craftWorldDisplayName || 'Craft Master',
        level: user.craftWorldLevel || 10,
        avatarUrl: user.craftWorldAvatarUrl,
      },
      craftWorld: craftWorld || user.lastCachedHome?.craftWorld,
      masterpieces: masterpieces || user.lastCachedHome?.masterpieces,
      craft: craft || user.lastCachedHome?.craft,
      exchange: exchange || user.lastCachedHome?.exchange,
      onchain: onchain || user.lastCachedHome?.onchain,
      inventory: inventory || user.lastCachedHome?.inventory,
      purchases: purchases || user.lastCachedHome?.purchases,
      priceList: priceList || user.lastCachedHome?.priceList,
      dynoCycle: dynoCycle || user.lastCachedHome?.dynoCycle,
      serverTime: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };

    if (hasAnySuccess) {
      user.lastCachedHome = homePayload;
      await updateUserHomeCache(user.id, homePayload).catch((e: any) =>
        console.warn('Failed updating home cache in db:', e?.message),
      );
    }

    res.json(homePayload);
  } catch (err: any) {
    console.error('Error in /api/craftworld/home:', err?.message);
    const fallbackUser = await getUserById(req.user?.id);
    if (fallbackUser?.lastCachedHome) {
      console.log('Serving cached home snapshot to prevent disconnect screen');
      return res.json(fallbackUser.lastCachedHome);
    }
    const status = err.status === 401 || String(err.message || '').includes('token') ? 401 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load home data.', code: err.code });
  }
});
