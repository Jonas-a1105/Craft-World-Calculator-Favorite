import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isTest = env.NODE_ENV === 'test';

/**
 * General API rate limiter:
 * Limits overall traffic to 500 requests per 15 minutes per IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    message: 'Too many requests from this IP. Please try again in a few minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Strict authentication rate limiter:
 * Protects login, authorization, and OAuth callbacks against brute force attacks.
 * Limits to 30 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 10000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * CraftWorld external sync rate limiter:
 * Protects CraftWorld external API quota from being exhausted.
 * Limits to 120 sync requests per 15 minutes per IP.
 */
export const craftworldSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 10000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    message: 'CraftWorld data sync rate limit reached. Please wait a moment before refreshing.',
    code: 'SYNC_RATE_LIMIT_EXCEEDED',
  },
});
