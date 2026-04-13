import { useLoans, useCurrentMonthInstallments } from '../hooks/useLoans'
import AddInstallmentModal from '../components/AddLoanModal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loanService } from '../services/loanService'
import LongPressButton from '../components/LongPressButton'

type TabType = 'loans' | 'installments'

export default function InstallmentsPage() {
  const navigate = useNavigate()
  const { loans, loading: loansLoading, error: loansError, refetch: refetchLoans } = useLoans()
  const { installments, loading: installmentsLoading, error: installmentsError, refetch: refetchInstallments } = useCurrentMonthInstallments()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('loans')
  const [payingInstallmentId, setPayingInstallmentId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handlePayInstallment = async (loanId: string, installmentId: string) => {
    try {
      setPayingInstallmentId(installmentId)
      setPaymentError(null)
      await loanService.payInstallment(loanId, installmentId)
      // Clear any previous errors on success
      setPaymentError(null)
      // Refresh installments after successful payment
      await refetchInstallments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در ثبت پرداخت'
      setPaymentError(errorMessage)
      console.error('Error paying installment:', error)
      // Clear error after 5 seconds
      setTimeout(() => {
        setPaymentError(null)
      }, 5000)
    } finally {
      setPayingInstallmentId(null)
    }
  }

  const isLoading = loansLoading || installmentsLoading
  const hasError = loansError || installmentsError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold">اقساط</h1>
            <div className="w-6" />
          </div>
          <div className="text-center text-gray-500 py-10">در حال بارگذاری...</div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold">اقساط</h1>
            <div className="w-6" />
          </div>
          <div className="text-center text-red-500 py-10">
            خطا در بارگذاری: {loansError || installmentsError}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-2xl mx-auto px-4 pt-6">

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('loans')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'loans'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              وام‌ها
            </button>
            <button
              onClick={() => setActiveTab('installments')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'installments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              اقساط این ماه
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'loans' && (
            <div className="space-y-8">
              <div className="text-lg font-bold mb-3">وام‌های من</div>
              <div className="space-y-4">
                {loans.filter((loan) => !loan.isPaid).map((loan) => (
                  <div key={loan.id} className="bg-white rounded-3xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">وام {loan.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                        فعال
                      </span>
                    </div>
 
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">مبلغ هر قسط</div>
                        <div className="font-semibold text-gray-900">{new Intl.NumberFormat('fa-IR').format(loan.installmentAmount)} تومان</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">تعداد اقساط</div>
                        <div className="font-semibold text-gray-900">{loan.numberOfInstallments} قسط</div>
                      </div>
                    </div>
 
                    <div className="mt-4 pt-4 border-t border-gray-100" />
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate(`/installments/${loan.id}`)}
                        type="button"
                        className="p-2 text-blue-700 font-medium hover:bg-blue-100 rounded-lg"
                      >
                        مشاهده جزئیات
                      </button>
                    </div>

                  </div>
                ))}
                {loans.length === 0 && (
                  <div className="text-center text-gray-500 py-10">وامی اضافه نشده است</div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100" />

              {/* Paid Loans */}
              <div className="text-lg font-bold mb-3">وام‌های پرداخت شده</div>
              <div className="space-y-4">
                {loans.filter((loan) => loan.isPaid).map((loan) => (
                  <div key={loan.id} className="bg-white rounded-3xl p-5 shadow-card hover:bg-gry-100" 
                    onClick={() => navigate(`/installments/${loan.id}`)}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-gray-600">وام {loan.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm ">
                        پرداخت شده
                      </span>
                    </div>
                  </div>
                ))}
                {loans.length === 0 && (
                  <div className="text-center text-gray-500 py-10">وامی اضافه نشده است</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'installments' && (
            <div>
              <div className='flex'>
              <div className="text-lg font-bold mb-3">اقساط این ماه</div>
              <div className="text-sm font-medium mr-1 mt-1">({new Intl.NumberFormat('fa-IR').format(installments.reduce((total, current) => total + current.amount, 0))} تومان)</div>
              </div>
              <div className="space-y-4">
                {installments.map((installment) => (
                  <div key={installment.id} className="bg-white rounded-3xl p-5 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">وام {installment.loan.name} - قسط شماره {new Intl.NumberFormat('fa-IR').format(installment.installmentNumber)}</h3>
                        <p className="text-sm text-gray-500">سررسید: {new Date(installment.dueDate).toLocaleDateString('fa-IR')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        installment.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : installment.status === 'overdue'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {installment.status === 'paid' ? 'پرداخت شده' : 
                         installment.status === 'overdue' ? 'دیرکرد' : 'در انتظار'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">مبلغ</div>
                        <div className="text-xl font-bold text-gray-900">
                          {new Intl.NumberFormat('fa-IR').format(installment.amount)} تومان
                        </div>
                        {paymentError && payingInstallmentId === installment.id && (
                          <div className="text-xs text-red-600 mt-1">{paymentError}</div>
                        )}
                      </div>
                      {installment.status !== 'paid' && (
                        <LongPressButton
                          onLongPress={() => handlePayInstallment(installment.loan.id, installment.id)}
                          disabled={payingInstallmentId === installment.id}
                          duration={1000}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                          {payingInstallmentId === installment.id ? 'در حال ثبت...' : 'ثبت پرداخت'}
                        </LongPressButton>
                      )}
                    </div>
                  </div>
                ))}
                {installments.length === 0 && (
                  <div className="text-center text-gray-500 py-10">قسطی برای این ماه وجود ندارد</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - fixed at bottom right, outside scrollable container */}
      {activeTab === 'loans' && (
        <button
        onClick={(e) => { const t = e.currentTarget as HTMLButtonElement; const r = t.getBoundingClientRect(); t.style.setProperty('--x', `${e.clientX - r.left}px`); t.style.setProperty('--y', `${e.clientY - r.top}px`); setOpen(true) }}
        className="fixed right-6 h-16 w-16 rounded-2xl bg-brand-blue text-white shadow-lg text-3xl flex items-center justify-center btn btn-ripple"
        style={{ 
          position: 'fixed',
          right: '1.5rem',
          bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        }}
        aria-label="add installment"
      >
        +
      </button>
      )}

      {open && (
        <AddInstallmentModal
          onClose={() => setOpen(false)}
          onSuccess={() => {
            refetchLoans()
            refetchInstallments()
          }}
        />
      )}
    </>
  )
}


