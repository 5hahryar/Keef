import { apiClient, type CategoryStats,  } from '../lib/api'

export const statsService = {
  // Get total spending
  getTotalSpending: async (params?: {
    category?: string
    startDate?: string
    endDate?: string
  }): Promise<number> => {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const response = await apiClient.get(`/statistics/total-spent?${queryParams}`)
    console.log(response.data)
    return response.data
  },

  // Get spending by category
  getSpendingByCategory: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<CategoryStats[]> => {
    const queryParams = new URLSearchParams()
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const response = await apiClient.get(`/statistics/total-spent-category?${queryParams}`)
    return response.data
  },
}
