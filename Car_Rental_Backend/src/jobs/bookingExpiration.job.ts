import { BookingStatus, PaymentStatus, CarStatus, BookingType } from '@prisma/client';
import { prisma }                        from '../config/database';
import { RESERVATION_HOLD_MINUTES }      from '../core/constants/booking';
import logger                            from '../config/logger';

export async function runBookingExpirationJob(): Promise<void> {
  const now     = new Date();
  const cutoff  = new Date(now.getTime() - RESERVATION_HOLD_MINUTES * 60 * 1000);

  // ── Condition 1 — start date passed for unpaid reservations ────────────────
  // Only RESERVED bookings whose start date has passed are no-shows.
  // CONFIRMED bookings past start date are active rentals awaiting handover
  // and should NOT be cancelled automatically.
  const noShows = await prisma.booking.updateMany({
    where: {
      status:    BookingStatus.RESERVED,
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
  const incompleteReservations = await prisma.booking.updateMany({
    where: {
      status:    BookingStatus.RESERVED,
      type:      BookingType.RENTAL,
      createdAt: { lt: cutoff },
      documentReuploadDeadline: null,
      OR: [
        { payment: null },
        { payment: { status: { in: [PaymentStatus.PENDING, PaymentStatus.FAILED] } } },
        { documents: null },
        { documents: { status: { not: 'APPROVED' } } },
      ],
    },
    data: { status: BookingStatus.EXPIRED },
  });

  if (incompleteReservations.count > 0) {
    logger.info('BookingExpiration: expired incomplete rental reservations', {
      count:       incompleteReservations.count,
      holdMinutes: RESERVATION_HOLD_MINUTES,
    });
  }

  // ── Condition 2b — rejected documents not reuploaded before deadline ───────
  const expiredDocumentReuploads = await prisma.booking.updateMany({
    where: {
      status: { in: [BookingStatus.RESERVED, BookingStatus.CONFIRMED] },
      type: BookingType.RENTAL,
      documentId: null,
      documentRejectedAt: { not: null },
      documentReuploadDeadline: { lt: now },
    },
    data: { status: BookingStatus.EXPIRED },
  });

  if (expiredDocumentReuploads.count > 0) {
    logger.info('BookingExpiration: expired bookings after document reupload deadline', {
      count: expiredDocumentReuploads.count,
    });
  }

  // ── Condition 3 — end date passed for confirmed bookings (never picked up) ──
  // CONFIRMED bookings whose endDate has passed without transitioning to ONGOING
  // are no-shows after payment. Mark as EXPIRED and release the car.
  const noShowConfirmed = await prisma.booking.findMany({
    where: {
      status:  BookingStatus.CONFIRMED,
      endDate: { lt: now },
    },
    select: { id: true, carId: true },
  });

  if (noShowConfirmed.length > 0) {
    for (const booking of noShowConfirmed) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data:  { status: BookingStatus.EXPIRED },
        }),
        prisma.car.update({
          where: { id: booking.carId },
          data:  { status: CarStatus.AVAILABLE },
        }),
      ]);
    }

    logger.info('BookingExpiration: auto-expired confirmed bookings past end date', {
      count: noShowConfirmed.length,
    });
  }
}
