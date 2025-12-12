export interface Asset {
  id: string; // UUID from backend
  name: string;
  symbol: string;
  type: 'stock' | 'crypto' | 'gold' | 'currency' | 'other';
  quantity: number;
  currentPrice: number; // This is the average purchase price from backend
}

export interface AssetTransaction {
  id: string; // UUID from backend
  assetId: string; // UUID from backend
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  description?: string; // Backend uses "description" instead of "notes"
}

export interface AssetCollection {
  assets: Asset[];
  transactions: AssetTransaction[];
  lastUpdated: string;
}

