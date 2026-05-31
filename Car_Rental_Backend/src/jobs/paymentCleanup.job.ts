import { PaymentStatus }       from '@prisma/client';
import { prisma }              from '../config/database';
import { PAYMENT_EXPIRY_HOURS } from '../core/constants/booking';
import logger                  from '../config/logger';

export async function runPaymentCleanupJob(): Promise<void> {
  const cutoff = new Date(
    Date.now() - PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  const cleaned = await prisma.payment.updateMany({
    where: {
      status:    PaymentStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    data: { status: PaymentStatus.FAILED },
  });

  if (cleaned.count > 0) {
    logger.info('PaymentCleanup: marked payments as FAILED', {
      count:            cleaned.count,
      expiryHours:      PAYMENT_EXPIRY_HOURS,
    });
  }
}