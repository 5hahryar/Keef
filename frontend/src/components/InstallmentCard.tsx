import formatShamsiDate from '../utils/ShamsiDateFormatter'
import { type InstallmentPlan } from '../hooks/useInstallments'
import { useNavigate } from 'react-router-dom'

function toPersianDigits(n: number): string {
  return n
    .toString()
    .replace(/\d/g, (d) => String.fromCharCode(parseInt(d) + 0x06f0))
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount))
}

type InstallmentStatus = "paid" | "overdue" | "pending"

export default function InstallmentCard({ plan, onTogglePaid }: { plan: InstallmentPlan, onTogglePaid: (nextPaidCount: number) => void }) {
  const navigate = useNavigate()
  const per = plan.perInstallmentAmount ?? Math.round(plan.installmentAmount / plan.numberOfInstallments)
  const remainingCount = Math.max(0, plan.numberOfInstallments - plan.paidCount)
  const remainingAmount = remainingCount * per
  const status: InstallmentStatus = "overdue"

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card">
      <div className="flex items-center justify-between gap-3 w-full rtl">
        {/* Loan title (button) */}
        <button
          onClick={() => navigate(`/installments/${plan.id}`)}
          className="font-semibold text-lg text-right flex-1 truncate"
        >
          قسط وام {plan.title}
        </button>

        {/* Installment number badge */}
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
          قسط شماره {1}
        </span>

        {/* Status badge */}
        {status === "paid" ? (
          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
            پرداخت‌شده
          </span>
        ) : status === "overdue" ? (
          <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
            دیرکرد
          </span>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
            در انتظار
          </span>
        )}
      </div>


      <div className="mt-4 grid grid-cols-3 text-sm text-gray-600">
        <div className="text-right">
          <div className="opacity-70 mb-1">مبلغ</div>
          <div className="text-gray-800 font-semibold">{formatCurrency(remainingAmount)} تومان</div>
        </div>

        <div>
          <div className="opacity-70 mb-1">سررسید</div>
          <div className="font-medium text-gray-800">۲ آبان</div>
        </div>

        {status != "paid" && (<button
          onClick={() => onTogglePaid(Math.min(plan.paidCount + 1, plan.numberOfInstallments))} type="submit" className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">ثبت پرداخت</button>)}

      </div>
    </div>
  )
}


