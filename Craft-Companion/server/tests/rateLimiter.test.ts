import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generalApiLimiter,
  authLimiter,
  craftworldSyncLimiter,
} from '../src/middlewares/rateLimiter.js';

describe('Rate Limiter Middlewares', () => {
  it('exports generalApiLimiter middleware function', () => {
    assert.equal(typeof generalApiLimiter, 'function');
  });

  it('exports authLimiter middleware function', () => {
    assert.equal(typeof authLimiter, 'function');
  });

  it('exports craftworldSyncLimiter middleware function', () => {
    assert.equal(typeof craftworldSyncLimiter, 'function');
  });
});
