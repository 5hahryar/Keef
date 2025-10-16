import { apiClient, type ChangePasswordRequest, type LoginRequest, type LoginResponse,  } from '../lib/api'

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/users/token', credentials)
    return response.data
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/users/change-password', passwordData)
  },

  // Store token in localStorage
  setToken: (token: string) => {
    localStorage.setItem('access_token', token)
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('access_token')
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('access_token')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token')
  },
}
