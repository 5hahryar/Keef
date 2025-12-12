import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Asset, AssetTransaction } from '../types/portfolio';
import { useAssets, useDeleteAsset } from '../hooks/useAssets';
import { useAssetTransactions } from '../hooks/useAssetTransactions';
import AddAssetModal from '../components/AddAssetModal';
import AddAssetTransactionModal from '../components/AddAssetTransactionModal';
import TransactionDetailSheet from '../components/TransactionDetailSheet';

const toPersianDigits = (n: number): string => {
  return n.toString().replace(/\d/g, (d) => String.fromCharCode(parseInt(d) + 0x06f0));
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const getAssetTypeLabel = (type: Asset['type']): string => {
  const labels: Record<Asset['type'], string> = {
    stock: 'سهام',
    crypto: 'ارز دیجیتال',
    gold: 'طلا',
    currency: 'ارز',
    other: 'سایر',
  };
  return labels[type];
};

const getAssetTypeIcon = (type: Asset['type']): string => {
  const icons: Record<Asset['type'], string> = {
    stock: '📈',
    crypto: '₿',
    gold: '🥇',
    currency: '💱',
    other: '💼',
  };
  return icons[type];
};

type TabType = 'assets' | 'transactions';
type AssetViewType = 'list' | 'chart';

export default function Assets() {
  const [activeTab, setActiveTab] = useState<TabType>('assets');
  const [assetViewType, setAssetViewType] = useState<AssetViewType>('list');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<AssetTransaction | null>(null);

  // Fetch data from backend
  const { data: assets = [], isLoading: assetsLoading } = useAssets();
  const { data: transactions = [], isLoading: transactionsLoading } = useAssetTransactions();
  const deleteAssetMutation = useDeleteAsset();

  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('آیا از حذف این دارایی اطمینان دارید؟')) {
      deleteAssetMutation.mutate(id);
    }
  };

  const handleAddTransaction = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsTransactionModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAssetModalOpen(false);
    setIsTransactionModalOpen(false);
    setEditingAsset(null);
    setSelectedAsset(null);
  };

  const handleModalSuccess = () => {
    // Data will be refetched automatically by React Query
  };

  // Calculate totals
  // Note: currentPrice from backend is actually the average purchase price
  const totalCurrent = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);

  // Get asset name by ID
  const getAssetName = (assetId: string): string => {
    const asset = assets.find((a) => a.id === assetId);
    return asset ? `${asset.name} (${asset.symbol})` : 'نامشخص';
  };

  // Get asset color for chart
  const getAssetColor = (type: Asset['type']): string => {
    const colors: Record<Asset['type'], string> = {
      stock: '#3B82F6', // Blue
      crypto: '#F59E0B', // Orange
      gold: '#EAB308', // Yellow
      currency: '#10B981', // Green
      other: '#8B5CF6', // Purple
    };
    return colors[type] || '#6B7280';
  };

  // Prepare chart data for assets
  const chartData = useMemo(() => {
    return assets
      .map((asset) => {
        const value = asset.quantity * asset.currentPrice;
        return {
          name: asset.name,
          value,
          color: getAssetColor(asset.type),
          icon: getAssetTypeIcon(asset.type),
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleTransactionClick = (transaction: AssetTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="w-12" />
          <h1 className="text-xl font-semibold text-center flex-1">دارایی‌ها</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'assets'
              ? 'text-brand-blue border-b-2 border-brand-blue'
              : 'text-gray-500'
              }`}
          >
            دارایی‌ها
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 text-center font-medium ${activeTab === 'transactions'
              ? 'text-brand-blue border-b-2 border-brand-blue'
              : 'text-gray-500'
              }`}
          >
            تراکنش‌ها
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards - Only show on Assets tab */}
        {activeTab === 'assets' && (
          <>
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">کل سرمایه‌گذاری</div>
                <div className="text-xl font-bold">{formatCurrency(totalInvested)}</div>
                <div className="text-xs text-gray-400 mt-1">تومان</div>
              </div>

              <div className={`rounded-2xl p-4 shadow-sm ${totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-600 mb-1">سود/زیان</div>
                <div className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}
                  {formatCurrency(totalGainLoss)}
                </div>
                <div className={`text-xs mt-1 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLossPercent >= 0 ? '+' : ''}
                  {toPersianDigits(Math.round(totalGainLossPercent * 10) / 10)}%
                </div>
              </div>
            </div> */}

            {/* Total Assets Value */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 shadow-sm text-white">
              <div className="text-sm text-blue-100 mb-2">ارزش کل دارایی‌ها</div>
              <div className='flex gap-1'>
                <div className="text-3xl font-bold">{formatCurrency(totalCurrent)}</div>
                <div className="text-sm text-blue-100 mt-3">تومان</div>
              </div>
            </div>
          </>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <>
            {assets.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">💼</div>
                <div className="text-gray-600 mb-2">هنوز دارایی اضافه نکرده‌اید</div>
                <button
                  onClick={handleAddAsset}
                  className="mt-4 px-6 py-2 bg-brand-blue text-white rounded-xl"
                >
                  افزودن دارایی
                </button>
              </div>
            ) : assetsLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="animate-pulse text-gray-400">در حال بارگذاری...</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-semibold">دارایی‌های شما</h2>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setAssetViewType('list')}
                      className={`p-2 h-10 rounded-lg text-sm transition-colors ${assetViewType === 'list'
                        ? 'bg-white text-brand-blue shadow-sm'
                        : 'text-gray-600'
                        }`}
                    >
                      <span className="material-symbols-rounded">list</span>
                    </button>
                    <button
                      onClick={() => setAssetViewType('chart')}
                      className={`p-2 h-10 rounded-lg text-sm transition-colors ${assetViewType === 'chart'
                        ? 'bg-white text-brand-blue shadow-sm'
                        : 'text-gray-600'
                        }`}
                    >
                      <span className="material-symbols-rounded">donut_large</span>
                    </button>
                  </div>
                </div>

                {assetViewType === 'chart' && chartData.length > 0 ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-xs mb-4">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              startAngle={90}
                              endAngle={-270}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-sm text-gray-500 mb-1">ارزش کل</div>
                        <div className="text-2xl font-bold">{formatCurrency(chartTotal)}</div>
                        <div className="text-xs text-gray-400">تومان</div>
                      </div>
                      <div className="w-full grid grid-cols-1 gap-2 text-sm">
                        {chartData.map((item, index) => {
                          const percentage = chartTotal > 0 ? Math.round((item.value / chartTotal) * 100) : 0;
                          return (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <span className="text-xl">{item.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">
                                  {formatCurrency(item.value)} تومان
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-gray-600 font-medium">{toPersianDigits(percentage)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : assetViewType === 'chart' && chartData.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                    <div className="text-6xl mb-4">📊</div>
                    <div className="text-gray-600">هیچ دارایی برای نمایش وجود ندارد</div>
                  </div>
                ) : (
                  <>
                    {assets.map((asset) => {
                      // currentPrice from backend is the average purchase price
                      const currentValue = asset.quantity * asset.currentPrice;
                      const investedValue = asset.quantity * asset.currentPrice;
                      const gainLoss = currentValue - investedValue;
                      const gainLossPercent = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

                      return (
                        <div key={asset.id} className="bg-white rounded-2xl p-4 shadow-sm">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-3xl">{getAssetTypeIcon(asset.type)}</div>
                              <div className="flex-1">
                                <div className="font-semibold text-lg">{asset.name}</div>
                                <div className="text-sm text-gray-500">
                                  {asset.symbol} • {getAssetTypeLabel(asset.type)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddTransaction(asset)}
                                className="p-2 text-green-600 hover:text-green-700"
                                title="افزودن تراکنش"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditAsset(asset)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-2 text-gray-400 hover:text-red-600"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-500">تعداد</div>
                              <div className="font-semibold">{formatCurrency(asset.quantity)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">قیمت فعلی</div>
                              <div className="font-semibold">{formatCurrency(asset.currentPrice)}</div>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">ارزش فعلی</span>
                              <span className="font-bold text-lg">{formatCurrency(currentValue)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">سود/زیان</span>
                              <span
                                className={`text-sm font-semibold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}
                              >
                                {gainLoss >= 0 ? '+' : ''}
                                {formatCurrency(gainLoss)} ({gainLossPercent >= 0 ? '+' : ''}
                                {toPersianDigits(Math.round(gainLossPercent * 10) / 10)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {transactionsLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="animate-pulse text-gray-400">در حال بارگذاری...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">📋</div>
                <div className="text-gray-600 mb-2">هنوز تراکنشی ثبت نشده است</div>
                <div className="text-sm text-gray-500">
                  برای افزودن تراکنش، به تب دارایی‌ها بروید
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold px-2">تاریخچه تراکنش‌ها</h2>
                {transactions.map((transaction) => {
                  const totalValue = transaction.quantity * transaction.price;
                  const asset = assets.find((a) => a.id === transaction.assetId);

                  // Calculate profit/loss
                  let profitLoss = 0;
                  let profitLossPercent = 0;
                  if (asset) {
                    if (transaction.type === 'buy') {
                      // For buy: unrealized gain/loss = (current price - purchase price) * quantity
                      // Note: currentPrice from backend is the average purchase price
                      // We'll use transaction.price as the purchase price for this specific transaction
                      const priceDiff = asset.currentPrice - transaction.price;
                      profitLoss = priceDiff * transaction.quantity;
                      profitLossPercent = transaction.price > 0 ? (priceDiff / transaction.price) * 100 : 0;
                    } else {
                      // For sell: realized gain/loss = (sell price - average purchase price) * quantity
                      const priceDiff = transaction.price - asset.currentPrice;
                      profitLoss = priceDiff * transaction.quantity;
                      profitLossPercent = asset.currentPrice > 0 ? (priceDiff / asset.currentPrice) * 100 : 0;
                    }
                  }

                  return (
                    <div
                      key={transaction.id}
                      onClick={() => handleTransactionClick(transaction)}
                      className={`bg-white rounded-2xl p-4 shadow-sm border-r-4 cursor-pointer hover:shadow-md transition-shadow ${transaction.type === 'buy' ? 'border-green-500' : 'border-red-500'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{getAssetName(transaction.assetId)}</span>
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === 'buy'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {transaction.type === 'buy' ? 'خرید' : 'فروش'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-xs text-gray-500">تعداد</div>
                          <div className="font-semibold">{formatCurrency(transaction.quantity)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">قیمت واحد</div>
                          <div className="font-semibold">{formatCurrency(transaction.price)}</div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">مبلغ کل</span>
                          <span className="font-bold text-lg">{formatCurrency(totalValue)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {transaction.type === 'buy' ? 'سود/زیان تحقق یافته' : 'سود/زیان'}
                          </span>
                          <span
                            className={`text-sm font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {profitLoss >= 0 ? '+' : ''}
                            {formatCurrency(profitLoss)} ({profitLossPercent >= 0 ? '+' : ''}
                            {toPersianDigits(Math.round(profitLossPercent * 10) / 10)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isAssetModalOpen && (
        <AddAssetModal
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          editingAsset={editingAsset}
        />
      )}

      {isTransactionModalOpen && selectedAsset && (
        <AddAssetTransactionModal
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          asset={selectedAsset}
        />
      )}

      {/* Transaction Detail Sheet */}
      {isTransactionDetailOpen && selectedTransaction && (
        <TransactionDetailSheet
          isOpen={isTransactionDetailOpen}
          onClose={() => {
            setIsTransactionDetailOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          asset={assets.find((a) => a.id === selectedTransaction.assetId) || null}
        />
      )}

      {/* Floating Action Button - fixed at bottom right, outside scrollable container */}
      {activeTab === 'assets' && (
        <button
          onClick={(e) => {
            const t = e.currentTarget as HTMLButtonElement;
            const r = t.getBoundingClientRect();
            t.style.setProperty('--x', `${e.clientX - r.left}px`);
            t.style.setProperty('--y', `${e.clientY - r.top}px`);
            handleAddAsset();
          }}
          className="fixed right-6 h-16 w-16 rounded-2xl bg-brand-blue text-white shadow-lg text-3xl flex items-center justify-center btn btn-ripple"
          style={{
            position: 'fixed',
            right: '1.5rem',
            bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
          }}
          aria-label="add asset"
        >
          +
        </button>
      )}
    </div>
  );
}
