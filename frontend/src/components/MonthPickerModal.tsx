import { persianMonths, toPersianDigits } from '../utils/ShamsiDateUtils';

interface MonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  selectedMonth: number;
  onSelect: (year: number, month: number) => void;
}

export default function MonthPickerModal({
  isOpen,
  onClose,
  selectedYear,
  selectedMonth,
  onSelect,
}: MonthPickerModalProps) {
  if (!isOpen) return null;

  const handleYearChange = (delta: number) => {
    onSelect(selectedYear + delta, selectedMonth);
  };

  const handleMonthSelect = (month: number) => {
    onSelect(selectedYear, month);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-4 py-3">
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl hover:text-gray-800"
          >
            ×
          </button>
          <h2 className="text-lg font-semibold text-center flex-1">انتخاب ماه</h2>
          <div className="w-8" />
        </div>

        <div className="p-4">
          {/* Year Selector */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => handleYearChange(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="mx-4 text-xl font-semibold">{toPersianDigits(selectedYear)}</span>
            <button
              onClick={() => handleYearChange(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 gap-3">
            {persianMonths.map((month, index) => {
              const monthNumber = index + 1;
              const isSelected = monthNumber === selectedMonth;

              return (
                <button
                  key={monthNumber}
                  onClick={() => handleMonthSelect(monthNumber)}
                  className={`p-4 rounded-xl text-center transition-colors ${isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

