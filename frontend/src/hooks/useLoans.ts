import { useState, useEffect } from 'react'
import { loanService, type Loan, type LoanDetail, type Installment } from '../services/loanService'
import getShamsiMonthRange from '../utils/ShamsiDateExt'

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getLoans()
      setLoans(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans')
      console.error('Error fetching loans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  return {
    loans,
    loading,
    error,
    refetch: fetchLoans
  }
}

export function useLoanDetails(loanId: string) {
  const [loanDetails, setLoanDetails] = useState<LoanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLoanDetails = async () => {
    if (!loanId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await loanService.getLoanDetails(loanId)
      setLoanDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loan details')
      console.error('Error fetching loan details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoanDetails()
  }, [loanId])

  return {
    loanDetails,
    loading,
    error,
    refetch: fetchLoanDetails
  }
}

export function useCurrentMonthInstallments() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrentMonthInstallments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentShamsiMonthDateRange = getShamsiMonthRange()
      
      const data = await loanService.getInstallments(
        currentShamsiMonthDateRange.startDate.toISOString(),
        currentShamsiMonthDateRange.endDate.toISOString()
      )
      setInstallments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch installments')
      console.error('Error fetching installments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentMonthInstallments()
  }, [])

  return {
    installments,
    loading,
    error,
    refetch: fetchCurrentMonthInstallments
  }
}
