const UNITS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanOneThousand(n) {
  let current = '';

  if (n >= 100) {
    current += UNITS[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }

  if (n >= 20) {
    current += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }

  if (n > 0) {
    current += UNITS[n] + ' ';
  }

  return current.trim();
}

function convertNumberToWords(n) {
  if (n === 0) return 'Zero';

  let words = '';

  const crores = Math.floor(n / 10000000);
  let remainder = n % 10000000;

  if (crores > 0) {
    words += convertNumberToWords(crores) + ' Crore ';
  }

  const lakhs = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  if (lakhs > 0) {
    words += convertLessThanOneThousand(lakhs) + ' Lakh ';
  }

  const thousands = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (thousands > 0) {
    words += convertLessThanOneThousand(thousands) + ' Thousand ';
  }

  if (remainder > 0) {
    words += convertLessThanOneThousand(remainder) + ' ';
  }

  return words.replace(/\s+/g, ' ').trim();
}

export function convertToIndianCurrencyWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount) || amount === '') {
    return '';
  }

  const num = Number(amount);
  if (num <= 0) return 'Zero Rupees Only';

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = '';

  if (rupees > 0) {
    result += convertNumberToWords(rupees) + ' Rupees';
  }

  if (paise > 0) {
    if (rupees > 0) {
      result += ' and ';
    }
    result += convertLessThanOneThousand(paise) + ' Paise';
  }

  result += ' Only';
  return result.trim();
}
