import { Documents, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class DocumentRepository {
  async findByBookingId(bookingId: string): Promise<Documents | null> {
    return prisma.documents.findUnique({
      where: { bookingId },
    });
  }

  // Accepts separate create and update inputs to respect relation types [1]
  async upsert(
    bookingId: string, 
    createData: Prisma.DocumentsCreateInput, 
    updateData: Prisma.DocumentsUpdateInput
  ): Promise<Documents> {
    return prisma.documents.upsert({
      where: { bookingId },
      create: createData,
      update: updateData,
    });
  }
}

export const documentRepository = new DocumentRepository();