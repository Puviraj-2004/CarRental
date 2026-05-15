import { BookingStatus } from '@prisma/client';

export const BOOKING_STATUSES = BookingStatus;

/** Hours before pickup within which a cancellation is still allowed. */
export const CANCELLATION_WINDOW_HOURS = 24;

/** Minimum booking duration in days. */
export const MIN_BOOKING_DAYS = 1;

/** Maximum booking duration in days. */
export const MAX_BOOKING_DAYS = 90;
