import { v2 as cloudinary } from 'cloudinary'; // Direct Cloudinary SDK import [2]
import { documentRepository } from './document.repository';
import { userRepository } from '../users/user.repository';
import { bookingService } from '../bookings/booking.service';
import { prisma } from '../../config/database'; 
import logger from '../../config/logger';
import { AppError, ErrorCode } from '../../core/errors/AppError';

interface SaveBookingDocumentsInput {
  userId: string;
  bookingId: string;
  saveToProfile: boolean;
  input: {
    licenseFrontUrl: string;
    licenseBackUrl:  string;
    idCardFrontUrl:  string;
    idCardBackUrl:   string;
    addressProofUrl: string;
    licenseNumber?:   string | null;
    licenseExpiry?:   string | null;
    idNumber?:        string | null;
    idExpiry?:        string | null;
    address?:         string | null;
    birthDate?:       string | null;
  };
}

const parseDateSafe = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr || dateStr.trim().length === 0) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const calculateAge = (birthDateStr: string | undefined | null): number | null => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Robust helper to extract Cloudinary public ID dynamically from URLs [2]
function extractPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathWithFilename = parts[1].replace(/^v\d+\//, ''); // Removes version folder e.g. "v1234567/"
    const lastDotIndex = pathWithFilename.lastIndexOf('.');
    return lastDotIndex === -1 ? pathWithFilename : pathWithFilename.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

export class DocumentService {
  async getByBookingId(bookingId: string) {
    return documentRepository.findByBookingId(bookingId);
  }

  async saveBookingDocuments(data: SaveBookingDocumentsInput) {
    const { input, userId, bookingId, saveToProfile } = data;

    const licenseNumber = input.licenseNumber || null;
    const licenseExpiry = parseDateSafe(input.licenseExpiry);
    const idNumber = input.idNumber || null;
    const idExpiry = parseDateSafe(input.idExpiry);
    const address = input.address || null;
    const age = calculateAge(input.birthDate);

    const doc = await documentRepository.create({
      licenseFrontUrl: input.licenseFrontUrl,
      licenseBackUrl:  input.licenseBackUrl,
      idCardFrontUrl:  input.idCardFrontUrl,
      idCardBackUrl:   input.idCardBackUrl,
      addressProofUrl: input.addressProofUrl,
      licenseNumber,
      licenseExpiry,
      age,
      idNumber,
      idExpiry,
      address,
      status:          'PENDING',
    });

    await documentRepository.linkDocumentToBooking(bookingId, doc.id);

    if (saveToProfile) {
      await userRepository.updateUser(userId, { documentId: doc.id });
    }

    return doc;
  }

  async reuseDocumentsForBooking(userId: string, bookingId: string) {
    const userDocs = await userRepository.findDocumentsByUserId(userId);
    if (!userDocs || userDocs.status !== 'APPROVED') {
      throw new AppError('No verified profile documents found to reuse.', ErrorCode.BAD_USER_INPUT);
    }

    await documentRepository.linkDocumentToBooking(bookingId, userDocs.id);
    return userDocs;
  }

  async hasApprovedDocuments(userId: string) {
    const docs = await userRepository.findDocumentsByUserId(userId);
    const hasApprovedDocuments = !!docs && docs.status === 'APPROVED';
    return {
      hasApprovedDocuments,
      documents: hasApprovedDocuments ? docs : null,
    };
  }

  // Helper method to purge physically uploaded files from Cloudinary storage [2]
  private async purgeFilesFromCloud(doc: any): Promise<void> {
    const urls = [
      doc.licenseFrontUrl,
      doc.licenseBackUrl,
      doc.idCardFrontUrl,
      doc.idCardBackUrl,
      doc.addressProofUrl
    ];

    const publicIds = urls
      .map(url => extractPublicIdFromUrl(url))
      .filter((id): id is string => !!id);

    // Delete each asset from Cloudinary securely [2]
    await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          await cloudinary.uploader.destroy(publicId);
          logger.info('Cloud asset purged successfully', { publicId });
        } catch (err) {
          logger.warn('Failed to delete asset from Cloudinary', { publicId, error: err instanceof Error ? err.message : String(err) });
        }
      })
    );
  }

  // Triggers document rejection based on the associated User ID
  async adminVerifyDocuments(userId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { documentId: true },
    });

    if (!user || !user.documentId) {
      throw new AppError('No document linked to this user profile found.', ErrorCode.NOT_FOUND);
    }

    return this.executeVerificationOrRejectionPurge(user.documentId, status);
  }

  // Triggers document rejection based directly on Document ID
  async adminUpdateDocumentStatus(documentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.executeVerificationOrRejectionPurge(documentId, status);
  }

  // Executes the cascading rejection, unlinking, cloud asset purge, and DB delete sequence [1, 2]
  private async executeVerificationOrRejectionPurge(documentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const doc = await documentRepository.findById(documentId);
    if (!doc) {
      throw new AppError('Document record not found.', ErrorCode.NOT_FOUND);
    }

    if (status !== 'REJECTED') {
      // Handle standard approval update normally
      return documentRepository.update(documentId, { status });
    }

    // ── STEP 1: Reject any bookings linked to this document [1] ──
    const bookings = await prisma.booking.findMany({
      where: { documentId },
      select: { id: true }
    });

    for (const b of bookings) {
      try {
        // Automatically voids/refunds payment and rejects booking [1]
        await bookingService.adminUpdateBookingStatus(b.id, 'REJECTED');
      } catch (err) {
        logger.error('Failed to transition booking state during document rejection cascade', { bookingId: b.id, error: err });
      }
    }

    // ── STEP 2: Safe Purge from Cloudinary Storage [2] ──
    await this.purgeFilesFromCloud(doc);

    // ── STEP 3: Unlink from User profile records [1] ──
    await prisma.user.updateMany({
      where: { documentId },
      data: { documentId: null }
    });

    // ── STEP 4: Delete the Document record from the database ──
    await prisma.documents.delete({
      where: { id: documentId }
    });

    logger.info('Document and all associated records/files successfully purged and unlinked on rejection', { documentId });

    // Returns a dummy rejected object structure since the DB record has been purged
    return {
      ...doc,
      id: documentId,
      status: 'REJECTED',
    };
  }
}

export const documentService = new DocumentService();