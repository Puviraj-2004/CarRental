import { Role, VerificationStatus, BookingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NormalizedPagination,
  buildPaginatedResult,
  PaginatedResult,
} from '../../core/utils/pagination';
import type { UserWithRelations } from '../../prisma/types';

const ACTIVE_BOOKING_STATUSES = [
  BookingStatus.RESERVED,
  BookingStatus.CONFIRMED,
  BookingStatus.ONGOING,
] as const;

const USER_INCLUDE = { documents: true, bookings: true } as const;

export class UserRepository {
  // ── User queries ──────────────────────────────────────────────────────────

  findByEmail(email: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where:   { email },
      include: USER_INCLUDE,
    });
  }

  findById(id: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where:   { id },
      include: USER_INCLUDE,
    });
  }

  async findPaginated(
    p: NormalizedPagination,
  ): Promise<PaginatedResult<UserWithRelations>> {
    const where = p.search
      ? { email: { contains: p.search, mode: 'insensitive' as const } }
      : {};

    const [items, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: USER_INCLUDE,
        skip:    p.skip,
        take:    p.take,
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  // ── User mutations ────────────────────────────────────────────────────────

  updateUser(
    id:   string,
    data: {
      email?:         string;
      password?:      string;
      emailVerified?: boolean;
      phoneNumber?:   string | null;
      role?:          Role;
      documentId?:    string | null; 
    },
  ): Promise<UserWithRelations> {
    return prisma.user.update({
      where:   { id },
      data,
      include: USER_INCLUDE,
    });
  }

  deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  // ── Booking helpers ───────────────────────────────────────────────────────

  countActiveBookings(userId: string): Promise<number> {
    return prisma.booking.count({
      where: { userId, status: { in: [...ACTIVE_BOOKING_STATUSES] } },
    });
  }

  // ── User-level documents (Excludes deleted userId column) ──────────────────

  async findDocumentsByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { documents: true }
    });
    return user?.documents || null;
  }

  async upsertUserDocuments(
    userId: string,
    data: {
      licenseFrontUrl?: string;
      licenseBackUrl?:  string;
      idCardFrontUrl?:  string;
      idCardBackUrl?:   string;
      addressProofUrl?: string;
      licenseNumber?:   string;
      licenseExpiry?:   Date;
      age?:             number;
      idNumber?:        string;
      idExpiry?:        Date;
      address?:         string;
    },
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { documentId: true }
    });

    if (user?.documentId) {
      return prisma.documents.update({
        where: { id: user.documentId },
        data: { ...data, status: VerificationStatus.PENDING },
      });
    }

    const newDoc = await prisma.documents.create({
      data: { ...data, status: VerificationStatus.PENDING }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { documentId: newDoc.id }
    });

    return newDoc;
  }

  async updateDocumentsStatus(userId: string, status: VerificationStatus) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { documentId: true }
    });

    if (!user?.documentId) {
      throw new Error('No documents found for this user.');
    }

    return prisma.documents.update({
      where: { id: user.documentId },
      data:  { status },
    });
  }

  // ── Booking-level documents Updated (Excludes deleted bookingId column) ───

  async findDocumentsByBookingId(bookingId: string) {
    // Navigates through the parent Booking table to retrieve the documents snapshot [1]
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { documents: true },
    });
    return booking?.documents || null;
  }

  async upsertBookingDocuments(
    bookingId: string,
    data: {
      licenseFrontUrl?: string;
      licenseBackUrl?:  string;
      idCardFrontUrl?:  string;
      idCardBackUrl?:   string;
      addressProofUrl?: string;
      licenseNumber?:   string;
      licenseExpiry?:   Date;
      age?:             number;
      idNumber?:        string;
      idExpiry?:        Date;
      address?:         string;
      status?:          VerificationStatus;
    },
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { documentId: true },
    });

    const status = data.status ?? VerificationStatus.PENDING;

    if (booking?.documentId) {
      // 1. If the booking already has a linked document record, update it [1]
      return prisma.documents.update({
        where: { id: booking.documentId },
        data: { ...data, status },
      });
    }

    // 2. Otherwise, create a new document record [1]
    const newDoc = await prisma.documents.create({
      data: { ...data, status },
    });

    // 3. Link this new document record to the Booking table [1]
    await prisma.booking.update({
      where: { id: bookingId },
      data: { documentId: newDoc.id },
    });

    return newDoc;
  }
}

export const userRepository = new UserRepository();
