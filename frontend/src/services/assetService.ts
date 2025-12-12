import { apiClient } from '../lib/api';
import type { Asset, AssetTransaction } from '../types/portfolio';

export interface CreateAssetRequest {
  name: string;
  symbol: string;
  type: string;
  currentPrice: number;
}

export interface UpdateAssetRequest {
  name?: string;
  symbol?: string;
  type?: string;
  currentPrice?: number;
}

export interface CreateAssetTransactionRequest {
  assetId: string; // UUID
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  description?: string;
}

export const assetApiService = {
  // Get all assets
  async getAssets(): Promise<Asset[]> {
    const response = await apiClient.get('/assets');
    return response.data;
  },

  // Get a single asset
  async getAsset(id: string): Promise<Asset> {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data;
  },

  // Create a new asset
  async createAsset(asset: CreateAssetRequest): Promise<{ id: string }> {
    const response = await apiClient.post('/assets', asset);
    return response.data;
  },

  // Update an asset
  async updateAsset(id: string, updates: UpdateAssetRequest): Promise<void> {
    await apiClient.put(`/assets/${id}`, updates);
  },

  // Delete an asset
  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/assets/${id}`);
  },

  // Create a transaction
  async createTransaction(transaction: CreateAssetTransactionRequest): Promise<{ id: string }> {
    const response = await apiClient.post('/assets/transactions', transaction);
    return response.data;
  },

  // Get transactions (optionally filtered by assetId)
  async getTransactions(assetId?: string): Promise<AssetTransaction[]> {
    const params = assetId ? { assetId } : {};
    const response = await apiClient.get('/assets/transactions', { params });
    return response.data;
  },

  // Delete a transaction
  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/assets/transactions/${id}`);
  },
};

