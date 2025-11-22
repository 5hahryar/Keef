import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useTotalSpending } from '../hooks/useStats'
import AddModal from '../components/AddTransactionModal'
import getShamsiMonthRange from '../utils/ShamsiDateExt'
import { transactionCategories } from '../utils/TransactionCategories'
import { banks } from '../utils/Banks'
import formatShamsiDate from '../utils/ShamsiDateFormatter'

export default function Dashboard() {
  const [open, setOpen] = useState(false)
  const [page] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const isAuthenticated = !!localStorage.getItem('access_token')

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useTransactions(page, selectedCategory)
  
  const currentShamsiMonthDateRange = getShamsiMonthRange()

  // Fetch total spending
  const { data: totalSpending, isLoading: totalLoading } = useTotalSpending({ startDate: currentShamsiMonthDateRange.startDate.toISOString(), endDate: currentShamsiMonthDateRange.endDate.toISOString() })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info */}
      <div className="fixed top-0 left-0 bg-black text-white text-xs p-2 z-50">
        Auth: {isAuthenticated ? 'Yes' : 'No'} | 
        Loading: {transactionsLoading ? 'Yes' : 'No'} | 
        Error: {transactionsError ? 'Yes' : 'No'} |
        Data: {transactions.length} items
      </div>
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">داشبورد</h1>
        {/* <Link className="text-brand-blue" to="/stats">آمار →</Link> */}
      </header>

      <main className="px-4">
        <div className="text-center my-6">
          <div className="text-gray-500">جمع مخارج این ماه</div>
          {totalLoading ? (
            <div className="text-4xl font-black tracking-wider animate-pulse">...</div>
          ) : (
            <div className="text-4xl font-black tracking-wider">{new Intl.NumberFormat('fa-IR').format(Math.abs(totalSpending ?? 0))}</div>
          )}
          <div className="text-gray-500 mt-1">تومن</div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
        <button 
            onClick={() => setSelectedCategory(undefined)}
            className={`shrink-0 rounded-pill px-5 py-2 text-gray-800 ${
              !selectedCategory ? 'bg-brand-blue text-white' : 'bg-brand-pink/20'
            }`}
          >
            همه
          </button>
          {Object.entries(transactionCategories).map(([categoryKey, categoryLabel]) => (
            <button 
              key={categoryKey} 
              onClick={() => setSelectedCategory(categoryKey)}
              className={`shrink-0 rounded-pill px-5 py-2 text-gray-800 ${
                selectedCategory === categoryKey ? 'bg-brand-blue text-white' : 'bg-brand-pink/20'
              }`}
            >
              {categoryLabel}
            </button>
          ))}
        </div>

        {transactionsError && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
            خطا در بارگذاری تراکنش‌ها
          </div>
        )}

        {transactionsLoading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 bg-white rounded-2xl shadow-card">
            {transactions.map(t => (
              <li key={t.id} className="flex items-center justify-between px-4 py-4">
                <div className="text-gray-700">{t.title}
                  <div className="text-xs text-gray-400 mt-1">{formatShamsiDate(t.date)} | {Object.entries(banks).find(b => b[0] === t.bank)?.[1]}</div>
                </div>
                <div className="text-red-600 font-semibold">{new Intl.NumberFormat('fa-IR').format(Math.abs(t.amount))}</div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <button
        onClick={(e) => { const t = e.currentTarget as HTMLButtonElement; const r = t.getBoundingClientRect(); t.style.setProperty('--x', `${e.clientX - r.left}px`); t.style.setProperty('--y', `${e.clientY - r.top}px`); setOpen(true) }}
        className="fixed right-6 w-16 h-16 rounded-full bg-brand-blue text-white text-3xl shadow-lg z-30 btn btn-ripple"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        +
      </button>

      {open && <AddModal onClose={() => setOpen(false)} />}
    </div>
  )
}


