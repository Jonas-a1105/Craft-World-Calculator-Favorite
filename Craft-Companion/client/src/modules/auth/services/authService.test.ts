import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { parseOAuthError, isUserAuthenticated } from './authService';

test('parseOAuthError returns null when no error is present in query string', () => {
  assert.equal(parseOAuthError(''), null);
  assert.equal(parseOAuthError('?code=12345'), null);
  assert.equal(parseOAuthError('?state=abc'), null);
});

test('parseOAuthError translates access_denied correctly', () => {
  const result = parseOAuthError('?oauth_error=access_denied', 'Acceso denegado');
  assert.equal(result, 'Acceso denegado');
});

test('parseOAuthError decodes url parameters from error_description and error', () => {
  const resultDesc = parseOAuthError('?error_description=Invalid%20credentials%20provided');
  assert.equal(resultDesc, 'Invalid credentials provided');

  const resultErr = parseOAuthError('?error=unauthorized_client');
  assert.equal(resultErr, 'unauthorized_client');
});

test('isUserAuthenticated detects valid session correctly', () => {
  assert.equal(isUserAuthenticated(null), false);
  assert.equal(isUserAuthenticated(undefined), false);
  assert.equal(isUserAuthenticated({}), false);
  assert.equal(isUserAuthenticated({ id: 'user_123' }), true);
  assert.equal(isUserAuthenticated({ craftWorldUid: 'cw_999' }), true);
});
