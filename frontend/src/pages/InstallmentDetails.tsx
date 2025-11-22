import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLoanDetails } from '../hooks/useLoans'
import formatShamsiDate from '../utils/ShamsiDateFormatter'

function toPersianDigits(n: number): string {
  return n
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(parseInt(d) + 0x06f0))
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount))
}

export default function InstallmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loanDetails, loading, error } = useLoanDetails(id || '')

  // Use data directly from backend - no client-side calculations
  const data = useMemo(() => {
    if (!loanDetails) return null
    
    // Sort installments by installment number (already sorted by due date in backend)
    const sortedInstallments = [...loanDetails.installments].sort(
      (a, b) => a.installmentNumber - b.installmentNumber
    )
    
    // Calculate from backend data
    const paidCount = sortedInstallments.filter(inst => inst.status === 'paid').length
    const perInstallmentAmount = loanDetails.installmentAmount
    
    // Build list from actual backend installments
    const list = sortedInstallments.map((inst) => ({
      index: inst.installmentNumber,
      amount: inst.amount,
      date: inst.dueDate,
      isPaid: inst.status === 'paid',
      installmentId: inst.id
    }))
    
    const paidAmount = paidCount * perInstallmentAmount
    const remainingAmount = (loanDetails.numberOfInstallments - paidCount) * perInstallmentAmount
    const progress = Math.round((paidCount / loanDetails.numberOfInstallments) * 100)
    
    return { perInstallmentAmount, list, paidAmount, remainingAmount, progress, paidCount }
  }, [loanDetails])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="mt-6 text-center text-gray-600">در حال بارگذاری...</div>
      </div>
    )
  }

  if (error || !loanDetails || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-600">بازگشت</button>
        <div className="mt-6 text-center text-gray-600">یافت نشد</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        {/* <button onClick={() => navigate(-1)} className="text-2xl">←</button> */}
        <h1 className="text-2xl font-extrabold">جزئیات وام</h1>
        {/* <div className="w-6" /> */}
      </div>

      <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold">وام {loanDetails.name}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/15">فعال</span>
        </div>

        <div className="mt-5">
          <div className="text-sm mb-2">پیشرفت پرداخت</div>
          <div className="h-3 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-white/90" style={{ width: `${data.progress}%` }} />
          </div>
          <div className="text-sm mt-1 text-right">{toPersianDigits(data.progress)}%</div>
        </div>

        <div className="grid grid-cols-3 text-center mt-6">
          <div>
            <div className="opacity-90 mb-1">پرداخت شده</div>
            <div className="text-2xl font-bold">{toPersianDigits(data.paidCount)}</div>
          </div>
          <div className="border-x border-white/20">
            <div className="opacity-90 mb-1">باقیمانده</div>
            <div className="text-2xl font-bold">{toPersianDigits(loanDetails.numberOfInstallments - data.paidCount)}</div>
          </div>
          <div>
            <div className="opacity-90 mb-1">مجموع</div>
            <div className="text-2xl font-bold">{toPersianDigits(loanDetails.numberOfInstallments)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <div className="text-sm text-gray-500 mb-1">پرداخت شده</div>
          <div className="text-emerald-600 font-extrabold text-xl">{formatCurrency(data.paidAmount)} تومان</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <div className="text-sm text-gray-500 mb-1">مانده</div>
          <div className="text-rose-600 font-extrabold text-xl">{formatCurrency(data.remainingAmount)} تومان</div>
        </div>
      </div>

      <div className="mt-6 text-lg font-bold mb-2">لیست اقساط</div>
      <div className="space-y-3">
        {data.list.map((row) => (
          <div key={row.index} className={`rounded-2xl p-4 border ${row.isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'} flex items-center justify-between`}>
            <div>
              <div className={`text-lg font-semibold ${row.isPaid ? 'line-through text-gray-400' : 'text-gray-800'}`}>{formatCurrency(row.amount)} تومان</div>
              <div className="text-sm text-gray-500">قسط {toPersianDigits(row.index)}</div>
            </div>

            <span className="h-7 text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
              سررسید {formatShamsiDate(row.date)}
            </span>

            <div className="flex items-center gap-3 text-sm text-gray-600">

              {row.isPaid ? (
                <span className="h-7 text-xs px-3 py-1.5 rounded-full bg-green-200 text-green-700 whitespace-nowrap">
                  ✓ پرداخت‌ شده
                </span>
              ) : (
                <span className="h-7 text-xs px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-600 whitespace-nowrap">
                  منتظر پرداخت
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


