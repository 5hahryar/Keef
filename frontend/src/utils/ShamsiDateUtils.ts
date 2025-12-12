import jalaali from 'jalaali-js';

export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function toPersianDigits(n: number): string {
  return n.toString().replace(/\d/g, d => String.fromCharCode(parseInt(d) + 0x06f0));
}

export function getShamsiMonthRange(year: number, month: number): { startDate: Date; endDate: Date } {
  // Start of Shamsi month
  const startOfMonth = jalaali.toGregorian(year, month, 1);
  const startDate = new Date(startOfMonth.gy, startOfMonth.gm - 1, startOfMonth.gd);
  startDate.setHours(0, 0, 0, 0);

  // End of Shamsi month
  const daysInMonth = jalaali.jalaaliMonthLength(year, month);
  const endOfMonth = jalaali.toGregorian(year, month, daysInMonth);
  const endDate = new Date(endOfMonth.gy, endOfMonth.gm - 1, endOfMonth.gd);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export function getShamsiYearRange(year: number): { startDate: Date; endDate: Date } {
  // Start of Shamsi year (Farvardin 1)
  const startOfYear = jalaali.toGregorian(year, 1, 1);
  const startDate = new Date(startOfYear.gy, startOfYear.gm - 1, startOfYear.gd);
  startDate.setHours(0, 0, 0, 0);

  // End of Shamsi year (Esfand last day)
  const daysInLastMonth = jalaali.jalaaliMonthLength(year, 12);
  const endOfYear = jalaali.toGregorian(year, 12, daysInLastMonth);
  const endDate = new Date(endOfYear.gy, endOfYear.gm - 1, endOfYear.gd);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

export function getCurrentShamsiDate(): { year: number; month: number } {
  const now = new Date();
  const jDate = jalaali.toJalaali(now);
  return { year: jDate.jy, month: jDate.jm };
}

export function formatShamsiMonthYear(year: number, month: number): string {
  return `${persianMonths[month - 1]} ${toPersianDigits(year)}`;
}

export function formatShamsiYear(year: number): string {
  return toPersianDigits(year);
}

export function dateToRFC3339(date: Date): string {
  return date.toISOString();
}

