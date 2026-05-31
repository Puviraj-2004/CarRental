import { BookingStatus } from '@prisma/client';

export const BOOKING_STATUSES = BookingStatus;

export const MIN_BOOKING_DAYS = 1;
export const MAX_BOOKING_DAYS = 90;

export const RESERVATION_HOLD_MINUTES =
  parseInt(process.env.RESERVATION_HOLD_MINUTES || '30', 10);

export const PAYMENT_EXPIRY_HOURS =
  parseInt(process.env.PAYMENT_EXPIRY_HOURS || '24', 10);

export const CANCELLATION_WINDOW_HOURS =
  parseInt(process.env.CANCELLATION_WINDOW_HOURS || '24', 10);

export const FULL_REFUND_MIN_HOURS =
  parseInt(process.env.FULL_REFUND_MIN_HOURS || '72', 10);

export const PARTIAL_REFUND_MIN_HOURS =
  parseInt(process.env.PARTIAL_REFUND_MIN_HOURS || '24', 10);

export const PARTIAL_REFUND_PCT =
  parseFloat(process.env.PARTIAL_REFUND_PCT || '0.80');