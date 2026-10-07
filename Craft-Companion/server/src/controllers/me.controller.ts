import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types.js';
import { getUserById } from '../storage/userStorage.js';
import { NotFoundError } from '../errors/AppError.js';

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.sessionUser?.id || req.user?.id;
    if (!userId) {
      throw new NotFoundError('User not found.');
    }

    const user = req.sessionUser || (await getUserById(userId));
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    res.json({
      id: user.id,
      craftWorldUid: user.craftWorldUid,
      craftWorldDisplayName: user.craftWorldDisplayName,
      craftWorldAvatarUrl: user.craftWorldAvatarUrl,
      craftWorldLevel: user.craftWorldLevel,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    next(error);
  }
}
