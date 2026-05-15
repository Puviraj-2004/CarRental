import { prisma } from '../../config/database';
import type { UserWithRelations } from '../../prisma/types';

const USER_INCLUDE = { documents: true, bookings: true } as const;

export class AuthRepository {
  findByEmail(email: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where:   { email },
      include: USER_INCLUDE,
    });
  }

  createUser(data: {
    email:          string;
    password:       string;
    emailVerified?: boolean;
  }): Promise<UserWithRelations> {
    return prisma.user.create({
      data,
      include: USER_INCLUDE,
    });
  }

  setEmailVerified(id: string): Promise<UserWithRelations> {
    return prisma.user.update({
      where:   { id },
      data:    { emailVerified: true },
      include: USER_INCLUDE,
    });
  }
}

export const authRepository = new AuthRepository();
