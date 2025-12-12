import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useSpendingByCategory, useTotalSpending, useTransactionCount } from '../hooks/useStats';
import {
  getShamsiMonthRange,
  getShamsiYearRange,
  getCurrentShamsiDate,
  formatShamsiMonthYear,
  formatShamsiYear,
  dateToRFC3339,
  toPersianDigits,
} from '../utils/ShamsiDateUtils';
import { getCategoryConfig } from '../utils/CategoryConfig';
import MonthPickerModal from '../components/MonthPickerModal';

type ViewMode = 'monthly' | 'yearly';

export default function Stats() {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState(() => getCurrentShamsiDate().year);
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentShamsiDate().month);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'monthly') {
      return getShamsiMonthRange(selectedYear, selectedMonth);
    } else {
      return getShamsiYearRange(selectedYear);
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const startDate = dateToRFC3339(dateRange.startDate);
  const endDate = dateToRFC3339(dateRange.endDate);

  // Fetch data
  const { data: categoryData = [], isLoading: categoriesLoading } = useSpendingByCategory({
    startDate,
    endDate,
  });
  const { data: totalSpending = 0, isLoading: totalLoading } = useTotalSpending({
    startDate,
    endDate,
  });
  const { data: transactionCount = 0, isLoading: countLoading } = useTransactionCount({
    startDate,
    endDate,
  });

  const isLoading = categoriesLoading || totalLoading || countLoading;

  // Calculate average transaction
  const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

  // Prepare chart data
  const chartData = useMemo(() => {
    return categoryData
      .map((item) => {
        const config = getCategoryConfig(item.name);
        return {
          name: config.persianName,
          value: item.total,
          color: config.color,
          transactionCount: item.transaction_count,
          categoryName: item.name, // Keep original name for lookup
          icon: config.icon,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [categoryData]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Handle year navigation
  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          {/* Placeholder for balance */}
          <div className="w-12" />

          {/* Title */}
          <h1 className="text-xl font-semibold text-center flex-1 ">آمار</h1>

          {/* Toggle Button */}
          <button
            onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
            className={`px-2 py-2 rounded-lg text-sm font-medium text-brand-blue`}
          >
            {viewMode === 'monthly' ? 'ماهانه' : 'سالانه'}
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Month/Year Selector */}
        {viewMode === 'monthly' ? (
          <div className="bg-white rounded-2xl p-2 shadow-sm">
            {/* <div className="text-sm text-gray-600 mb-3">ماه انتخابی</div> */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="text-m font-medium">
                <button
                  onClick={() => setIsMonthPickerOpen(true)}
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center gap-2"
                >{formatShamsiMonthYear(selectedYear, selectedMonth)}</button>

              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            {/* <button
              onClick={() => setIsMonthPickerOpen(true)}
              className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              انتخاب ماه دیگر
            </button> */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-2 shadow-sm">
            {/* <div className="text-sm text-gray-600 mb-3">سال انتخابی</div> */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousYear}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="text-m font-medium">
                <button
                  onClick={handlePreviousYear}
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center gap-2"
                >{formatShamsiYear(selectedYear)}</button>

              </div>
              {/* <div className="text-xl font-bold">{formatShamsiYear(selectedYear)}</div> */}
              <button
                onClick={handleNextYear}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Expenses Card */}
          <div className="bg-blue-500 rounded-2xl p-4 shadow-sm text-white">
            <div className="flex items-center justify-between mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-xs text-blue-100 mb-1">کل هزینه ها</div>
            <div className="text-xl font-bold">
              {formatCurrency(totalSpending)}
            </div>
            <div className="text-l font-bold">
              تومان
            </div>
          </div>

          {/* Average Transaction Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {toPersianDigits(transactionCount)} تراکنش
              </span>
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-xs text-gray-500 mb-1">میانگین تراکنش</div>
            <div className="text-xl font-bold">
              {formatCurrency(averageTransaction)}
            </div>
            <div className="text-l font-bold">
              تومان
            </div>
          </div>


        </div>

        {/* Expense Distribution Chart */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">در حال بارگذاری...</div>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">توزیع هزینه ها</h2>
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
                <div className="text-sm text-gray-500 mb-1">مجموع</div>
                <div className="text-2xl font-bold">{formatCurrency(total)}</div>
                <div className="text-xs text-gray-400">تومان</div>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 text-sm">
                {chartData.map((item, index) => {
                  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-gray-500 mr-auto">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-gray-500">
            داده‌ای برای نمایش وجود ندارد
          </div>
        )}

        {/* Category Details */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">جزئیات دسته بندی</h2>
            <div className="space-y-4">
              {chartData.map((item, index) => {
                const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="">{item.name}</span>
                        <span className="text-l font-semibold">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {toPersianDigits(item.transactionCount)} تراکنش
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{toPersianDigits(percentage)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Month Picker Modal */}
      <MonthPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelect={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
        }}
      />
    </div>
  );
}
