/**
 * Refund Policy Calculator
 * Calculates refund amounts based on cancellation timing
 */

export type RefundPolicy = 'FULL' | 'PARTIAL' | 'NONE';

export interface RefundInfo {
  policy: RefundPolicy;
  refundAmount: number;
  keepAmount: number;
  hoursUntilPickup: number;
  policyDescription: string;
  reason: string;
}

// Refund tiers (in hours before pickup)
const FULL_REFUND_HOURS = 168; // > 7 days
const PARTIAL_75_HOURS = 72;   // 3 to 7 days (75% refund)
const PARTIAL_50_HOURS = 24;   // 24 to 72 hours (50% refund)
// Less than 24 hours = NO refund

export function calculateRefund(totalPaid: number, pickupDate: Date): RefundInfo {
  const now = new Date();
  const hoursUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // 1. Less than 24 hours: No refund (0%)
  if (hoursUntilPickup < PARTIAL_50_HOURS) {
    return {
      policy: 'NONE',
      refundAmount: 0,
      keepAmount: totalPaid,
      hoursUntilPickup: Math.max(0, hoursUntilPickup),
      policyDescription: 'No Refund',
      reason: `Cancellation within 24 hours of pickup is non-refundable. ${Math.round(hoursUntilPickup)} hours remaining.`,
    };
  }

  // 2. Between 24 and 72 hours: 50% refund
  if (hoursUntilPickup < PARTIAL_75_HOURS) {
    const refundAmount = Math.round(totalPaid * 0.5 * 100) / 100;
    return {
      policy: 'PARTIAL',
      refundAmount,
      keepAmount: Math.round((totalPaid - refundAmount) * 100) / 100,
      hoursUntilPickup,
      policyDescription: '50% Refund',
      reason: `Cancellation within 24-72 hours of pickup qualifies for 50% refund. ${Math.round(hoursUntilPickup)} hours remaining.`,
    };
  }

  // 3. Between 3 days (72 hours) and 7 days (168 hours): 75% refund
  if (hoursUntilPickup < FULL_REFUND_HOURS) {
    const refundAmount = Math.round(totalPaid * 0.75 * 100) / 100;
    return {
      policy: 'PARTIAL',
      refundAmount,
      keepAmount: Math.round((totalPaid - refundAmount) * 100) / 100,
      hoursUntilPickup,
      policyDescription: '75% Refund',
      reason: `Cancellation 3-7 days before pickup qualifies for 75% refund. ${Math.round(hoursUntilPickup)} hours remaining.`,
    };
  }

  // 4. More than 7 days (168+ hours): 100% refund
  const refundAmount = totalPaid;
  return {
    policy: 'FULL',
    refundAmount,
    keepAmount: 0,
    hoursUntilPickup,
    policyDescription: 'Full Refund',
    reason: `Cancellation more than 7 days before pickup qualifies for full refund. ${Math.round(hoursUntilPickup)} hours remaining.`,
  };
}
