import { getUsers } from '../storage/userStorage.js';
import type { Request, Response, NextFunction } from 'express';
import { SESSION_COOKIE, verifySession } from './session.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; craftWorldUid?: string };
    }
  }
}

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  let token = match?.[1];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const userId = verifySession(token);
  if (!userId) return res.status(401).json({ message: 'Invalid session' });

  const users = await getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: 'User not found' });

  req.user = { id: user.id, craftWorldUid: user.craftWorldUid };
  next();
}
