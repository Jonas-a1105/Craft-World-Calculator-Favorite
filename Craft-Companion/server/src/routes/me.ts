import { Router } from 'express';
import { getUsers } from '../storage/userStorage.js';
import { requireSession } from '../auth/requireSession.js';

export const meRouter = Router();

meRouter.get('/', async (req: any, res) => {
  const users = await getUsers();
  const user = users.find((u) => u.id === req.user?.id);
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
