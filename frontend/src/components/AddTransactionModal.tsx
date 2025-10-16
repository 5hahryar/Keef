import { useState } from "react"
import { useCreateTransaction } from "../hooks/useTransactions"
import { transactionCategories } from "../utils/TransactionCategories"
import { banks } from "../utils/Banks"

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
      <div className="fixed inset-0 bg-black/40 flex items-end">
        <div className="w-full rounded-t-3xl bg-white p-4 space-y-3">
          <div className="text-lg font-semibold text-right">تراکنش جدید</div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              placeholder="عنوان" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
              required
            />
            
            <input 
              placeholder="توضیحات" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
            />
            
            <input 
              placeholder="مبلغ" 
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right" 
              required
            />
            
            <div className="text-right text-gray-600 mt-2">دسته‌بندی</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(transactionCategories).map(([categoryKey, categoryLabel]) => (
                <button 
                  key={categoryKey} 
                  type="button"
                  onClick={() => setFormData({...formData, category: categoryKey})}
                  className={`rounded-pill px-4 py-2 text-sm ${
                    formData.category === categoryKey ? 'bg-brand-blue text-white' : 'border'
                  }`}
                >
                  {categoryLabel}
                </button>
              ))}
            </div>
            
            <div className="text-right text-gray-600 mt-2">بانک</div>
            <div className="flex flex-wrap gap-2">
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
            
            <button 
              type="submit" 
              disabled={createTransactionMutation.isPending}
              className="w-full rounded-pill bg-brand-blue text-white py-3 text-lg disabled:opacity-50"
            >
              {createTransactionMutation.isPending ? 'در حال اضافه کردن...' : 'اضافه کن'}
            </button>

            <button 
              type="button" 
              disabled={createTransactionMutation.isPending}
              onClick={onClose}
              className="w-full text-red-500 py-3 text-lg disabled:opacity-50"
            >
              {'انصراف'}
            </button>
          </form>
        </div>
      </div>
    )
  }