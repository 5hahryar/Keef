import formatShamsiDate from '../utils/ShamsiDateFormatter'
import { useCurrentMonthCalculations } from '../hooks/useInstallments'

function toPersianDigits(n: number): string {
  return n
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(parseInt(d) + 0x06f0))
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount))
}

export default function MonthlySummary() {
  const { monthTitle, totalThisMonth, paidThisMonth, remainingThisMonth, upcoming, loading } =
    useCurrentMonthCalculations()
  
  if (loading) {
    return (
      <div className="rounded-3xl p-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-card">
        <div className="text-center py-4">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{monthTitle}</h2>
        <div className="flex items-center gap-2 opacity-90">
          <span className="text-2xl">🗓️</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/10 p-4 backdrop-blur mb-4">
        <div className="text-sm opacity-90 mb-1">مجموع قسط این ماه</div>
        <div className="text-2xl font-extrabold">{formatCurrency(totalThisMonth)} تومان</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="text-sm opacity-90 mb-1">باقیمانده</div>
          <div className="text-xl font-bold">{formatCurrency(remainingThisMonth)} تومان</div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="text-sm opacity-90 mb-1">پرداخت شده</div>
          <div className="text-xl font-bold">{formatCurrency(paidThisMonth)} تومان</div>
        </div>
      </div>

    </div>
  )
}


