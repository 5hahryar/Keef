import jalaali from 'jalaali-js';

const persianMonths = [
    "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
    "مهر","آبان","آذر","دی","بهمن","اسفند"
  ];
  
  export default function formatShamsiDate(isoDate: string): string {
    const date = new Date(isoDate);
    const jDate = jalaali.toJalaali(date);
  
    const day = jDate.jd;
    const month = persianMonths[jDate.jm - 1]; // jm is 1-based
  
    // Convert digits to Persian
    const persianDigits = (n: number) =>
      n.toString().replace(/\d/g, d =>
        String.fromCharCode(parseInt(d) + 0x06f0)
      );
  
    return `${persianDigits(day)} ${month}`;
  }