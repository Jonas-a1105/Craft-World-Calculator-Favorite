export interface Me {
  id: string;
  craftWorldUid?: string;
  craftWorldDisplayName?: string;
  craftWorldAvatarUrl?: string;
  craftWorldLevel?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export type HomeTabId =
  | 'overview'
  | 'craft'
  | 'inventory'
  | 'exchange'
  | 'onchain'
  | 'purchases';

export interface HomeTabConfig {
  id: HomeTabId;
  label: string;
}

export interface CraftworldProfile {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  level?: number;
}

export interface CraftWorldResource {
  symbol: string;
  amount: number;
}

export interface CraftWorldData {
  level?: number;
  experiencePoints?: number;
  resources?: CraftWorldResource[];
}

export interface BattlePassInfo {
  id?: string;
  name?: string;
  endsAt?: string;
}

export interface MasterpiecesData {
  claimedMasterpieceIds?: string[];
  activeBattlePasses?: BattlePassInfo[];
}

export interface CraftVault {
  symbol: string;
  amount: number;
  capacity: number;
  isUnlocked?: boolean;
}

export interface CraftWorkshopItem {
  symbol: string;
  level: number;
}

export interface CraftData {
  power: number;
  powerUsed: number;
  skillPoints?: number;
  vaults?: CraftVault[];
  workshop?: CraftWorkshopItem[];
}

export interface EggItem {
  definitionId: string;
  amount: number;
}

export interface ChestItem {
  definitionId: string;
  count: number;
}

export interface StashedFactory {
  id?: string;
  definitionId: string;
  level?: number;
}

export interface BoosterItem {
  id: string;
  amount: number;
}

export interface InventoryData {
  eggs?: EggItem[];
  chests?: ChestItem[];
  factoryInventory?: StashedFactory[];
  availableBoosters?: BoosterItem[];
}

export interface TradeAccount {
  tradeCount?: number;
  dailyRefillAmount?: number;
  totalTradeAmount?: number;
  capacity?: number;
}

export interface TradeQuoteEndpoint {
  symbol: string;
  amount: number | string;
}

export interface TradeQuote {
  input?: TradeQuoteEndpoint;
  output?: TradeQuoteEndpoint;
}

export interface TradeExecution {
  id?: string;
  quote?: TradeQuote;
}

export interface ExchangeData {
  tradeAccount?: TradeAccount;
  tradeExecutions?: TradeExecution[];
}

export interface LinkedWallet {
  address: string;
  primary?: boolean;
  type?: string;
  provider?: string;
}

export interface OnchainResource {
  symbol: string;
  amount: number | string;
}

export interface OnchainData {
  wallets?: LinkedWallet[];
  resourcesOnChain?: OnchainResource[];
}

export interface CrystalPassData {
  hasActivePass: boolean;
  remainingDays: number;
  maxDays: number;
  claimableCrystals: number;
}

export interface ShopItemPurchase {
  shopItemId: string;
  purchasedAt: string;
}

export interface AdWatchCount {
  adPlacement: string;
  count: number;
}

export interface PurchasesData {
  isNoAdsActive?: boolean;
  isTransferActive?: boolean;
  crystalPass?: CrystalPassData;
  shopItemPurchases?: ShopItemPurchase[];
  adWatchCounts?: AdWatchCount[];
}

export interface HomePayload {
  profile?: CraftworldProfile;
  craftWorld?: CraftWorldData;
  masterpieces?: MasterpiecesData;
  craft?: CraftData;
  exchange?: ExchangeData;
  onchain?: OnchainData;
  inventory?: InventoryData;
  purchases?: PurchasesData;
  serverTime?: string;
  lastSyncedAt?: string;
}

export interface UseHomeDataReturn {
  me: Me | undefined;
  homeData: HomePayload | null;
  loading: boolean;
  error: string;
  activeTab: HomeTabId;
  setActiveTab: (tab: HomeTabId) => void;
  copiedAddress: string | null;
  copyAddress: (address: string) => void;
  reload: () => Promise<void>;
  isMissingScopes: boolean;
}
