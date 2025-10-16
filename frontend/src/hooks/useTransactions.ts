import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '../services/transactionService'
import { type Transaction } from '../lib/api'

export const useTransactions = (page: number = 1, category?: string) => {
  return useQuery({
    queryKey: ['transactions', page, category],
    queryFn: () => transactionService.getTransactions(page, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('access_token'), // Only fetch if authenticated
    retry: false, // Don't retry on auth errors
  })
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id'>) => 
      transactionService.createTransaction(transaction),
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
