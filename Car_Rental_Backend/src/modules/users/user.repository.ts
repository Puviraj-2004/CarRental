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

  // ── User mutations Updated ────────────────────────────────────────────────

  updateUser(
    id:   string,
    data: {
      email?:         string;
      password?:      string;
      emailVerified?: boolean;
      role?:          Role;
      documentId?:    string | null; // <-- Added: Allows updating and linking the persistent profile document [1]
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

  // ── User-level documents Updated (Resolved Deleted userId column) ──────────

  async findDocumentsByUserId(userId: string) {
    // Find documents by reading the relation through the User's documentId pointer [1]
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
    // 1. Fetch current user document pointer [1]
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { documentId: true }
    });

    if (user?.documentId) {
      // 2. If profile document already exists, update it [1]
      return prisma.documents.update({
        where: { id: user.documentId },
        data: { ...data, status: VerificationStatus.PENDING },
      });
    }

    // 3. Otherwise, create a new profile document row [1]
    const newDoc = await prisma.documents.create({
      data: { ...data, status: VerificationStatus.PENDING }
    });

    // 4. Link the new profile document to the User table [1]
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

  // ── Booking-level documents ───────────────────────────────────────────────

  findDocumentsByBookingId(bookingId: string) {
    return prisma.documents.findUnique({ where: { bookingId } });
  }

  upsertBookingDocuments(
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
    return prisma.documents.upsert({
      where:  { bookingId },
      update: { ...data },
      create: {
        bookingId,
        ...data,
        status: data.status ?? VerificationStatus.PENDING,
      },
    });
  }
}

export const userRepository = new UserRepository();