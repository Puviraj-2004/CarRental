import DataLoader from 'dataloader';
import { prisma } from '../../config/database';
import type { Documents,  } from '../../prisma/types';
import { Payment } from '@prisma/client';
import type { BookingWithRelations } from '../../prisma/types';


export function createPaymentByBookingLoader(): DataLoader<string, Payment | null> {
  return new DataLoader<string, Payment | null>(async (bookingIds) => {
    const payments = await prisma.payment.findMany({
      where: { bookingId: { in: [...bookingIds] } },
    });
    const map = new Map(payments.map((p) => [p.bookingId, p]));
    return bookingIds.map((id) => map.get(id) ?? null);
  });
}

export function createDocsByBookingLoader(): DataLoader<string, Documents | null> {
  return new DataLoader<string, Documents | null>(async (bookingIds) => {
    const docs = await prisma.documents.findMany({
      where: { bookingId: { in: [...bookingIds] } },
    });
    const map = new Map(docs.map((d) => [d.bookingId!, d]));
    return bookingIds.map((id) => map.get(id) ?? null);
  });
}


export function createBookingLoader(): DataLoader<string, BookingWithRelations | null> {
  return new DataLoader<string, BookingWithRelations | null>(async (ids) => {
    const bookings = await prisma.booking.findMany({
      where:   { id: { in: [...ids] } },
      include: {
        car:       { include: { model: { include: { brand: true } }, images: true, fuelType: true } },
        user:      true,
        payment:   { include: { paymentMethod: true } },
        documents: true,
      },
    });
    const map = new Map(bookings.map((b) => [b.id, b]));
    return ids.map((id) => map.get(id) ?? null);
  });
}