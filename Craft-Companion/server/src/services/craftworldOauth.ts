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

async function postTokenEndpoint(
  bodyParams: Record<string, string>,
  authHeader?: string,
): Promise<{ ok: boolean; status: number; data: any; errorText?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  const body = new URLSearchParams(bodyParams);
  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { rawText: text };
    }
    return { ok: res.ok, status: res.status, data, errorText: text };
  } catch (err: any) {
    return { ok: false, status: 500, data: {}, errorText: err?.message };
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

  console.log(`[OAuth Exchange] Trying token exchange for client: ${clientId}`);
  console.log(`[OAuth Exchange] Redirect URI: ${redirect_uri}`);

  let res1: { ok: boolean; status: number; data: any; errorText?: string } | null = null;

  // Estrategia 1: RFC 6749 Standard HTTP Basic Auth Header
  if (clientId && clientSecret) {
    const basicAuth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    res1 = await postTokenEndpoint(
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier: codeVerifier,
      },
      basicAuth,
    );
    if (res1.ok && res1.data.access_token) {
      console.log('[OAuth Exchange] Success via Basic Auth Header');
      return {
        accessToken: res1.data.access_token,
        tokenType: res1.data.token_type || 'Bearer',
        expiresIn: res1.data.expires_in || 3600,
        refreshToken: res1.data.refresh_token,
        scope: res1.data.scope,
      };
    }
    console.warn('[OAuth Exchange] Strategy 1 (Basic Auth) failed:', res1.status, res1.data);
  }

  // Estrategia 2: Form Body urlencoded (según guide.txt de Craft World)
  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    client_id: clientId,
    code_verifier: codeVerifier,
  };
  if (clientSecret) bodyParams.client_secret = clientSecret;

  const res2 = await postTokenEndpoint(bodyParams);
  if (res2.ok && res2.data.access_token) {
    console.log('[OAuth Exchange] Success via Body credentials');
    return {
      accessToken: res2.data.access_token,
      tokenType: res2.data.token_type || 'Bearer',
      expiresIn: res2.data.expires_in || 3600,
      refreshToken: res2.data.refresh_token,
      scope: res2.data.scope,
    };
  }
  console.warn('[OAuth Exchange] Strategy 2 (Body credentials) failed:', res2.status, res2.data);

  // Estrategia 3: PKCE Público (sin client_secret)
  const res3 = await postTokenEndpoint({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });
  if (res3.ok && res3.data.access_token) {
    console.log('[OAuth Exchange] Success via Public PKCE');
    return {
      accessToken: res3.data.access_token,
      tokenType: res3.data.token_type || 'Bearer',
      expiresIn: res3.data.expires_in || 3600,
      refreshToken: res3.data.refresh_token,
      scope: res3.data.scope,
    };
  }
  console.warn('[OAuth Exchange] Strategy 3 (Public PKCE) failed:', res3.status, res3.data);

  // Si todas fallan, extraer el mensaje de error más descriptivo
  const lastError =
    res2.data?.error_description ||
    res1?.data?.error_description ||
    res2.data?.message ||
    res2.data?.error ||
    'Token exchange failed with Craft World';

  throw new OAuthError(lastError, res2.data?.error);
}

export async function refreshCraftworldToken(
  refreshToken: string,
  clientIdOverride?: string,
  clientSecretOverride?: string,
): Promise<CraftworldTokenSet> {
  const { clientId, clientSecret } = requireCredentials(clientIdOverride, clientSecretOverride);

  // Estrategia 1: Basic Auth
  if (clientId && clientSecret) {
    const basicAuth = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    const res1 = await postTokenEndpoint(
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      basicAuth,
    );
    if (res1.ok && res1.data.access_token) {
      return {
        accessToken: res1.data.access_token,
        tokenType: res1.data.token_type || 'Bearer',
        expiresIn: res1.data.expires_in || 3600,
        refreshToken: res1.data.refresh_token,
        scope: res1.data.scope,
      };
    }
  }

  // Estrategia 2: Form Body
  const bodyParams: Record<string, string> = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  };
  if (clientSecret) bodyParams.client_secret = clientSecret;

  const res2 = await postTokenEndpoint(bodyParams);
  if (res2.ok && res2.data.access_token) {
    return {
      accessToken: res2.data.access_token,
      tokenType: res2.data.token_type || 'Bearer',
      expiresIn: res2.data.expires_in || 3600,
      refreshToken: res2.data.refresh_token,
      scope: res2.data.scope,
    };
  }

  // Estrategia 3: Public PKCE refresh
  const res3 = await postTokenEndpoint({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });
  if (res3.ok && res3.data.access_token) {
    return {
      accessToken: res3.data.access_token,
      tokenType: res3.data.token_type || 'Bearer',
      expiresIn: res3.data.expires_in || 3600,
      refreshToken: res3.data.refresh_token,
      scope: res3.data.scope,
    };
  }

  const lastError =
    res2.data?.error_description || res2.data?.message || 'Token refresh failed with Craft World';
  throw new OAuthError(lastError, res2.data?.error);
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
