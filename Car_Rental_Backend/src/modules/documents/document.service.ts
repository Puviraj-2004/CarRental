import { documentRepository } from './document.repository';
import { userRepository } from '../users/user.repository'; 

interface SaveBookingDocumentsInput {
  userId: string;
  bookingId: string;
  saveToProfile: boolean; // Managed explicitly [1]
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

    // 1. Structural update for Booking-level documents (strictly connected to Booking) [1]
    const createData = {
      booking:         { connect: { id: bookingId } },
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
      status:          'PENDING' as const,
    };

    const updateData = {
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
      status:          'PENDING' as const,
    };

    const bookingDoc = await documentRepository.upsert(bookingId, createData, updateData);

    // 2. Dynamic "Save to Profile" action (Safely routed through the userRepository) [1]
    if (saveToProfile) {
      await userRepository.upsertUserDocuments(userId, {
        licenseFrontUrl: input.licenseFrontUrl,
        licenseBackUrl:  input.licenseBackUrl,
        idCardFrontUrl:  input.idCardFrontUrl,
        idCardBackUrl:   input.idCardBackUrl,
        addressProofUrl: input.addressProofUrl,
        licenseNumber:   licenseNumber || undefined,
        licenseExpiry:   licenseExpiry || undefined,
        age:             age || undefined,
        idNumber:        idNumber || undefined,
        idExpiry:        idExpiry || undefined,
        address:         address || undefined,
      });
    }

    return bookingDoc;
  }
}

export const documentService = new DocumentService();