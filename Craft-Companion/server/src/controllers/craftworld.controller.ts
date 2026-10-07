import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserAccount } from '../types.js';
import { getUserById } from '../storage/userStorage.js';
import { getFreshAccessToken } from '../services/craftworldTokenService.js';
import { fetchAndCacheHomeData } from '../services/craftworldHomeService.js';
import { NotFoundError } from '../errors/AppError.js';
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

async function getUserAndToken(req: AuthenticatedRequest): Promise<{ user: UserAccount; accessToken: string }> {
  const userId = req.sessionUser?.id || req.user?.id || '';
  const user = req.sessionUser || (await getUserById(userId));
  if (!user) throw new NotFoundError('User not found');
  const accessToken = await getFreshAccessToken(user);
  return { user, accessToken };
}

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, accessToken } = await getUserAndToken(req);
    if (!accessToken) {
      res.json({
        uid: user.craftWorldUid || user.id,
        displayName: user.craftWorldDisplayName || 'Craft Master',
        level: user.craftWorldLevel || 10,
        avatarUrl: user.craftWorldAvatarUrl,
      });
      return;
    }
    const profile = await getExternalProfile(accessToken);
    res.json(profile);
  } catch (err: unknown) {
    next(err);
  }
}

export async function getCraftWorld(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraftWorld(accessToken);
    res.json(data);
  } catch (err: unknown) {
    next(err);
  }
}

export async function getMasterpieces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalMasterpieces(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load masterpieces.',
      code: error.code,
    });
  }
}

export async function getCraft(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalCraft(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load craft data.',
      code: error.code,
    });
  }
}

export async function getExchange(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalExchange(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load exchange data.',
      code: error.code,
    });
  }
}

export async function getOnchain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalOnchain(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load onchain data.',
      code: error.code,
    });
  }
}

export async function getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalInventory(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load inventory data.',
      code: error.code,
    });
  }
}

export async function getPurchases(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPurchases(accessToken);
    res.json(data);
  } catch (err: unknown) {
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 403 ? 403 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load purchases data.',
      code: error.code,
    });
  }
}

export async function getPriceList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalPriceList(accessToken);
    res.json(data);
  } catch (err: unknown) {
    next(err);
  }
}

export async function getDynoCycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { accessToken } = await getUserAndToken(req);
    const data = await getExternalDynoProductionCycle(accessToken);
    res.json(data);
  } catch (err: unknown) {
    next(err);
  }
}

export async function getHome(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
  try {
    const { user, accessToken } = await getUserAndToken(req);
    const homePayload = await fetchAndCacheHomeData(user, accessToken);
    res.json(homePayload);
  } catch (err: unknown) {
    console.error('Error in /api/craftworld/home:', getErrorMessage(err));
    const userId = req.sessionUser?.id || req.user?.id || '';
    const fallbackUser = await getUserById(userId);
    if (fallbackUser?.lastCachedHome) {
      console.log('Serving cached home snapshot to prevent disconnect screen');
      res.json(fallbackUser.lastCachedHome);
      return;
    }
    const error = err as { status?: number; code?: string; message?: string };
    const status = error.status === 401 || String(error.message || '').includes('token') ? 401 : 502;
    res.status(status).json({
      message: error.message || getErrorMessage(err) || 'Unable to load home data.',
      code: error.code,
    });
  }
}
