import { Prisma } from '@prisma/client';
import { env } from '../../config/env';

// Reuse a single Intl formatter instance — creating one per call is expensive.
const currencyFormatter = new Intl.NumberFormat(env.appLocale, {
  style:                 'currency',
  currency:              env.appCurrency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Convert a number or string to a Prisma Decimal for DB storage. */
export const toDecimal = (value: number | string): Prisma.Decimal =>
  new Prisma.Decimal(value);

/**
 * Format a Decimal or number as a localised currency string.
 * Uses APP_LOCALE (fr-FR) and APP_CURRENCY (EUR) from env.
 * e.g. 1234.5 → "1 234,50 €"
 */
export const formatMoney = (value: Prisma.Decimal | number): string => {
  const numeric = value instanceof Prisma.Decimal ? value.toNumber() : value;
  return currencyFormatter.format(numeric);
};

/** Round a number to two decimal places (banker's rounding via Decimal). */
export const roundToTwoDecimals = (value: number): number =>
  new Prisma.Decimal(value).toDecimalPlaces(2).toNumber();

/** Add two monetary values, returns a Decimal. */
export const addMoney = (
  a: Prisma.Decimal | number,
  b: Prisma.Decimal | number,
): Prisma.Decimal =>
  new Prisma.Decimal(a.toString()).add(new Prisma.Decimal(b.toString()));

/** Subtract b from a, returns a Decimal. */
export const subtractMoney = (
  a: Prisma.Decimal | number,
  b: Prisma.Decimal | number,
): Prisma.Decimal =>
  new Prisma.Decimal(a.toString()).sub(new Prisma.Decimal(b.toString()));

/** Multiply a monetary value by a scalar, returns a Decimal. */
export const multiplyMoney = (
  value: Prisma.Decimal | number,
  scalar: number,
): Prisma.Decimal =>
  new Prisma.Decimal(value.toString()).mul(scalar);

// ─── Date helpers (France timezone) ──────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat(env.appLocale, {
  timeZone:    env.appTimezone,
  day:         '2-digit',
  month:       '2-digit',
  year:        'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat(env.appLocale, {
  timeZone: env.appTimezone,
  day:      '2-digit',
  month:    '2-digit',
  year:     'numeric',
  hour:     '2-digit',
  minute:   '2-digit',
});

/**
 * Format a date as DD/MM/YYYY in the France timezone.
 * e.g. new Date('2026-05-14T22:00:00Z') → "15/05/2026"
 */
export const formatDate = (date: Date): string =>
  dateFormatter.format(date);

/**
 * Format a date as DD/MM/YYYY HH:MM in the France timezone.
 * e.g. → "15/05/2026 00:00"
 */
export const formatDateTime = (date: Date): string =>
  dateTimeFormatter.format(date);
