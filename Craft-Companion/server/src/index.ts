import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { oauthRouter } from './routes/oauth.js';
import { meRouter } from './routes/me.js';
import { craftworldRouter } from './routes/craftworld.js';
import { requireSession } from './auth/requireSession.js';

console.log('CWD:', process.cwd());
console.log('OAUTH_CLIENT_ID:', process.env.CRAFTWORLD_OAUTH_CLIENT_ID?.slice(0, 20) + '...');
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      const allowed = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (origin === allowed) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api/oauth', oauthRouter);
app.use('/api/auth', oauthRouter);
app.use('/api/me', requireSession, meRouter);
app.use('/api/craftworld', requireSession, craftworldRouter);

app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(process.env.PORT || 3001, () => console.log('Server running'));
