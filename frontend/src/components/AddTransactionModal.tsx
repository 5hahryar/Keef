import { useState } from "react"
import { useCreateTransaction, useUpdateTransaction } from "../hooks/useTransactions"
import { transactionCategories } from "../utils/TransactionCategories"
import { banks } from "../utils/Banks"
import { formatNumber } from "../utils/NumberFormatter"
import DatePicker from "./DatePicker"
import type { Transaction } from "../lib/api"

export type AddTransactionInitialValues = {
  title?: string
  description?: string
  amount?: string
  category?: string
  bank?: string
  type?: string
  date?: string
}

export default function AddModal({
  onClose,
  editingTransaction,
  initialValues,
}: {
  onClose: () => void
  editingTransaction?: Transaction | null
  initialValues?: AddTransactionInitialValues
}) {
    const [formData, setFormData] = useState({
      title: editingTransaction?.title ?? initialValues?.title ?? '',
      description: editingTransaction?.description ?? initialValues?.description ?? '',
      amount: editingTransaction?.amount?.toString() ?? initialValues?.amount ?? '',
      category: editingTransaction?.category ?? initialValues?.category ?? '',
      bank: editingTransaction?.bank ?? initialValues?.bank ?? '',
      type: editingTransaction?.type ?? initialValues?.type ?? 'Withdraw',
      date: editingTransaction?.date ?? initialValues?.date ?? new Date().toISOString(),
    })
    
    const createTransactionMutation = useCreateTransaction()
    const updateTransactionMutation = useUpdateTransaction()
    const isEditing = !!editingTransaction
    const isPending = createTransactionMutation.isPending || updateTransactionMutation.isPending
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!formData.title || !formData.amount || !formData.category || !formData.bank) {
        alert('لطفاً همه فیلدها را پر کنید')
        return
      }
  
      const payload = {
        title: formData.title,
        description: formData.description,
        amount: parseInt(formData.amount),
        category: formData.category,
        bank: formData.bank,
        type: formData.type,
        date: formData.date,
      }

      try {
        if (isEditing && editingTransaction) {
          await updateTransactionMutation.mutateAsync({
            id: editingTransaction.id,
            transaction: payload,
          })
        } else {
          await createTransactionMutation.mutateAsync(payload)
        }
        onClose()
      } catch (error) {
        alert(isEditing ? 'خطا در ویرایش تراکنش' : 'خطا در اضافه کردن تراکنش')
      }
    }
  
    return (
      <div className="modal-backdrop flex items-end z-50">
        <div className="w-full rounded-t-3xl bg-white p-4 space-y-3 modal-sheet">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="text-center text-lg font-extrabold flex-1">
            {isEditing ? 'ویرایش تراکنش' : 'تراکنش جدید'}
          </div>
          <div className="w-8" />
        </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              placeholder="عنوان" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
              required
            />
            
            <div className="-mx-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
              <input 
                placeholder="مبلغ (تومان)" 
                type="text"
                inputMode="numeric"
                value={formatNumber(formData.amount)}
                onChange={(e) => setFormData({...formData, amount: e.target.value.replace(/,/g, "")})}
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
                required
              />
              <DatePicker
                value={formData.date}
                onChange={(isoDate) => setFormData({ ...formData, date: isoDate })}
                placeholder="تاریخ تراکنش را انتخاب کنید"
                useShortDisplayFormat= {true}
              />
            </div>
            
            <div className="text-right text-gray-600 mt-2">دسته‌بندی</div>
            <div className="-mx-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
              {Object.entries(transactionCategories).map(([categoryKey, categoryLabel]) => (
                <button 
                  key={categoryKey} 
                  type="button"
                  onClick={() => setFormData({...formData, category: categoryKey})}
                  className={`shrink-0 text-gray-800 rounded-pill px-4 py-2 text-gray-800 text-sm ${
                    formData.category === categoryKey ? 'bg-brand-blue text-white' : 'border'
                  }`}
                >
                  {categoryLabel}
                </button>
              ))}
            </div>
            
            <div className="text-right text-gray-600 mt-2">بانک</div>
            <div className="-mx-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
              {Object.entries(banks).map(([bankKey, bankLabel]) => (
                <button 
                  key={bankKey} 
                  type="button"
                  onClick={() => setFormData({...formData, bank: bankKey})}
                  className={`rounded-pill px-4 py-2 text-sm ${
                    formData.bank === bankKey ? 'bg-brand-blue text-white' : 'border'
                  }`}
                >
                  {bankLabel}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 pt-4">
          
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full rounded-pill bg-brand-blue text-white py-3 text-lg disabled:opacity-50 btn btn-ripple"
            >
              {isPending
                ? (isEditing ? 'در حال ذخیره...' : 'در حال اضافه کردن...')
                : (isEditing ? 'ذخیره' : 'اضافه کن')}
            </button>
            </div>
          </form>
        </div>
      </div>
    )
  }