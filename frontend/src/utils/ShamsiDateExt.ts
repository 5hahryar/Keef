import jalaali from 'jalaali-js';

export default function getShamsiMonthRange() {
  const now = new Date();

  // Convert current Gregorian date to Jalaali
  const jDate = jalaali.toJalaali(now);

  // Start of Shamsi month
  const startOfMonth = jalaali.toGregorian(jDate.jy, jDate.jm, 1);
  const startDate = new Date(startOfMonth.gy, startOfMonth.gm - 1, startOfMonth.gd);
  startDate.setHours(0, 0, 0, 0);

  // End of Shamsi month
  // Get length of the current Shamsi month
  const daysInMonth = jalaali.jalaaliMonthLength(jDate.jy, jDate.jm);
  const endOfMonth = jalaali.toGregorian(jDate.jy, jDate.jm, daysInMonth);
  const endDate = new Date(endOfMonth.gy, endOfMonth.gm - 1, endOfMonth.gd);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}
