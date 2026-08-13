export class CreateAssetDto {
  name: string;
  symbol: string;
  type: string;
  currentPrice: number;
}

export class UpdateAssetDto {
  name?: string;
  symbol?: string;
  type?: string;
  currentPrice?: number;
}

export class CreateAssetTransactionDto {
  assetId: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  description?: string;
}

export class AssetResponse {
  id: string;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  currentPrice: number;
}

export class AssetTransactionResponse {
  id: string;
  assetId: string;
  type: string;
  quantity: number;
  price: number;
  date: string;
  description: string;
}
