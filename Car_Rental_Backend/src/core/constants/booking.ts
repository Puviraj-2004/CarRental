import { BookingStatus } from '@prisma/client';

export const BOOKING_STATUSES = BookingStatus;

export const MIN_BOOKING_DAYS = 1;
export const MAX_BOOKING_DAYS = 90;

export const RESERVATION_HOLD_MINUTES =
  parseInt(process.env.RESERVATION_HOLD_MINUTES || '60', 10);

export const PAYMENT_EXPIRY_HOURS =
  parseInt(process.env.PAYMENT_EXPIRY_HOURS || '24', 10);

export const CANCELLATION_WINDOW_HOURS =
  parseInt(process.env.CANCELLATION_WINDOW_HOURS || '24', 10);

// On-site verification document resubmission hold window (Step 3) [1.1.2]
export const DOCUMENT_RESUBMISSION_HOLD_MINUTES =
  parseInt(process.env.DOCUMENT_RESUBMISSION_HOLD_MINUTES || '30', 10);

// Configurable Hour Thresholds [1.1.2]
export const REFUND_TIER_FULL_HOURS =
  parseInt(process.env.REFUND_TIER_FULL_HOURS || '168', 10); // > 7 Days (168 hours)

export const REFUND_TIER_SEVENTY_FIVE_HOURS =
  parseInt(process.env.REFUND_TIER_SEVENTY_FIVE_HOURS || '72', 10); // 3 to 7 Days (72 to 168 hours)

export const REFUND_TIER_HALF_HOURS =
  parseInt(process.env.REFUND_TIER_HALF_HOURS || '24', 10); // 24 to 72 Hours (24 to 72 hours)

// Configurable Refund Percentages [1.1.2]
export const REFUND_PCT_FULL =
  parseFloat(process.env.REFUND_PCT_FULL || '1.0');

export const REFUND_PCT_SEVENTY_FIVE =
  parseFloat(process.env.REFUND_PCT_SEVENTY_FIVE || '0.75');

export const REFUND_PCT_HALF =
  parseFloat(process.env.REFUND_PCT_HALF || '0.50');

export const REFUND_PCT_NONE =
  parseFloat(process.env.REFUND_PCT_NONE || '0.0');