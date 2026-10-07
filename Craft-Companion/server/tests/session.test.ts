import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  signSession,
  verifySession,
  parseCookies,
  sessionCookieOptions,
  loggedInCookieOptions,
} from '../src/auth/session.js';

describe('Server Session Security & Signing', () => {
  it('signs and verifies a valid user session correctly', () => {
    const userId = 'usr_test_998877';
    const signed = signSession(userId);

    assert.ok(signed.includes('.'), 'Signed session token must contain payload and signature separator');
    const verifiedId = verifySession(signed);
    assert.equal(verifiedId, userId, 'Verified user ID must match original input');
  });

  it('rejects tampered signature', () => {
    const userId = 'usr_test_123';
    const signed = signSession(userId);
    const [payload, sig] = signed.split('.');
    const tamperedSig = sig.slice(0, -4) + 'abcd';
    const tampered = `${payload}.${tamperedSig}`;

    const verified = verifySession(tampered);
    assert.equal(verified, null, 'Tampered token must fail verification');
  });

  it('returns null on malformed or empty token', () => {
    assert.equal(verifySession(undefined), null);
    assert.equal(verifySession(''), null);
    assert.equal(verifySession('no-dot-token'), null);
  });

  it('correctly parses cookie headers', () => {
    const header = 'cc_session=xyz123; cc_logged_in=true; theme=dark';
    const parsed = parseCookies(header);

    assert.equal(parsed.cc_session, 'xyz123');
    assert.equal(parsed.cc_logged_in, 'true');
    assert.equal(parsed.theme, 'dark');
  });

  it('generates secure cookie options correctly', () => {
    const secureOpts = sessionCookieOptions(true);
    assert.ok(secureOpts.includes('HttpOnly'));
    assert.ok(secureOpts.includes('SameSite=None'));
    assert.ok(secureOpts.includes('Secure'));

    const loggedInOpts = loggedInCookieOptions(false);
    assert.ok(loggedInOpts.includes('Path=/'));
  });
});
