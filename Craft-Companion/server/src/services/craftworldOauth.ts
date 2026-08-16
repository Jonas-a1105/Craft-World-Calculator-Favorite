import { randomBytes, createHash } from 'node:crypto';

const craftWorldBaseUrl = process.env.CRAFTWORLD_BASE_URL || 'https://craft-world.gg';
const authorizeUrl = `${craftWorldBaseUrl}/oauth/authorize`;
const tokenUrl = `${craftWorldBaseUrl}/oauth/token`;
const revokeUrl = `${craftWorldBaseUrl}/oauth/revoke`;

export const oauthConfig = {
  get clientId(): string {
    return (
      process.env.CRAFTWORLD_OAUTH_CLIENT_ID ||
      'client_019f6f6c-3dbc-754a-a0ab-2fcf87a72975'
    );
  },
  get clientSecret(): string {
    return (
      process.env.CRAFTWORLD_OAUTH_CLIENT_SECRET ||
      'secret_019f6f6c-3dbd-7b33-9113-1838eee440ce'
    );
  },
  get redirectUri(): string {
    return (
      process.env.CRAFTWORLD_OAUTH_REDIRECT_URI ||
      'http://localhost:5000/api/auth/callback'
    );
  },
  get scopes(): string[] {
    return (
      process.env.CRAFTWORLD_OAUTH_SCOPES ||
      'craft:read exchange:read inventory:read onchain:read purchases:read'
    )
      .split(/\s+/)
      .filter(Boolean);
  },
};

export type PkcePair = {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
};

export type CraftworldTokenSet = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
};

export type CraftworldTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export function generatePkcePair(): PkcePair {
  const codeVerifier = randomBytes(48).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge, codeChallengeMethod: 'S256' };
}

export function generateState(): string {
  return randomBytes(24).toString('base64url');
}

export function buildAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
  redirectUri?: string;
  clientId?: string;
}): string {
  const clientId = params.clientId || oauthConfig.clientId;
  const redirectUri = params.redirectUri || oauthConfig.redirectUri;
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: oauthConfig.scopes.join(' '),
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${authorizeUrl}?${query.toString()}`;
}

function requireCredentials(
  clientIdOverride?: string,
  clientSecretOverride?: string,
): { clientId: string; clientSecret: string } {
  const clientId = clientIdOverride || oauthConfig.clientId;
  const clientSecret = clientSecretOverride || oauthConfig.clientSecret;
  if (!clientId) throw new Error('CRAFTWORLD_OAUTH_CLIENT_ID is not configured.');
  return { clientId, clientSecret };
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let raw: any;
  try {
    raw = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Expected JSON from ${res.url}, received: ${text.slice(0, 120)}`);
  }
  if (!res.ok) {
    const message =
      raw?.error_description || raw?.error || raw?.message || 'Craft World OAuth request failed.';
    throw new OAuthError(message, raw?.error);
  }
  return raw as T;
}

export class OAuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
    this.name = 'OAuthError';
  }
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  redirectUriOverride?: string,
  clientIdOverride?: string,
  clientSecretOverride?: string,
): Promise<CraftworldTokenSet> {
  const { clientId, clientSecret } = requireCredentials(clientIdOverride, clientSecretOverride);
  const redirect_uri = redirectUriOverride || oauthConfig.redirectUri;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });
  if (clientSecret) body.set('client_secret', clientSecret);

  console.log(`[OAuth Exchange] Posting to token endpoint for ${clientId}`);
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await readJson<CraftworldTokenResponse>(res);
  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in || 3600,
    refreshToken: data.refresh_token,
    scope: data.scope,
  };
}

export async function refreshCraftworldToken(
  refreshToken: string,
  clientIdOverride?: string,
  clientSecretOverride?: string,
): Promise<CraftworldTokenSet> {
  const { clientId, clientSecret } = requireCredentials(clientIdOverride, clientSecretOverride);
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });
  if (clientSecret) body.set('client_secret', clientSecret);

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await readJson<CraftworldTokenResponse>(res);
  return {
    accessToken: data.access_token,
    tokenType: data.token_type || 'Bearer',
    expiresIn: data.expires_in || 3600,
    refreshToken: data.refresh_token,
    scope: data.scope,
  };
}

export async function revokeCraftworldToken(token: string): Promise<void> {
  try {
    await fetch(revokeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    });
  } catch (error) {
    console.warn('Craft World token revocation failed (best-effort):', (error as Error)?.message);
  }
}

export function isOAuthConfigured(): boolean {
  return Boolean(oauthConfig.clientId);
}
