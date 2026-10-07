import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  quickLoginSchema,
  oauthCallbackQuerySchema,
  authorizeQuerySchema,
} from '../src/schemas/auth.schema.js';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ExternalServiceError,
} from '../src/errors/AppError.js';

describe('Validation Schemas & Domain Errors', () => {
  it('validates quick login schema with valid inputs', () => {
    const valid = quickLoginSchema.parse({ uid: 'cw_user_1', displayName: 'Hero' });
    assert.equal(valid.uid, 'cw_user_1');
    assert.equal(valid.displayName, 'Hero');
  });

  it('rejects quick login with empty uid', () => {
    assert.throws(() => {
      quickLoginSchema.parse({ uid: '' });
    });
  });

  it('validates OAuth callback queries correctly', () => {
    const parsed = oauthCallbackQuerySchema.parse({
      code: 'auth_code_123',
      state: 'state_456',
    });
    assert.equal(parsed.code, 'auth_code_123');
    assert.equal(parsed.state, 'state_456');
  });

  it('validates authorize query schema optional parameters', () => {
    const parsed = authorizeQuerySchema.parse({});
    assert.equal(parsed.origin, undefined);

    const withOrigin = authorizeQuerySchema.parse({ origin: 'https://mysite.com' });
    assert.equal(withOrigin.origin, 'https://mysite.com');
  });

  it('instantiates custom AppError subclasses with proper status codes', () => {
    const badReq = new BadRequestError('Invalid payload');
    assert.equal(badReq.statusCode, 400);
    assert.equal(badReq.code, 'BAD_REQUEST');
    assert.equal(badReq.isOperational, true);

    const unauth = new UnauthorizedError();
    assert.equal(unauth.statusCode, 401);
    assert.equal(unauth.code, 'UNAUTHORIZED');

    const notFound = new NotFoundError('User not found');
    assert.equal(notFound.statusCode, 404);
    assert.equal(notFound.code, 'NOT_FOUND');

    const external = new ExternalServiceError('Upstream down');
    assert.equal(external.statusCode, 502);
    assert.equal(external.code, 'EXTERNAL_SERVICE_ERROR');
    assert.ok(external instanceof AppError);
  });
});
