import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePkcePair,
  generateState,
  buildAuthorizeUrl,
} from '../src/services/craftworldOauth.js';

describe('OAuth 2.0 PKCE & URL Builder', () => {
  it('generates a valid PKCE pair with S256 method', () => {
    const pkce = generatePkcePair();

    assert.ok(pkce.codeVerifier.length >= 43, 'codeVerifier must have sufficient entropy');
    assert.ok(pkce.codeChallenge.length > 0, 'codeChallenge must be non-empty');
    assert.equal(pkce.codeChallengeMethod, 'S256', 'codeChallengeMethod must be S256');
    assert.notEqual(pkce.codeVerifier, pkce.codeChallenge, 'Challenge must be hashed digest');
  });

  it('generates non-colliding random states', () => {
    const state1 = generateState();
    const state2 = generateState();

    assert.ok(state1.length > 10);
    assert.notEqual(state1, state2);
  });

  it('builds an authorization URL with all required query parameters', () => {
    const urlString = buildAuthorizeUrl({
      state: 'state_xyz',
      codeChallenge: 'challenge_123',
      redirectUri: 'http://localhost:5000/callback',
      clientId: 'test_client_id',
    });

    const parsed = new URL(urlString);
    assert.equal(parsed.searchParams.get('response_type'), 'code');
    assert.equal(parsed.searchParams.get('client_id'), 'test_client_id');
    assert.equal(parsed.searchParams.get('redirect_uri'), 'http://localhost:5000/callback');
    assert.equal(parsed.searchParams.get('state'), 'state_xyz');
    assert.equal(parsed.searchParams.get('code_challenge'), 'challenge_123');
    assert.equal(parsed.searchParams.get('code_challenge_method'), 'S256');
  });
});
