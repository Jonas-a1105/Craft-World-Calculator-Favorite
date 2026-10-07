import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { oauthRouter } from './routes/oauth.js';
import { meRouter } from './routes/me.js';
import { craftworldRouter } from './routes/craftworld.js';
import { requireSession } from './auth/requireSession.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

export const app = express();

// 1. Security & Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (origin === env.FRONTEND_URL || origin === env.CLIENT_ORIGIN) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));

// 2. API Routes
app.use('/api/oauth', oauthRouter);
app.use('/api/auth', oauthRouter);
app.use('/api/me', requireSession, meRouter);
app.use('/api/craftworld', requireSession, craftworldRouter);

// 3. Static Client SPA Serving
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 4. Centralized Global Error Handler
app.use(errorHandler);
