import { apiClient, type Transaction } from '../lib/api'

export const transactionService = {
  // Get transactions with pagination and category filter
  getTransactions: async (page: number = 1, category?: string): Promise<Transaction[]> => {
    const params = new URLSearchParams({ page: page.toString() })
    if (category) params.append('category', category)
    
    const response = await apiClient.get(`/transactions?${params}`)
    return response.data
  },

  // Create new transaction
  createTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<{ id: number }> => {
    const response = await apiClient.post('/transactions/create', transaction)
    return response.data
  },

  // Delete transaction
  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}/delete`)
  },
}
