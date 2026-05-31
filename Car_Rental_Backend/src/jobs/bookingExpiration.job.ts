import { BookingStatus, PaymentStatus } from '@prisma/client';
import { prisma }                        from '../config/database';
import { RESERVATION_HOLD_MINUTES }      from '../core/constants/booking';
import logger                            from '../config/logger';

export async function runBookingExpirationJob(): Promise<void> {
  const now     = new Date();
  const cutoff  = new Date(now.getTime() - RESERVATION_HOLD_MINUTES * 60 * 1000);

  // ── Condition 1 — start date passed ───────────────────────────────────────
  // RESERVED or CONFIRMED bookings whose rental start date is in the past.
  // These are no-shows or bookings that were never acted upon.
  const noShows = await prisma.booking.updateMany({
    where: {
      status:    { in: [BookingStatus.RESERVED, BookingStatus.CONFIRMED] },
      startDate: { lt: now },
    },
    data: { status: BookingStatus.CANCELLED },
  });

  if (noShows.count > 0) {
    logger.info('BookingExpiration: cancelled no-show bookings', {
      count: noShows.count,
    });
  }

  // ── Condition 2 — hold expired without payment ────────────────────────────
  // RESERVED bookings older than RESERVATION_HOLD_MINUTES with no completed
  // payment. User did not pay or upload documents in time.
  const unpaid = await prisma.booking.updateMany({
    where: {
      status:    BookingStatus.RESERVED,
      createdAt: { lt: cutoff },
      OR: [
        { payment: null },
        { payment: { status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } } },
      ],
    },
    data: { status: BookingStatus.CANCELLED },
  });

  if (unpaid.count > 0) {
    logger.info('BookingExpiration: cancelled unpaid reservations', {
      count:       unpaid.count,
      holdMinutes: RESERVATION_HOLD_MINUTES,
    });
  }
}