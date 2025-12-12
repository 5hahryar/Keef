import { useState } from 'react';
import type { Asset } from '../types/portfolio';
import { formatNumber } from '../utils/NumberFormatter';
import { useCreateAsset, useUpdateAsset } from '../hooks/useAssets';

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingAsset?: Asset | null;
}

const assetTypes = [
  { value: 'stock', label: 'سهام' },
  { value: 'crypto', label: 'ارز دیجیتال' },
  { value: 'gold', label: 'طلا' },
  { value: 'currency', label: 'ارز' },
  { value: 'other', label: 'سایر' },
] as const;

export default function AddAssetModal({ onClose, onSuccess, editingAsset }: AddAssetModalProps) {
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const [formData, setFormData] = useState({
    name: editingAsset?.name || '',
    symbol: editingAsset?.symbol || '',
    type: (editingAsset?.type || 'stock') as Asset['type'],
    currentPrice: editingAsset?.currentPrice?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.symbol || !formData.currentPrice) {
      alert('لطفاً همه فیلدهای الزامی را پر کنید');
      return;
    }

    try {
      const currentPrice = parseFloat(formData.currentPrice.replace(/,/g, ''));

      if (editingAsset) {
        // Update existing asset
        await updateAssetMutation.mutateAsync({
          id: editingAsset.id,
          updates: {
            name: formData.name,
            symbol: formData.symbol,
            type: formData.type,
            currentPrice,
          },
        });
      } else {
        // Add new asset (with initial quantity 0, user will add transactions)
        await createAssetMutation.mutateAsync({
          name: formData.name,
          symbol: formData.symbol,
          type: formData.type,
          currentPrice,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('خطا در ذخیره دارایی');
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
            {editingAsset ? 'ویرایش دارایی' : 'دارایی جدید'}
          </div>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="نام دارایی (مثلاً: اپل، بیت‌کوین)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            required
          />

          <input
            placeholder="نماد (مثلاً: AAPL، BTC)"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            required
          />

          <div className="text-right text-gray-600 text-sm mb-1">نوع دارایی</div>
          <div className="-mx-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-4">
            {assetTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as Asset['type'] })}
                className={`shrink-0 rounded-pill px-4 py-2 text-sm ${
                  formData.type === type.value
                    ? 'bg-brand-blue text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <input
            placeholder="قیمت فعلی (تومان)"
            type="text"
            inputMode="numeric"
            value={formatNumber(formData.currentPrice)}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentPrice: e.target.value.replace(/,/g, ''),
              })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right"
            required
          />
          <div className="text-xs text-gray-500 -mt-2">
            پس از ایجاد دارایی، می‌توانید تراکنش‌های خرید و فروش را اضافه کنید
          </div>

          <button
            type="submit"
            className="w-full bg-brand-blue text-white rounded-xl py-3 font-medium"
          >
            {editingAsset ? 'ذخیره تغییرات' : 'افزودن دارایی'}
          </button>
        </form>
      </div>
    </div>
  );
}

