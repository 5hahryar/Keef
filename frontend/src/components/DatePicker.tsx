import { useState, useEffect } from 'react';
import jalaali from 'jalaali-js';
import { persianMonths, toPersianDigits } from '../utils/ShamsiDateUtils';

interface DatePickerProps {
  value: string; // ISO date string
  onChange: (isoDate: string) => void;
  placeholder?: string;
  useShortDisplayFormat?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = 'تاریخ را انتخاب کنید', useShortDisplayFormat = false }: DatePickerProps) {
  // Parse initial date or use current date
  const initialDate = value ? new Date(value) : new Date();
  const initialJDate = jalaali.toJalaali(initialDate);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(initialJDate.jy);
  const [selectedMonth, setSelectedMonth] = useState(initialJDate.jm);
  const [selectedDay, setSelectedDay] = useState(initialJDate.jd);

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const jDate = jalaali.toJalaali(date);
      setSelectedYear(jDate.jy);
      setSelectedMonth(jDate.jm);
      setSelectedDay(jDate.jd);
    }
  }, [value]);

  const getDaysInMonth = (year: number, month: number): number => {
    try {
      return jalaali.jalaaliMonthLength(year, month);
    } catch {
      return 31;
    }
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    try {
      const gregorian = jalaali.toGregorian(year, month, day);
      const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
      date.setHours(0, 0, 0, 0);
      onChange(date.toISOString());
      setIsOpen(false);
    } catch (error) {
      console.error('Error converting date:', error);
    }
  };

  const formatDisplayDate = (): string => {
    if (!value) return placeholder;
    try {
      const date = new Date(value);
      const jDate = jalaali.toJalaali(date);
      if(date.getUTCDate() == new Date().getUTCDate()) return 'امروز'
      if(useShortDisplayFormat) return `${toPersianDigits(jDate.jy)}/${toPersianDigits(jDate.jm)}/${toPersianDigits(jDate.jd)}`;
      return `${toPersianDigits(jDate.jd)} ${persianMonths[jDate.jm - 1]} ${toPersianDigits(jDate.jy)}`;
    } catch {
      return placeholder;
    }
  };

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  // Generate year options (current year ± 10 years)
  const currentYear = jalaali.toJalaali(new Date()).jy;
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-right bg-white"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplayDate()}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          {/* Modal */}
          <div className="relative z-50 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-center flex-1">انتخاب تاریخ</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-500 text-2xl w-8 h-8 flex items-center justify-center hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Year and Month Selectors */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block text-right">سال</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setSelectedYear(year);
                    // Adjust day if it exceeds days in month
                    const maxDays = getDaysInMonth(year, selectedMonth);
                    if (selectedDay > maxDays) {
                      setSelectedDay(maxDays);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center appearance-none bg-white"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {toPersianDigits(year)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block text-right">ماه</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const month = parseInt(e.target.value);
                    setSelectedMonth(month);
                    // Adjust day if it exceeds days in month
                    const maxDays = getDaysInMonth(selectedYear, month);
                    if (selectedDay > maxDays) {
                      setSelectedDay(maxDays);
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center appearance-none bg-white"
                >
                  {persianMonths.map((month, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day Grid */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block text-right">روز</label>
              <div className="grid grid-cols-7 gap-2">
                {daysArray.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(selectedYear, selectedMonth, day)}
                    className={`py-2 rounded-lg text-sm transition-colors ${
                      selectedDay === day
                        ? 'bg-brand-blue text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {toPersianDigits(day)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const jNow = jalaali.toJalaali(now);
                  handleDateSelect(jNow.jy, jNow.jm, jNow.jd);
                }}
                className="flex-1 py-2 text-sm text-brand-blue rounded-lg hover:bg-gray-50"
              >
                امروز
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

