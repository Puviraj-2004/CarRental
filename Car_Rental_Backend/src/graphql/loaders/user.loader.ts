import DataLoader from 'dataloader';
import { prisma } from '../../config/database';
import type { UserWithRelations } from '../../prisma/types';

export function createUserLoader(): DataLoader<string, UserWithRelations | null> {
  return new DataLoader<string, UserWithRelations | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where:   { id: { in: [...ids] } },
      include: { documents: true, bookings: true },
    });
    const map = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => map.get(id) ?? null);
  });
}