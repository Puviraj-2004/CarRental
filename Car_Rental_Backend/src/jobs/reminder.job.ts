import { BookingStatus } from '@prisma/client';
import { prisma }        from '../config/database';
import { sendEmail }     from '../config/mail';
import { env }           from '../config/env';
import logger            from '../config/logger';

export async function runReminderJob(): Promise<void> {
  // ── Build tomorrow's date range (midnight to midnight) ───────────────────
  const now       = new Date();
  const tomorrow  = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfTomorrow = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    0, 0, 0, 0,
  );
  const endOfTomorrow = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    23, 59, 59, 999,
  );

  // ── Find confirmed bookings starting tomorrow that haven't been reminded ──
  const bookings = await prisma.booking.findMany({
    where: {
      status:        BookingStatus.CONFIRMED,
      reminderSentAt: null,
      startDate: {
        gte: startOfTomorrow,
        lte: endOfTomorrow,
      },
    },
    include: { user: true },
  });

  if (bookings.length === 0) {
    logger.info('Reminder job: no reminders to send today');
    return;
  }

  logger.info('Reminder job: sending reminders', { count: bookings.length });

  for (const booking of bookings) {
    // Guest bookings (no user account) — skip email
    if (!booking.user?.email) {
      await prisma.booking.update({
        where: { id: booking.id },
        data:  { reminderSentAt: new Date() },
      });
      continue;
    }

    try {
      await sendEmail({
        to:      booking.user.email,
        subject: `Reminder — your ${env.companyName} rental starts tomorrow`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your rental starts tomorrow</h2>
            <p>Hello,</p>
            <p>
              This is a reminder that your car rental 
              (ref. <strong>${booking.id}</strong>) 
              starts tomorrow on 
              <strong>${startOfTomorrow.toLocaleDateString('fr-FR')}</strong>.
            </p>
            <p>
              Please make sure to bring your driving licence and ID.
            </p>
          </div>
        `,
      });

      // Mark as reminded — prevents double send on job re-run
      await prisma.booking.update({
        where: { id: booking.id },
        data:  { reminderSentAt: new Date() },
      });

      logger.info('Reminder job: email sent', {
        bookingId: booking.id,
        email:     booking.user.email,
      });
    } catch (err) {
      logger.warn('Reminder job: failed to send email', {
        bookingId: booking.id,
        error:     err instanceof Error ? err.message : String(err),
      });
      // Do NOT mark reminderSentAt — will retry on next run
    }
  }
}