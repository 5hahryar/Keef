import { useState } from 'react'
import { loanService } from '../services/loanService'
import jalaali from 'jalaali-js'

export default function AddInstallmentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [title, setTitle] = useState('')
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [count, setCount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [isPartiallyPaid, setIsPartiallyPaid] = useState(false)
  const [firstPaymentDate, setFirstPaymentDate] = useState({ year: '', month: '', day: '' })

  function computeFirstPaymentDateISO(): string | undefined {
    if (!isPartiallyPaid || !firstPaymentDate.year || !firstPaymentDate.month || !firstPaymentDate.day) {
      return undefined
    }

    try {
      const jy = parseInt(firstPaymentDate.year)
      const jm = parseInt(firstPaymentDate.month)
      const jd = parseInt(firstPaymentDate.day)
      
      // Validate date
      const maxDays = jalaali.jalaaliMonthLength(jy, jm)
      if (jd < 1 || jd > maxDays) {
        return undefined
      }
      
      const g = jalaali.toGregorian(jy, jm, jd)
      const d = new Date(g.gy, g.gm - 1, g.gd)
      d.setHours(0, 0, 0, 0)
      return d.toISOString()
    } catch {
      return undefined
    }
  }

  // Initialize with current Persian date when toggle is enabled
  const handleTogglePartiallyPaid = (enabled: boolean) => {
    setIsPartiallyPaid(enabled)
    if (enabled && !firstPaymentDate.year) {
      const now = new Date()
      const j = jalaali.toJalaali(now)
      setFirstPaymentDate({
        year: j.jy.toString(),
        month: j.jm.toString(),
        day: j.jd.toString()
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !installmentAmount || !count) return
    
    // Validate partially paid date if enabled
    if (isPartiallyPaid) {
      const firstPaymentISO = computeFirstPaymentDateISO()
      if (!firstPaymentISO) {
        alert('لطفاً تاریخ اولین پرداخت را به درستی وارد کنید')
        return
      }
    }
    
    try {
      const firstPaymentISO = isPartiallyPaid ? computeFirstPaymentDateISO() : undefined
      
      // Create loan via API with firstPaymentDate if provided
      const loanData = {
        name: title,
        numberOfInstallments: parseInt(count),
        installmentAmount: parseInt(installmentAmount),
        numberOfDueDay: parseInt(dayOfMonth),
        firstPaymentDate: firstPaymentISO
      }
      
      await loanService.createLoan(loanData)
      
      // Trigger refresh callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (error) {
      console.error('Error creating loan:', error)
      alert('خطا در ایجاد وام. لطفاً دوباره تلاش کنید.')
    }
  }

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]

  const getDaysInMonth = (year: number, month: number): number => {
    if (!year || !month) return 31
    try {
      return jalaali.jalaaliMonthLength(parseInt(year.toString()), parseInt(month.toString()))
    } catch {
      return 31
    }
  }

  return (
    <div className="modal-backdrop flex items-end z-50">
      <div className="w-full rounded-t-3xl bg-white p-5 space-y-4 max-h-[90vh] overflow-auto modal-sheet">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="text-center text-lg font-extrabold flex-1">وام جدید</div>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            placeholder="عنوان (مثلاً: خودرو)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            placeholder="مبلغ هر قسط"
            inputMode="numeric"
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            placeholder="تعداد اقساط"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />

          <div className="relative">
            <select
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right appearance-none bg-white"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              required
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day.toString()}>
                  {day}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-5 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">قسطها در روز {dayOfMonth} هر ماه سررسید میشوند</div>
          </div>

          <div className="border-t border-gray-200 my-4" />

          {/* Partially Paid Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">قسط نیمه پرداخت شده (قسطی که قبلاً شروع شده)</span>
            <button
              type="button"
              onClick={() => handleTogglePartiallyPaid(!isPartiallyPaid)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                isPartiallyPaid ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`mr-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPartiallyPaid && 'mr-7'
                }`}
              />
            </button>
          </div>

          {isPartiallyPaid && (
            <>
              <div className="text-xs text-gray-500 text-right">
                اگر این وام را قبلاً شروع کرده اید تاریخ اولین پرداخت را مشخص کنید
              </div>
              <div className="text-sm text-gray-700 mb-1 text-right">تاریخ اولین پرداخت را انتخاب کنید</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="سال"
                  min="1300"
                  max="1500"
                  className="rounded-xl border border-gray-200 px-3 py-3 text-center"
                  value={firstPaymentDate.year}
                  onChange={(e) => setFirstPaymentDate({ ...firstPaymentDate, year: e.target.value })}
                  required={isPartiallyPaid}
                />
                <select
                  className="rounded-xl border border-gray-200 px-3 py-3 text-center appearance-none bg-white"
                  value={firstPaymentDate.month}
                  onChange={(e) => {
                    const month = e.target.value
                    setFirstPaymentDate({ ...firstPaymentDate, month })
                    // Reset day if it exceeds days in new month
                    const maxDays = getDaysInMonth(parseInt(firstPaymentDate.year || '1400'), parseInt(month))
                    if (parseInt(firstPaymentDate.day || '1') > maxDays) {
                      setFirstPaymentDate(prev => ({ ...prev, day: maxDays.toString() }))
                    }
                  }}
                  required={isPartiallyPaid}
                >
                  <option value="">ماه</option>
                  {persianMonths.map((month, idx) => (
                    <option key={idx + 1} value={(idx + 1).toString()}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 rounded-pill bg-brand-blue text-white py-3 text-lg btn btn-ripple">ایجاد</button>
          </div>
        </form>
      </div>
    </div>
  )
}


