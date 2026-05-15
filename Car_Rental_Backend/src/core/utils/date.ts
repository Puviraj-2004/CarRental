import { env } from '../../config/env';

const dateFormatter = new Intl.DateTimeFormat(env.appLocale, {
  timeZone: env.appTimezone,
  day:      '2-digit',
  month:    '2-digit',
  year:     'numeric',
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
 * Format a date as DD/MM/YYYY in the app timezone (Europe/Paris).
 * e.g. new Date('2026-05-14T22:00:00Z') → "15/05/2026"
 */
export const formatDate = (date: Date): string =>
  dateFormatter.format(date);

/**
 * Format a date as DD/MM/YYYY HH:MM in the app timezone (Europe/Paris).
 * e.g. → "15/05/2026 00:00"
 */
export const formatDateTime = (date: Date): string =>
  dateTimeFormatter.format(date);

/**
 * Return the difference in calendar days between two dates (floor).
 * Positive when end is after start.
 */
export const daysBetween = (start: Date, end: Date): number =>
  Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

/** Add N days to a date (returns a new Date, does not mutate). */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Return true if the date is in the past (before now). */
export const isPast = (date: Date): boolean =>
  date.getTime() < Date.now();

/** Return true if the date is in the future (after now). */
export const isFuture = (date: Date): boolean =>
  date.getTime() > Date.now();
