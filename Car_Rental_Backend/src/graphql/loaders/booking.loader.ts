import DataLoader from 'dataloader';
import { prisma } from '../../config/database';
import type { Documents } from '../../prisma/types';
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
    // 1. Fetch the bookings to resolve their documentId links [1]
    const bookings = await prisma.booking.findMany({
      where: { id: { in: [...bookingIds] } },
      select: { id: true, documentId: true },
    });

    const validDocIds = bookings
      .map((b) => b.documentId)
      .filter((id): id is string => !!id);

    // 2. Fetch the documents using their actual primary keys [1]
    const docs = await prisma.documents.findMany({
      where: { id: { in: validDocIds } },
    });

    // 3. Map the documents back to the original booking IDs [1]
    const docMap = new Map(docs.map((d) => [d.id, d]));
    const bookingToDocMap = new Map(
      bookings.map((b) => [b.id, b.documentId ? docMap.get(b.documentId) || null : null])
    );

    return bookingIds.map((id) => bookingToDocMap.get(id) ?? null);
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