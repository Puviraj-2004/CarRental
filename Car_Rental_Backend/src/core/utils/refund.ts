import {
  REFUND_TIER_FULL_HOURS,
  REFUND_TIER_SEVENTY_FIVE_HOURS,
  REFUND_TIER_HALF_HOURS,
  REFUND_PCT_FULL,
  REFUND_PCT_SEVENTY_FIVE,
  REFUND_PCT_HALF,
  REFUND_PCT_NONE,
} from '../constants/booking';

export type RefundPolicy = 'FULL' | 'PARTIAL' | 'NONE';

export interface RefundCalculation {
  policy:           RefundPolicy;
  refundAmount:     number;
  keepAmount:       number;
  hoursUntilPickup: number;
}

export function calculateRefund(
  totalPaid:  number,
  pickupDate: Date,
): RefundCalculation {
  const hoursUntilPickup =
    (pickupDate.getTime() - Date.now()) / (1000 * 60 * 60);

  // 1. Less than 24 hours: No refund (0%) [1.1.2]
  if (hoursUntilPickup < REFUND_TIER_HALF_HOURS) {
    const refundAmount = Math.round(totalPaid * REFUND_PCT_NONE * 100) / 100;
    return {
      policy:           'NONE',
      refundAmount,
      keepAmount:       Math.round((totalPaid - refundAmount) * 100) / 100,
      hoursUntilPickup,
    };
  }

  // 2. Between 24 and 72 hours: 50% refund [1.1.2]
  if (hoursUntilPickup < REFUND_TIER_SEVENTY_FIVE_HOURS) {
    const refundAmount = Math.round(totalPaid * REFUND_PCT_HALF * 100) / 100;
    return {
      policy:           'PARTIAL',
      refundAmount,
      keepAmount:       Math.round((totalPaid - refundAmount) * 100) / 100,
      hoursUntilPickup,
    };
  }

  // 3. Between 3 days (72 hours) and 7 days (168 hours): 75% refund [1.1.2]
  if (hoursUntilPickup < REFUND_TIER_FULL_HOURS) {
    const refundAmount = Math.round(totalPaid * REFUND_PCT_SEVENTY_FIVE * 100) / 100;
    return {
      policy:           'PARTIAL',
      refundAmount,
      keepAmount:       Math.round((totalPaid - refundAmount) * 100) / 100,
      hoursUntilPickup,
    };
  }

  // 4. More than 7 days (168+ hours): 100% refund [1.1.2]
  const refundAmount = Math.round(totalPaid * REFUND_PCT_FULL * 100) / 100;
  return {
    policy:           'FULL',
    refundAmount,
    keepAmount:       Math.round((totalPaid - refundAmount) * 100) / 100,
    hoursUntilPickup,
  };
}