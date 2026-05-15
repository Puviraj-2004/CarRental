import { PaymentStatus } from '@prisma/client';
import prisma from '../prisma/client';
import logger from '../config/logger';

/**
 * Mark old PENDING payments as FAILED after 24 hours.
 * Run this on a schedule (e.g. every hour via cron or node-cron).
 */
export async function runPaymentCleanupJob(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const cleaned = await prisma.payment.updateMany({
    where: {
      status:    PaymentStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    data: { status: PaymentStatus.FAILED },
  });

  if (cleaned.count > 0) {
    logger.info('Payment cleanup job: marked payments as FAILED', { count: cleaned.count });
  }
}
