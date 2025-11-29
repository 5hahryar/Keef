import { useState } from "react"
import { useCreateTransaction } from "../hooks/useTransactions"
import { transactionCategories } from "../utils/TransactionCategories"
import { banks } from "../utils/Banks"
import { formatNumber } from "../utils/NumberFormatter"

export default function AddModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      amount: '',
      category: '',
      bank: '',
      type: 'Withdraw',
    })
    
    const createTransactionMutation = useCreateTransaction()
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!formData.title || !formData.amount || !formData.category || !formData.bank) {
        alert('لطفاً همه فیلدها را پر کنید')
        return
      }
  
      try {
        await createTransactionMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          amount: parseInt(formData.amount),
          category: formData.category,
          bank: formData.bank,
          type: formData.type,
          date: new Date().toISOString(),
        })
        
        setFormData({ title: '', description: '', amount: '', category: '', bank: '', type: 'expense' })
        onClose()
      } catch (error) {
        alert('خطا در اضافه کردن تراکنش')
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
          <div className="text-center text-lg font-extrabold flex-1">تراکنش جدید</div>
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
            
            <input 
              placeholder="مبلغ" 
              type="text"
              inputMode="numeric"
              value={formatNumber(formData.amount)}
              onChange={(e) => setFormData({...formData, amount: e.target.value.replace(/,/g, "")})}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
              required
            />
            
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
              disabled={createTransactionMutation.isPending}
              className="w-full rounded-pill bg-brand-blue text-white py-3 text-lg disabled:opacity-50 btn btn-ripple"
            >
              {createTransactionMutation.isPending ? 'در حال اضافه کردن...' : 'اضافه کن'}
            </button>
            </div>
          </form>
        </div>
      </div>
    )
  }