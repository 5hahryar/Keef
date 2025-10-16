import axios from 'axios'

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // For now, just propagate errors so components can show proper UI
    // Optionally, you can route to a login page once it's implemented
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
    }
    return Promise.reject(error)
  }
)

// Types based on your backend models
export interface Transaction {
  id: number
  title: string
  description: string
  amount: number
  date: string
  bank: string
  category: string
  type: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface ChangePasswordRequest {
  password: string
  newPassword: string
  repeatNewPassword: string
}

export interface CategoryStats {
  category: string
  total: number
  percentage: number
}
