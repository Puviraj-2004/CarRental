import { documentRepository } from './document.repository';
import { userRepository } from '../users/user.repository';
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

    // 1. Create a fresh Documents snapshot record [1]
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

    // 2. Link this document to the Booking [1]
    await documentRepository.linkDocumentToBooking(bookingId, doc.id);

    // 3. If "Save to Profile" is checked, link this document to the User [1]
    if (saveToProfile) {
      await userRepository.updateUser(userId, { documentId: doc.id });
    }

    return doc;
  }

  // Links an existing approved profile document to a new booking with zero duplication [1]
  async reuseDocumentsForBooking(userId: string, bookingId: string) {
    const userDocs = await userRepository.findDocumentsByUserId(userId);
    if (!userDocs || userDocs.status !== 'APPROVED') {
      throw new AppError('No verified profile documents found to reuse.', ErrorCode.BAD_USER_INPUT);
    }

    // Link the existing document directly to the Booking table [1]
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
}

export const documentService = new DocumentService();