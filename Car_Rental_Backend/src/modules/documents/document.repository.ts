import { Documents, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export class DocumentRepository {
  async findById(id: string): Promise<Documents | null> {
    return prisma.documents.findUnique({
      where: { id },
    });
  }

  async findByBookingId(bookingId: string): Promise<Documents | null> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { documents: true },
    });
    return booking?.documents || null;
  }

  async create(data: Prisma.DocumentsCreateInput): Promise<Documents> {
    return prisma.documents.create({ data });
  }

  async update(id: string, data: Prisma.DocumentsUpdateInput): Promise<Documents> {
    return prisma.documents.update({
      where: { id },
      data,
    });
  }

  // Links a Document ID to a Booking record [1]
  async linkDocumentToBooking(bookingId: string, documentId: string): Promise<void> {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { documentId },
    });
  }
}

export const documentRepository = new DocumentRepository();