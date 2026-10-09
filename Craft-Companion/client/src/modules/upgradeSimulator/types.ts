export type CategoryTab =
  | 'all'
  | 'earth'
  | 'water'
  | 'fire'
  | 'special'
  | 'keys'
  | 'nests'
  | 'wraps'
  | 'academy'
  | 'construction';

export interface RequiredResource {
  token: string;
  amount: number;
  unitPrice: number;
  totalCoin: number;
}

export interface FactoryUpgradeRow {
  token: string;
  nameEn: string;
  nameEs: string;
  category: CategoryTab;
  minLevel: number;
  maxLevel: number;
  fromLevel: number;
  toLevel: number;
  qty: number;
  inCart: boolean;
  requiredResources: RequiredResource[];
  totalCostCoin: number;
}

export interface ShoppingListItem {
  token: string;
  name: string;
  fromLevel: number;
  toLevel: number;
  qty: number;
  requiredResources: RequiredResource[];
  totalCostCoin: number;
}

export interface ConsolidatedResource {
  token: string;
  totalAmount: number;
  unitPrice: number;
  totalCostCoin: number;
}

export interface FacilityMeta {
  token: string;
  nameEn: string;
  nameEs: string;
  category: CategoryTab;
  maxLevel: number;
}
