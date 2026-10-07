import { Router } from 'express';
import {
  authorize,
  handleCallback,
  quickLogin,
  logout,
  getAuthStatus,
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  authorizeQuerySchema,
  oauthCallbackQuerySchema,
  quickLoginSchema,
} from '../schemas/auth.schema.js';

export const oauthRouter = Router();

oauthRouter.get('/authorize', validateRequest({ query: authorizeQuerySchema }), authorize);
oauthRouter.get('/callback', validateRequest({ query: oauthCallbackQuerySchema }), handleCallback);
oauthRouter.post('/quick-login', validateRequest({ body: quickLoginSchema }), quickLogin);
oauthRouter.post('/logout', logout);
oauthRouter.get('/status', getAuthStatus);
