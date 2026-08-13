import * as jalaali from 'jalaali-js';

export function generateInstallmentDueDates(
  dueDayNumber: number,
  numInstallments: number,
  firstPaymentDate?: Date,
): Date[] {
  const dates: Date[] = [];
  let year: number;
  let month: number;

  if (firstPaymentDate) {
    const persian = jalaali.toJalaali(
      firstPaymentDate.getFullYear(),
      firstPaymentDate.getMonth() + 1,
      firstPaymentDate.getDate(),
    );
    year = persian.jy;
    month = persian.jm;
  } else {
    const now = new Date();
    const persian = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    year = persian.jy;
    month = persian.jm + 1;
  }

  for (let i = 0; i < numInstallments; i++) {
    while (month > 12) {
      month -= 12;
      year += 1;
    }

    const gregorian = jalaali.toGregorian(year, month, dueDayNumber);
    dates.push(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    month += 1;
  }

  return dates;
}
