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

/** Shared include shape — keeps all queries consistent. */
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

  async findPaginated(p: NormalizedPagination): Promise<PaginatedResult<UserWithRelations>> {
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
    data: { email?: string; password?: string; emailVerified?: boolean; role?: Role },
  ): Promise<UserWithRelations> {
    return prisma.user.update({ where: { id }, data, include: USER_INCLUDE });
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

  // ── Documents ─────────────────────────────────────────────────────────────

  findDocumentsByUserId(userId: string) {
    return prisma.documents.findUnique({ where: { userId } });
  }

  upsertUserDocuments(
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
    return prisma.documents.upsert({
      where:  { userId },
      update: { ...data, status: VerificationStatus.PENDING },
      create: { userId, ...data, status: VerificationStatus.PENDING },
    });
  }

  updateDocumentsStatus(userId: string, status: VerificationStatus) {
    return prisma.documents.update({
      where: { userId },
      data:  { status },
    });
  }
}

export const userRepository = new UserRepository();