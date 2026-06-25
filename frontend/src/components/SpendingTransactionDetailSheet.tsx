import type { Transaction } from '../lib/api'
import { useDeleteTransaction } from '../hooks/useTransactions'
import { transactionCategories } from '../utils/TransactionCategories'
import { banks } from '../utils/Banks'
import formatShamsiDate from '../utils/ShamsiDateFormatter'
import LongPressButton from './LongPressButton'

interface SpendingTransactionDetailSheetProps {
  transaction: Transaction
  onClose: () => void
  onEdit: () => void
}

export default function SpendingTransactionDetailSheet({
  transaction,
  onClose,
  onEdit,
}: SpendingTransactionDetailSheetProps) {
  const deleteTransactionMutation = useDeleteTransaction()

  const categoryLabel = transactionCategories[transaction.category as keyof typeof transactionCategories] ?? transaction.category
  const bankLabel = banks[transaction.bank as keyof typeof banks] ?? transaction.bank

  const handleDelete = () => {
    deleteTransactionMutation.mutate(transaction.id, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className="modal-backdrop flex items-end z-50" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-white max-h-[85vh] overflow-y-auto modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="text-center text-lg font-extrabold flex-1">جزئیات تراکنش</div>
          <div className="w-8" />
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center py-2">
            <div className="text-gray-500 text-sm mb-1">{transaction.title}</div>
            <div className="text-3xl font-black text-red-600">
              {new Intl.NumberFormat('fa-IR').format(Math.abs(transaction.amount))}
            </div>
            <div className="text-gray-400 text-sm mt-1">تومان</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">تاریخ</span>
              <span className="font-semibold">{formatShamsiDate(transaction.date)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">دسته‌بندی</span>
              <span className="font-semibold">{categoryLabel}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600">بانک</span>
              <span className="font-semibold">{bankLabel}</span>
            </div>

            {transaction.description && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-gray-600 text-sm mb-1">توضیحات</div>
                <div className="font-medium text-gray-800">{transaction.description}</div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-pill border border-brand-blue text-brand-blue py-3 text-lg font-semibold"
            >
              ویرایش
            </button>
            <LongPressButton
              onLongPress={handleDelete}
              disabled={deleteTransactionMutation.isPending}
              duration={1000}
              progressClassName="bg-red-900"
              className="flex-1 rounded-pill bg-red-500 text-white py-3 text-lg font-semibold disabled:opacity-50"
            >
              {deleteTransactionMutation.isPending ? 'در حال حذف...' : 'حذف'}
            </LongPressButton>
          </div>
        </div>
      </div>
    </div>
  )
}
