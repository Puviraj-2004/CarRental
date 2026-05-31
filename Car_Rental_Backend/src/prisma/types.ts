import { Prisma } from '@prisma/client';

// ─── User ─────────────────────────────────────────────────────────────────────

const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { documents: true, bookings: true },
});

/** User row including documents and bookings arrays. */
export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;

// ─── Car ──────────────────────────────────────────────────────────────────────

const carWithRelations = Prisma.validator<Prisma.CarDefaultArgs>()({
  include: { model: { include: { brand: true } }, images: true, fuelType: true },
});

/** Car row including nested model→brand and images array. */
export type CarWithRelations = Prisma.CarGetPayload<typeof carWithRelations>;

const modelWithBrand = Prisma.validator<Prisma.VehicleModelDefaultArgs>()({
  include: { brand: true },
});

/** VehicleModel row including its Brand. */
export type ModelWithBrand = Prisma.VehicleModelGetPayload<typeof modelWithBrand>;

// ─── Booking ──────────────────────────────────────────────────────────────────

const bookingWithRelations = Prisma.validator<Prisma.BookingDefaultArgs>()({
  include: {
    car: {
      include: {
        model: {
          include: { brand: true },
        },
        images: true,
        fuelType: true,
      },
    },
    user: true,
    payment: {
      include: { paymentMethod: true },
    },
    documents: true,
  },
});

/** Booking row including car, user, payment and documents. */
export type BookingWithRelations = Prisma.BookingGetPayload<typeof bookingWithRelations>;

// ─── Payment ──────────────────────────────────────────────────────────────────

const paymentWithMethod = Prisma.validator<Prisma.PaymentDefaultArgs>()({
  include: { paymentMethod: true },
});

/** Payment row including its PaymentMethod. */
export type PaymentWithMethod = Prisma.PaymentGetPayload<typeof paymentWithMethod>;

// ─── Documents ────────────────────────────────────────────────────────────────

// Documents has no nested relations worth including by default.
// Re-export the plain type for consistency.
export type { Documents, Documents as PrismaDocuments, Brand, CarImage, FuelType } from '@prisma/client';