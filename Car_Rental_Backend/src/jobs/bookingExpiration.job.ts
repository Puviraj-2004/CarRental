import { BookingStatus } from '@prisma/client';
import prisma from '../prisma/client';
import logger from '../config/logger';

/**
 * Expire RESERVED bookings whose startDate has passed without confirmation.
 * Run this on a schedule (e.g. every 15 minutes via cron or node-cron).
 */
export async function runBookingExpirationJob(): Promise<void> {
  const now = new Date();

  const expired = await prisma.booking.updateMany({
    where: {
      status:    BookingStatus.RESERVED,
      startDate: { lt: now },
    },
    data: { status: BookingStatus.CANCELLED },
  });

  if (expired.count > 0) {
    logger.info('Booking expiration job: expired bookings', { count: expired.count });
  }
}
