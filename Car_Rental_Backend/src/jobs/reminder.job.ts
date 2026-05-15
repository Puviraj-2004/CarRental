import { BookingStatus } from '@prisma/client';
import prisma from '../prisma/client';
import { sendEmail } from '../config/mail';
import logger from '../config/logger';

/**
 * Send reminder emails for bookings starting within the next 24 hours.
 * Run this on a schedule (e.g. every hour via cron or node-cron).
 */
export async function runReminderJob(): Promise<void> {
  const now     = new Date();
  const in24h   = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcoming = await prisma.booking.findMany({
    where: {
      status:    BookingStatus.CONFIRMED,
      startDate: { gte: now, lte: in24h },
    },
    include: { user: true },
  });

  for (const booking of upcoming) {
    if (!booking.user) continue;
    try {
      await sendEmail({
        to:      booking.user.email,
        subject: 'Rappel — votre location démarre demain',
        html:    `<p>Bonjour,</p><p>Votre location (réf. <strong>${booking.id}</strong>) démarre le <strong>${booking.startDate.toLocaleDateString('fr-FR')}</strong>.</p>`,
      });
      logger.info('Reminder sent', { bookingId: booking.id, email: booking.user.email });
    } catch (err) {
      logger.warn('Reminder email failed', {
        bookingId: booking.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
