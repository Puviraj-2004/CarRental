export const DEFAULT_CURRENCY = 'EUR';

export function formatMoney(
  value: number,
  options: {
    currency?: string;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  } = {}
): string {
  const {
    currency = DEFAULT_CURRENCY,
    maximumFractionDigits = 2,
    minimumFractionDigits,
  } = options;

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits,
    ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
  }).format(value);
}

export function formatMoneyAmount(value: number, currency = DEFAULT_CURRENCY): string {
  return `${value.toFixed(2)} ${currency}`;
}
