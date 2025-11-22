import { useMemo } from 'react'
import { useLoans, useLoanDetails, useCurrentMonthInstallments } from './useLoans'
import jalaali from 'jalaali-js'

/**
 * Simple interface for components that need basic loan info
 * All data comes from backend - no client-side business logic
 */
export interface InstallmentPlan {
  id: string
  title: string
  installmentAmount: number // per installment amount from backend
  numberOfInstallments: number
  startDate: string // ISO string, first due date from backend
  frequency: 'monthly'
  paidCount: number // calculated from backend installment statuses
  perInstallmentAmount: number // same as installmentAmount from backend
}

/**
 * Hook to get a loan as InstallmentPlan format (for backward compatibility)
 * All data comes from backend LoanDetail
 */
export function useInstallmentPlan(loanId: string | undefined) {
  const { loanDetails, loading, error, refetch } = useLoanDetails(loanId || '')
  
  const plan: InstallmentPlan | null = useMemo(() => {
    if (!loanDetails) return null
    
    // Calculate paid count from backend installments
    const paidCount = loanDetails.installments.filter(inst => inst.status === 'paid').length
    
    // Get first installment date from backend
    const sortedInstallments = [...loanDetails.installments].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    const startDate = sortedInstallments[0]?.dueDate || new Date().toISOString()
    
    return {
      id: loanDetails.id,
      title: loanDetails.name,
      installmentAmount: loanDetails.installmentAmount,
      numberOfInstallments: loanDetails.numberOfInstallments,
      startDate,
      frequency: 'monthly' as const,
      paidCount,
      perInstallmentAmount: loanDetails.installmentAmount
    }
  }, [loanDetails])
  
  return {
    plan,
    loanDetails, // Also expose full loan details for components that need it
    loading,
    error,
    refetch
  }
}

/**
 * Hook to get all loans as InstallmentPlan format (for backward compatibility)
 * NOTE: This is deprecated - components should use useLoanDetails directly for specific loans
 * or useLoans for all loans. Keeping this for backward compatibility only.
 */
export function useInstallments() {
  const { loading: loansLoading, error: loansError, refetch: refetchLoans } = useLoans()
  
  // Return empty items - components should migrate to useLoanDetails or useLoans
  return {
    items: [] as InstallmentPlan[],
    loading: loansLoading,
    error: loansError,
    refetch: refetchLoans
  }
}

/**
 * Helper hook for monthly calculations using actual installments from backend
 * All data comes from backend API
 */
export interface MonthSummary {
  monthTitle: string
  totalThisMonth: number
  paidThisMonth: number
  remainingThisMonth: number
}

export interface UpcomingPayment {
  id: string
  title: string
  dueDate: string // ISO
  amount: number
  isPaid: boolean
}

export function useCurrentMonthCalculations() {
  const { installments, loading, error } = useCurrentMonthInstallments()
  
  const results = useMemo(() => {
    // Get current Persian month range
    const now = new Date()
    const jNow = jalaali.toJalaali(now)
    const daysInMonth = jalaali.jalaaliMonthLength(jNow.jy, jNow.jm)
    const startG = jalaali.toGregorian(jNow.jy, jNow.jm, 1)
    const endG = jalaali.toGregorian(jNow.jy, jNow.jm, daysInMonth)
    const start = new Date(startG.gy, startG.gm - 1, startG.gd)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endG.gy, endG.gm - 1, endG.gd)
    end.setHours(23, 59, 59, 999)
    
    const monthTitle = (() => {
      const months = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
      ]
      return `پرداخت‌های ${months[jNow.jm - 1]}`
    })()
    
    // Calculate from actual installments from backend
    let totalThisMonth = 0
    let paidThisMonth = 0
    const upcoming: UpcomingPayment[] = []
    
    installments.forEach((installment) => {
      totalThisMonth += installment.amount
      const isPaid = installment.status === 'paid'
      if (isPaid) {
        paidThisMonth += installment.amount
      }
      
      upcoming.push({
        id: installment.id,
        title: installment.loan.name,
        dueDate: installment.dueDate,
        amount: installment.amount,
        isPaid
      })
    })
    
    const remainingThisMonth = Math.max(0, totalThisMonth - paidThisMonth)
    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    
    return { monthTitle, totalThisMonth, paidThisMonth, remainingThisMonth, upcoming }
  }, [installments])
  
  return {
    ...results,
    loading,
    error
  }
}
