import { Queue, Worker }           from 'bullmq';
import { getRedisClient }          from '../config/redis';
import { RESERVATION_HOLD_MINUTES, PAYMENT_EXPIRY_HOURS } from '../core/constants/booking';
import logger                      from '../config/logger';

import { runBookingExpirationJob } from './bookingExpiration.job';
import { runPaymentCleanupJob }    from './paymentCleanup.job';
import { runReminderJob }          from './reminder.job';

const BOOKING_EXPIRATION = 'booking-expiration';
const PAYMENT_CLEANUP    = 'payment-cleanup';
const REMINDER           = 'reminder';

async function resetRepeatableJobs(queue: Queue): Promise<void> {
  const jobs = await queue.getRepeatableJobs();
  await Promise.all(jobs.map((job) => queue.removeRepeatableByKey(job.key)));
}

export async function startScheduler(): Promise<void> {
  const redis = getRedisClient();

  if (!redis) {
    logger.warn(
      'Scheduler: Redis not configured — background jobs will not run. ' +
      'Set REDIS_URL or REDIS_HOST in your .env to enable them.',
    );
    return;
  }

  const connection = {
    host:     redis.options?.host ?? '127.0.0.1',
    port:     redis.options?.port ?? 6379,
    password: redis.options?.password ?? undefined,
  };

  // ── 1. Create Queues ───────────────────────────────────────────────────────
  const bookingExpirationQueue = new Queue(BOOKING_EXPIRATION, { connection });
  const paymentCleanupQueue    = new Queue(PAYMENT_CLEANUP,    { connection });
  const reminderQueue          = new Queue(REMINDER,           { connection });

  await Promise.all([
    resetRepeatableJobs(bookingExpirationQueue),
    resetRepeatableJobs(paymentCleanupQueue),
    resetRepeatableJobs(reminderQueue),
  ]);

  // ── 2. Register Queue Error Listeners (Prevents uncaught crashes) ─────────
  bookingExpirationQueue.on('error', (err) => {
    logger.warn('BullMQ Queue Error (booking-expiration): Transient connection issue caught.', { message: err.message });
  });

  paymentCleanupQueue.on('error', (err) => {
    logger.warn('BullMQ Queue Error (payment-cleanup): Transient connection issue caught.', { message: err.message });
  });

  reminderQueue.on('error', (err) => {
    logger.warn('BullMQ Queue Error (reminder): Transient connection issue caught.', { message: err.message });
  });

  // Run at 1/4 of the hold window — catches expiries promptly
  const expirationIntervalMs = Math.floor(RESERVATION_HOLD_MINUTES / 4) * 60 * 1000;
  const paymentCleanupMs     = PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000;

  await bookingExpirationQueue.add(
    BOOKING_EXPIRATION,
    {},
    {
      repeat:           { every: expirationIntervalMs },
      jobId:            BOOKING_EXPIRATION,
      removeOnComplete: true,
      removeOnFail:     10,
    },
  );

  await paymentCleanupQueue.add(
    PAYMENT_CLEANUP,
    {},
    {
      repeat:           { every: paymentCleanupMs },
      jobId:            PAYMENT_CLEANUP,
      removeOnComplete: true,
      removeOnFail:     10,
    },
  );

  await reminderQueue.add(
    REMINDER,
    {},
    {
      repeat:           { pattern: '0 12 * * *' },
      jobId:            REMINDER,
      removeOnComplete: true,
      removeOnFail:     10,
    },
  );

  // ── 3. Create Workers & Register Worker Error Listeners ────────────────────
  const expirationWorker = new Worker(
    BOOKING_EXPIRATION,
    async () => {
      logger.debug('Running BookingExpiration job');
      await runBookingExpirationJob();
    },
    { connection },
  );

  expirationWorker.on('error', (err) => {
    logger.warn('BullMQ Worker Error (booking-expiration): Transient connection issue caught.', { message: err.message });
  });

  const cleanupWorker = new Worker(
    PAYMENT_CLEANUP,
    async () => {
      logger.debug('Running PaymentCleanup job');
      await runPaymentCleanupJob();
    },
    { connection },
  );

  cleanupWorker.on('error', (err) => {
    logger.warn('BullMQ Worker Error (payment-cleanup): Transient connection issue caught.', { message: err.message });
  });

  const reminderWorker = new Worker(
    REMINDER,
    async () => {
      logger.debug('Running Reminder job');
      await runReminderJob();
    },
    { connection },
  );

  reminderWorker.on('error', (err) => {
    logger.warn('BullMQ Worker Error (reminder): Transient connection issue caught.', { message: err.message });
  });

  logger.info('Scheduler: background jobs registered', {
    jobs: [
      {
        name:     BOOKING_EXPIRATION,
        schedule: `every ${Math.floor(RESERVATION_HOLD_MINUTES / 4)} minutes`,
      },
      {
        name:     PAYMENT_CLEANUP,
        schedule: `every ${PAYMENT_EXPIRY_HOURS} hours`,
      },
      {
        name:     REMINDER,
        schedule: 'daily at 12:00 PM',
      },
    ],
  });
}
