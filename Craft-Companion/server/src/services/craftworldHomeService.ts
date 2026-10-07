import {
  getExternalProfile,
  getExternalCraftWorld,
  getExternalMasterpieces,
  getExternalCraft,
  getExternalExchange,
  getExternalOnchain,
  getExternalInventory,
  getExternalPurchases,
  getExternalPriceList,
  getExternalDynoProductionCycle,
} from './craftworldExternalApi.js';
import { updateUserHomeCache } from '../storage/userStorage.js';
import type { UserAccount } from '../types.js';
import { getErrorMessage } from '../types.js';

export async function fetchAndCacheHomeData(
  user: UserAccount,
  accessToken: string,
): Promise<Record<string, unknown>> {
  const [
    profile,
    craftWorld,
    masterpieces,
    craft,
    exchange,
    onchain,
    inventory,
    purchases,
    priceList,
    dynoCycle,
  ] = await Promise.all([
    getExternalProfile(accessToken).catch(
      (err) => (console.warn('[HomeService] Profile fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalCraftWorld(accessToken).catch(
      (err) => (console.warn('[HomeService] CraftWorld fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalMasterpieces(accessToken).catch(
      (err) => (console.warn('[HomeService] Masterpieces fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalCraft(accessToken).catch(
      (err) => (console.warn('[HomeService] Craft fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalExchange(accessToken).catch(
      (err) => (console.warn('[HomeService] Exchange fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalOnchain(accessToken).catch(
      (err) => (console.warn('[HomeService] Onchain fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalInventory(accessToken).catch(
      (err) => (console.warn('[HomeService] Inventory fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalPurchases(accessToken).catch(
      (err) => (console.warn('[HomeService] Purchases fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalPriceList(accessToken).catch(
      (err) => (console.warn('[HomeService] PriceList fetch failed:', getErrorMessage(err)), null),
    ),
    getExternalDynoProductionCycle(accessToken).catch(
      (err) => (console.warn('[HomeService] DynoCycle fetch failed:', getErrorMessage(err)), null),
    ),
  ]);

  const hasAnySuccess = Boolean(profile || craftWorld || inventory || craft);
  const cachedHome = (user.lastCachedHome || {}) as Record<string, unknown>;

  const homePayload: Record<string, unknown> = {
    profile: profile || cachedHome.profile || {
      uid: user.craftWorldUid || user.id,
      displayName: user.craftWorldDisplayName || 'Craft Master',
      level: user.craftWorldLevel || 10,
      avatarUrl: user.craftWorldAvatarUrl,
    },
    craftWorld: craftWorld || cachedHome.craftWorld,
    masterpieces: masterpieces || cachedHome.masterpieces,
    craft: craft || cachedHome.craft,
    exchange: exchange || cachedHome.exchange,
    onchain: onchain || cachedHome.onchain,
    inventory: inventory || cachedHome.inventory,
    purchases: purchases || cachedHome.purchases,
    priceList: priceList || cachedHome.priceList,
    dynoCycle: dynoCycle || cachedHome.dynoCycle,
    serverTime: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  if (hasAnySuccess) {
    user.lastCachedHome = homePayload;
    await updateUserHomeCache(user.id, homePayload).catch((e: unknown) =>
      console.warn('[HomeService] Failed updating home cache in db:', getErrorMessage(e)),
    );
  }

  return homePayload;
}
