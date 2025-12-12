import axios from 'axios'

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
  name: string
  total: number
  transaction_count: number
}

// Loan and Installment types
export interface Loan {
  id: string
  name: string
  numberOfInstallments: number
  installmentAmount: number
  numberOfDueDay: number
}

export interface LoanDetail {
  id: string
  name: string
  numberOfInstallments: number
  installmentAmount: number
  numberOfDueDay: number
  installments: Installment[]
}

export interface Installment {
  id: string
  amount: number
  dueDate: string
  installmentNumber: number
  status: 'pending' | 'paid' | 'overdue'
}

export interface CreateLoanRequest {
  name: string
  numberOfInstallments: number
  installmentAmount: number
  numberOfDueDay: number
}

// API functions for loans and installments
export const loanApi = {
  // Get all loans
  async getLoans(): Promise<Loan[]> {
    try {
      const response = await apiClient.get('/loans')
      console.log('API Response for loans:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching loans:', error)
      throw error
    }
  },

  // Get loan details
  async getLoan(id: string): Promise<LoanDetail> {
    try {
      const response = await apiClient.get(`/loans/${id}`)
      console.log('API Response for loan details:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching loan details:', error)
      throw error
    }
  },

  // Create a new loan
  async createLoan(loan: CreateLoanRequest): Promise<{ id: string }> {
    const response = await apiClient.post('/loans', loan)
    return response.data
  },

  // Get installments with optional date range
  async getInstallments(fromDueDate?: string, toDueDate?: string): Promise<Installment[]> {
    try {
      const params = new URLSearchParams()
      if (fromDueDate) params.append('fromDueDate', fromDueDate)
      if (toDueDate) params.append('toDueDate', toDueDate)
      
      const response = await apiClient.get(`/loans/installments?${params.toString()}`)
      console.log('API Response for installments:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching installments:', error)
      throw error
    }
  }
}
