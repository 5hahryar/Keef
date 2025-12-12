import type { AssetTransaction, Asset } from '../types/portfolio';
import { useDeleteAssetTransaction } from '../hooks/useAssetTransactions';

interface TransactionDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: AssetTransaction | null;
  asset: Asset | null;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const toPersianDigits = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => String.fromCharCode(parseInt(d) + 0x06f0));
};

export default function TransactionDetailSheet({
  isOpen,
  onClose,
  transaction,
  asset,
}: TransactionDetailSheetProps) {
  const deleteTransactionMutation = useDeleteAssetTransaction();

  if (!isOpen || !transaction || !asset) return null;

  const totalValue = transaction.quantity * transaction.price;
  const currentValue = transaction.quantity * asset.currentPrice;
  // Note: currentPrice from backend is actually the average purchase price
  const profitLoss = transaction.type === 'sell'
    ? totalValue - (transaction.quantity * asset.currentPrice) // For sell: profit = sell price - average cost
    : currentValue - totalValue; // For buy: unrealized gain = current value - purchase cost
  const profitLossPercent = totalValue > 0 ? (profitLoss / totalValue) * 100 : 0;

  const handleDelete = () => {
    if (confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      deleteTransactionMutation.mutate(
        { id: transaction.id, assetId: asset.id },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold text-center flex-1">
            جزئیات تراکنش
          </h2>
          <button
            onClick={handleDelete}
            className="text-red-500 text-sm"
          >
            حذف
          </button>
        </div>


        <div className="flex items-center bg-gray-50 rounded-xl m-4">
          {/* Asset Info */}
          <div className="w-full bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">دارایی</div>
            <div className="font-semibold text-lg">{asset.name}</div>
            <div className="text-sm text-gray-500">{asset.symbol}</div>
          </div>

          <span
            className={`mx-4 p-4 py-2 rounded-full text-sm font-medium ${transaction.type === 'buy'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}
          >
            {transaction.type === 'buy' ? 'خرید' : 'فروش'}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
              <span className="text-gray-600">تاریخ</span>
              <span className="font-semibold">{formatDate(transaction.date)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
              <span className="text-gray-600">تعداد/مقدار</span>
              <span className="font-semibold">{formatCurrency(transaction.quantity)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
              <span className="text-gray-600">قیمت هر واحد</span>
              <span className="font-semibold">{formatCurrency(transaction.price)} تومان</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
              <span className="text-gray-600">مبلغ کل</span>
              <span className="font-bold text-lg">{formatCurrency(totalValue)} تومان</span>
            </div>
          </div>

          {/* Profit/Loss Section */}
          {transaction.type === 'buy' && (
            <div className={`rounded-xl p-4 ${profitLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm text-gray-600 mb-2">ارزش فعلی</div>
              <div className="text-xl font-bold mb-3">{formatCurrency(currentValue)} تومان</div>
              <div className="border-t border-grey-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {profitLoss >= 0 ? 'سود' : 'زیان'} تحقق یافته
                  </span>
                  <span
                    className={`font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {formatCurrency(profitLoss)} ({profitLossPercent >= 0 ? '+' : ''}
                    {toPersianDigits(Math.round(profitLossPercent * 10) / 10)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {transaction.type === 'sell' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-2">قیمت متوسط خرید</div>
              <div className="text-lg font-semibold mb-3">{formatCurrency(asset.currentPrice)} تومان</div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">سود/زیان</span>
                  <span
                    className={`font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {profitLoss >= 0 ? '+' : ''}
                    {formatCurrency(profitLoss)} ({profitLossPercent >= 0 ? '+' : ''}
                    {toPersianDigits(Math.round(profitLossPercent * 10) / 10)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {transaction.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-2">یادداشت</div>
              <div className="text-gray-800">{transaction.description}</div>
            </div>
          )}

          {/* Transaction Context
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-2">موقعیت در تاریخچه</div>
            <div className="text-gray-800">
              تراکنش {toPersianDigits(transactionIndex + 1)} از {toPersianDigits(assetTransactions.length)}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

