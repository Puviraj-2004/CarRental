import { sendEmail }  from '../../config/mail';
import { env }        from '../../config/env';
import logger         from '../../config/logger';
import {
  BookingEmailData,
  bookingConfirmedEmail,
  bookingCancelledEmail,
  bookingRejectedEmail,
} from './email.templates';

export function buildBookingEmailData(booking: {
  id:           string;
  startDate:    Date;
  endDate:      Date;
  numberOfDays: number;
  totalPrice:   { toNumber(): number } | number;
  car: {
    model: {
      name:  string;
      brand: { name: string };
    };
  };
}): BookingEmailData {
  return {
    bookingId:    booking.id,
    carLabel:     `${booking.car.model.brand.name} ${booking.car.model.name}`,
    startDate:    booking.startDate.toLocaleDateString('fr-FR'),
    endDate:      booking.endDate.toLocaleDateString('fr-FR'),
    numberOfDays: booking.numberOfDays,
    totalPrice:   typeof booking.totalPrice === 'number'
      ? booking.totalPrice
      : booking.totalPrice.toNumber(),
    currency: env.appCurrency,
  };
}

class NotificationService {
  private async send(
    to:       string,
    template: { subject: string; html: string },
    context:  string,
  ): Promise<void> {
    try {
      await sendEmail({ to, ...template });
      logger.info(`Notification sent: ${context}`, { to });
    } catch (err) {
      // Never throw — email failure must never break the main flow
      logger.warn(`Notification failed: ${context}`, {
        to,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async sendBookingConfirmed(
    to:   string,
    data: BookingEmailData,
  ): Promise<void> {
    await this.send(to, bookingConfirmedEmail(data), 'booking_confirmed');
  }

  async sendBookingCancelled(
    to:   string,
    data: BookingEmailData,
  ): Promise<void> {
    await this.send(to, bookingCancelledEmail(data), 'booking_cancelled');
  }

  async sendBookingRejected(
    to:   string,
    data: BookingEmailData,
  ): Promise<void> {
    await this.send(to, bookingRejectedEmail(data), 'booking_rejected');
  }
}

export const notificationService = new NotificationService();