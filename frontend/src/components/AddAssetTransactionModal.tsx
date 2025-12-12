import { useState } from 'react';
import type { Asset } from '../types/portfolio';
import { formatNumber } from '../utils/NumberFormatter';
import { useCreateAssetTransaction } from '../hooks/useAssetTransactions';
import DatePicker from './DatePicker';

interface AddAssetTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
  asset: Asset;
}

export default function AddAssetTransactionModal({
  onClose,
  onSuccess,
  asset,
}: AddAssetTransactionModalProps) {
  const createTransactionMutation = useCreateAssetTransaction();
  const [formData, setFormData] = useState({
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || !formData.price) {
      alert('لطفاً همه فیلدهای الزامی را پر کنید');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const price = parseFloat(formData.price.replace(/,/g, ''));

    if (quantity <= 0 || price <= 0) {
      alert('مقدار و قیمت باید بیشتر از صفر باشد');
      return;
    }

    // Check if selling more than available
    if (formData.type === 'sell' && quantity > asset.quantity) {
      alert(`شما نمی‌توانید بیشتر از ${asset.quantity} واحد بفروشید`);
      return;
    }

    try {
      await createTransactionMutation.mutateAsync({
        assetId: asset.id,
        type: formData.type,
        quantity,
        price,
        date: formData.date,
        description: formData.description || undefined,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      const errorMessage = error?.response?.data?.message || 'خطا در ذخیره تراکنش';
      alert(errorMessage);
    }
  };

  return (
    <div className="modal-backdrop flex items-end z-50">
      <div className="w-full rounded-t-3xl bg-white p-4 space-y-3 modal-sheet max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <div className="text-center text-lg font-extrabold flex-1">
            {formData.type === 'buy' ? 'خرید' : 'فروش'} {asset.name}
          </div>
          <div className="w-8" />
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <div className="font-semibold">{asset.name} ({asset.symbol})</div>
          <div className="text-xs text-gray-500 mt-1">
            موجودی: {new Intl.NumberFormat('fa-IR').format(asset.quantity)} واحد
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Transaction Type */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'buy' })}
              className={`flex-1 py-3 rounded-xl font-medium ${
                formData.type === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              خرید
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'sell' })}
              className={`flex-1 py-3 rounded-xl font-medium ${
                formData.type === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              فروش
            </button>
          </div>

          <input
            placeholder="تعداد/مقدار"
            type="text"
            inputMode="decimal"
            value={formData.quantity}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              setFormData({ ...formData, quantity: value });
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            required
          />

          <input
            placeholder="قیمت هر واحد (تومان)"
            type="text"
            inputMode="numeric"
            value={formatNumber(formData.price)}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: e.target.value.replace(/,/g, ''),
              })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            required
          />

          <DatePicker
            value={formData.date}
            onChange={(isoDate) => setFormData({ ...formData, date: isoDate })}
            placeholder="تاریخ تراکنش را انتخاب کنید"
          />

          <textarea
            placeholder="یادداشت (اختیاری)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right min-h-[80px]"
            rows={3}
          />

          {formData.type === 'sell' && parseFloat(formData.quantity) > asset.quantity && (
            <div className="text-red-600 text-sm">
              ⚠️ شما نمی‌توانید بیشتر از موجودی خود بفروشید
            </div>
          )}

          <button
            type="submit"
            className={`w-full text-white rounded-xl py-3 font-medium ${
              formData.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            ثبت {formData.type === 'buy' ? 'خرید' : 'فروش'}
          </button>
        </form>
      </div>
    </div>
  );
}

