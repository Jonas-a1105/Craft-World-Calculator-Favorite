import {
  CraftworldExternalProfile,
  CraftworldExternalCraftWorld,
  CraftworldExternalMasterpieces,
  Me,
} from '../types';
const API =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '');

// Capturar token de la URL si se redirige desde OAuth
if (typeof window !== 'undefined') {
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    localStorage.setItem('cc_token', urlToken);
  }
}

async function req(path: string, init: RequestInit = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cc_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) || {}),
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });
  if (!res.ok) {
    let errorMsg = 'Request failed';
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      try {
        errorMsg = await res.text();
      } catch {}
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const oauthAuthorize = () => {
  const base = API || window.location.origin;
  const targetUrl = `${base}/api/oauth/authorize`;
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = targetUrl;
      return;
    }
  } catch (err) {
    console.warn('Cannot navigate window.top:', err);
  }
  window.location.href = targetUrl;
};
export const oauthCallback = () => req('/api/oauth/callback');
export const oauthLogout = () => req('/api/oauth/logout', { method: 'POST' });
export const getMe = () => req('/api/me') as Promise<Me>;
export const getCraftworldProfile = () =>
  req('/api/craftworld/profile') as Promise<CraftworldExternalProfile>;
export const getCraftworldCraftWorld = () =>
  req('/api/craftworld/craft-world') as Promise<CraftworldExternalCraftWorld>;
export const getCraftworldMasterpieces = () =>
  req('/api/craftworld/masterpieces') as Promise<CraftworldExternalMasterpieces>;
export const getCraftworldCraft = () => req('/api/craftworld/craft');
export const getCraftworldExchange = () => req('/api/craftworld/exchange');
export const getCraftworldOnchain = () => req('/api/craftworld/onchain');
export const getCraftworldInventory = () => req('/api/craftworld/inventory');
export const getCraftworldPurchases = () => req('/api/craftworld/purchases');
export const getCraftworldPriceList = () => req('/api/craftworld/price-list');
export const getCraftworldDynoCycle = () => req('/api/craftworld/dyno-cycle');
export const getCraftworldHome = () => req('/api/craftworld/home') as Promise<any>;
export const quickLogin = (uid?: string, displayName?: string) =>
  req('/api/auth/quick-login', {
    method: 'POST',
    body: JSON.stringify({ uid, displayName }),
  });

export const logout = () => oauthLogout();
