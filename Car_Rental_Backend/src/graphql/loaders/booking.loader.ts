import DataLoader from 'dataloader';
import { prisma } from '../../config/database';
import type { Documents,  } from '../../prisma/types';
import { Payment } from '@prisma/client';

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