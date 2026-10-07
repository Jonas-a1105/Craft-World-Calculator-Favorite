import { Router } from 'express';
import { getUserById } from '../storage/userStorage.js';
import { requireSession } from '../auth/requireSession.js';
import type { AuthenticatedRequest } from '../types.js';

export const meRouter = Router();

meRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.sessionUser?.id || (req as unknown as { user?: { id: string } }).user?.id || '';
  const user = await getUserById(userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  res.json({
    id: user.id,
    craftWorldUid: user.craftWorldUid,
    craftWorldDisplayName: user.craftWorldDisplayName,
    craftWorldAvatarUrl: user.craftWorldAvatarUrl,
    craftWorldLevel: user.craftWorldLevel,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  });
});
