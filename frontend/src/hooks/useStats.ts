import { useQuery } from '@tanstack/react-query'
import { statsService } from '../services/statsService'

export const useTotalSpending = (params?: {
  category?: string
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['stats', 'total-spending', params],
    queryFn: () => statsService.getTotalSpending(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('access_token'), // Only fetch if authenticated
    retry: false, // Don't retry on auth errors
  })
}

export const useSpendingByCategory = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['stats', 'spending-by-category', params],
    queryFn: () => statsService.getSpendingByCategory(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('access_token'), // Only fetch if authenticated
    retry: false, // Don't retry on auth errors
  })
}
