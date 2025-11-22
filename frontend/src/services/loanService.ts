import { apiClient } from '../lib/api'

// Types based on backend models
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
  loan: Loan
}

export interface CreateLoanRequest {
  name: string
  numberOfInstallments: number
  installmentAmount: number
  numberOfDueDay: number
  firstPaymentDate?: string // ISO 8601 format, optional for partially paid loans
}

// API functions
export const loanService = {
  // Get all loans
  async getLoans(): Promise<Loan[]> {
    try {
      const response = await apiClient.get('/loans')
      console.log('Loans API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching loans:', error)
      throw error
    }
  },

  // Get loan details with installments
  async getLoanDetails(id: string): Promise<LoanDetail> {
    try {
      const response = await apiClient.get(`/loans/${id}`)
      console.log('Loan details API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching loan details:', error)
      throw error
    }
  },

  // Get installments for a specific date range
  async getInstallments(fromDate?: string, toDate?: string): Promise<Installment[]> {
    try {
      const params = new URLSearchParams()
      if (fromDate) params.append('fromDueDate', fromDate)
      if (toDate) params.append('toDueDate', toDate)
      
      const response = await apiClient.get(`/loans/installments?${params.toString()}`)
      console.log('Installments API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching installments:', error)
      throw error
    }
  },

  // Create a new loan
  async createLoan(loanData: CreateLoanRequest): Promise<{ id: string }> {
    try {
      const response = await apiClient.post('/loans', loanData)
      console.log('Create loan API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating loan:', error)
      throw error
    }
  },

  // Pay an installment
  async payInstallment(loanId: string, installmentId: string): Promise<void> {
    try {
      const response = await apiClient.post(`/loans/${loanId}/installments/${installmentId}/pay`)
      console.log('Pay installment API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error paying installment:', error)
      throw error
    }
  }
}
