/**
 * DataLoader factory — creates per-request batching loaders to eliminate N+1 queries.
 *
 * Each loader batches individual relation look-ups that would otherwise fire once per
 * parent row (e.g. Car → Brand, Booking → User) into a single SQL query per type.
 *
 * Usage: call `createDataLoaders()` once per GraphQL request inside the Apollo context.
 */

import DataLoader from 'dataloader';
import prisma from './database';

// ─── Brand loader (by brand ID) ─────────────────────────────────────────────
function createBrandLoader() {
  return new DataLoader<string, any>(async (ids) => {
    const brands = await prisma.brand.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(brands.map((b) => [b.id, b]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

// ─── User loader (by user ID) ───────────────────────────────────────────────
function createUserLoader() {
  return new DataLoader<string, any>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

// ─── Car loader (by car ID, with model + brand + images) ────────────────────
function createCarLoader() {
  return new DataLoader<string, any>(async (ids) => {
    const cars = await prisma.car.findMany({
      where: { id: { in: [...ids] } },
      include: { model: { include: { brand: true } }, images: true },
    });
    const map = new Map(cars.map((c) => [c.id, c]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

// ─── VehicleModel loader (by model ID, with brand) ─────────────────────────
function createModelLoader() {
  return new DataLoader<string, any>(async (ids) => {
    const models = await prisma.vehicleModel.findMany({
      where: { id: { in: [...ids] } },
      include: { brand: true },
    });
    const map = new Map(models.map((m) => [m.id, m]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

// ─── Car images loader (by car ID — one-to-many) ───────────────────────────
function createCarImagesLoader() {
  return new DataLoader<string, any[]>(async (carIds) => {
    const images = await prisma.carImage.findMany({
      where: { carId: { in: [...carIds] } },
      orderBy: { isPrimary: 'desc' },
    });
    const map = new Map<string, any[]>();
    for (const img of images) {
      const list = map.get(img.carId) ?? [];
      list.push(img);
      map.set(img.carId, list);
    }
    return carIds.map((id) => map.get(id) ?? []);
  });
}

// ─── Payment loader (by booking ID — one-to-one) ───────────────────────────
function createPaymentByBookingLoader() {
  return new DataLoader<string, any>(async (bookingIds) => {
    const payments = await prisma.payment.findMany({
      where: { bookingId: { in: [...bookingIds] } },
    });
    const map = new Map(payments.map((p) => [p.bookingId, p]));
    return bookingIds.map((id) => map.get(id) ?? null);
  });
}

// ─── DocumentVerification loader (by booking ID — one-to-one) ──────────────
function createDocVerificationByBookingLoader() {
  return new DataLoader<string, any>(async (bookingIds) => {
    const docs = await prisma.documentVerification.findMany({
      where: { bookingId: { in: [...bookingIds] } },
    });
    const map = new Map(docs.map((d) => [d.bookingId, d]));
    return bookingIds.map((id) => map.get(id) ?? null);
  });
}

// ─── BookingVerification loader (by booking ID — one-to-one) ───────────────
function createBookingVerificationByBookingLoader() {
  return new DataLoader<string, any>(async (bookingIds) => {
    const verifications = await prisma.bookingVerification.findMany({
      where: { bookingId: { in: [...bookingIds] } },
    });
    const map = new Map(verifications.map((v) => [v.bookingId, v]));
    return bookingIds.map((id) => map.get(id) ?? null);
  });
}

// ─── Factory ────────────────────────────────────────────────────────────────

export interface DataLoaders {
  brandLoader: DataLoader<string, any>;
  userLoader: DataLoader<string, any>;
  carLoader: DataLoader<string, any>;
  modelLoader: DataLoader<string, any>;
  carImagesLoader: DataLoader<string, any[]>;
  paymentByBookingLoader: DataLoader<string, any>;
  docVerificationByBookingLoader: DataLoader<string, any>;
  bookingVerificationByBookingLoader: DataLoader<string, any>;
}

/**
 * Call once per incoming request — each loader's internal cache is request-scoped,
 * preventing stale data from leaking across requests.
 */
export function createDataLoaders(): DataLoaders {
  return {
    brandLoader: createBrandLoader(),
    userLoader: createUserLoader(),
    carLoader: createCarLoader(),
    modelLoader: createModelLoader(),
    carImagesLoader: createCarImagesLoader(),
    paymentByBookingLoader: createPaymentByBookingLoader(),
    docVerificationByBookingLoader: createDocVerificationByBookingLoader(),
    bookingVerificationByBookingLoader: createBookingVerificationByBookingLoader(),
  };
}
