import { Router } from 'express';
import { getUsers, saveUsers } from '../storage/userStorage.js';
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

async function getFreshAccessToken(user: any): Promise<string> {
  if (!user.craftWorldRefreshToken) throw new Error('No refresh token stored');
  if (
    user.craftWorldTokenExpiresAt &&
    new Date(user.craftWorldTokenExpiresAt).getTime() > Date.now() + 60000
  ) {
    return user.craftWorldAccessToken || '';
  }
  const refreshed = await refreshCraftworldToken(user.craftWorldRefreshToken);
  user.craftWorldAccessToken = refreshed.accessToken;
  user.craftWorldRefreshToken = refreshed.refreshToken;
  user.craftWorldTokenExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
  return refreshed.accessToken;
}

async function getUserAndToken(req: any) {
  const users = await getUsers();
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) throw new Error('User not found');
  const accessToken = await getFreshAccessToken(user);
  await saveUsers(users);
  return { user, accessToken };
}

craftworldRouter.get('/profile', async (req: any, res) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const profile = await getExternalProfile(accessToken);
    res.json(profile);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load profile.' });
  }
});

craftworldRouter.get('/craft-world', async (req: any, res) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraftWorld(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load craft world data.' });
  }
});

craftworldRouter.get('/masterpieces', async (req: any, res) => {
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

craftworldRouter.get('/craft', async (req: any, res) => {
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

craftworldRouter.get('/exchange', async (req: any, res) => {
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

craftworldRouter.get('/onchain', async (req: any, res) => {
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

craftworldRouter.get('/inventory', async (req: any, res) => {
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

craftworldRouter.get('/purchases', async (req: any, res) => {
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

craftworldRouter.get('/price-list', async (req: any, res) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPriceList(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load price list.' });
  }
});

craftworldRouter.get('/dyno-cycle', async (req: any, res) => {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalDynoProductionCycle(accessToken);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ message: err.message || 'Unable to load dyno production cycle.' });
  }
});

craftworldRouter.get('/home', async (req: any, res) => {
  try {
    const { accessToken } = await getUserAndToken(req);
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

    res.json({
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
      serverTime: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/craftworld/home:', err);
    const status = err.status === 401 || String(err.message || '').includes('token') ? 401 : 502;
    res
      .status(status)
      .json({ message: err.message || 'Unable to load home data.', code: err.code });
  }
});
