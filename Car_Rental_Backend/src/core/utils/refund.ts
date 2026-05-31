import {
  FULL_REFUND_MIN_HOURS,
  PARTIAL_REFUND_MIN_HOURS,
  PARTIAL_REFUND_PCT,
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

  if (hoursUntilPickup < PARTIAL_REFUND_MIN_HOURS) {
    return {
      policy:           'NONE',
      refundAmount:     0,
      keepAmount:       totalPaid,
      hoursUntilPickup,
    };
  }

  if (hoursUntilPickup < FULL_REFUND_MIN_HOURS) {
    const refundAmount =
      Math.round(totalPaid * PARTIAL_REFUND_PCT * 100) / 100;
    return {
      policy:           'PARTIAL',
      refundAmount,
      keepAmount:       totalPaid - refundAmount,
      hoursUntilPickup,
    };
  }

  return {
    policy:           'FULL',
    refundAmount:     totalPaid,
    keepAmount:       0,
    hoursUntilPickup,
  };
}