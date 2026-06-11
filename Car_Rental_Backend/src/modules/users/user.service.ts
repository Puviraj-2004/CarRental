import { Role, VerificationStatus, BookingStatus } from '@prisma/client';
import type { FileUpload } from 'graphql-upload-ts';

import { AppError, ErrorCode }             from '../../core/errors/AppError';
import { hashPassword, comparePasswords }  from '../../core/utils/jwt';
import { normalizePagination }             from '../../core/utils/pagination';
import { logSecurityEvent, securityLogger } from '../../config/logger';
import cloudinary                          from '../../config/cloudinary';
import { validatePassword }                from '../../core/utils/validation';
import { validateFileMime }                from '../../core/utils/fileValidation';
import { prisma }                          from '../../config/database';
import { userRepository }                  from './user.repository';

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadPromise = Promise<FileUpload>;

export interface DocumentsInput {
  licenseFrontFile?: UploadPromise;
  licenseBackFile?:  UploadPromise;
  idCardFrontFile?:  UploadPromise;
  idCardBackFile?:   UploadPromise;
  addressProofFile?: UploadPromise;
  licenseNumber?:    string;
  licenseExpiry?:    Date | string;
  age?:              number;
  idNumber?:         string;
  idExpiry?:         Date | string;
  address?:          string;
}

export type OcrDocumentType = 'LICENSE' | 'ID_CARD' | 'ADDRESS_PROOF';
export type OcrDocumentSide = 'FRONT' | 'BACK';

export interface OcrResult {
  licenseNumber?:   string | null;
  licenseExpiry?:   Date | null;
  age?:             number | null;
  idNumber?:        string | null;
  idExpiry?:        Date | null;
  address?:         string | null;
  fallbackUsed?:    boolean;
  isQuotaExceeded?: boolean;
}

// ─── Cloudinary upload helpers ────────────────────────────────────────────────

function uploadStream(
  createReadStream: () => NodeJS.ReadableStream,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'documents', resource_type: 'auto' },
      (error, result) => {
        if (error ?? !result) return reject(error ?? new Error('Upload failed'));
        resolve(result!.secure_url);
      },
    );
    createReadStream().pipe(upload);
  });
}

async function uploadFileIfPresent(
  filePromise?: UploadPromise,
): Promise<string | undefined> {
  if (!filePromise) return undefined;
  try {
    const { createReadStream, mimetype } = await filePromise;
    validateFileMime(mimetype, 'verification_document');
    return await uploadStream(createReadStream);
  } catch (err) {
    securityLogger.error('Document file upload failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return undefined;
  }
}

// ─── UserService ──────────────────────────────────────────────────────────────

export class UserService {
  // ── User management ────────────────────────────────────────────────────────

  getCurrentUser(userId: string) {
    return userRepository.findById(userId);
  }

  getUserById(id: string) {
    return userRepository.findById(id);
  }

  getAllUsers(pagination?: {
    page?:     number;
    pageSize?: number;
    search?:   string;
  }) {
    return userRepository.findPaginated(normalizePagination(pagination));
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
    return !(await userRepository.findByEmail(normalized));
  }

  async changePassword(
    userId:          string,
    currentPassword: string,
    newPassword:     string,
  ) {
    const user = await userRepository.findById(userId);
    if (!user?.password) {
      throw new AppError('User not found.', ErrorCode.NOT_FOUND);
    }

    const valid = await comparePasswords(currentPassword, user.password);
    if (!valid) {
      throw new AppError(
        'Current password is incorrect.',
        ErrorCode.UNAUTHENTICATED,
      );
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.isValid) {
      throw new AppError(pwCheck.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    await userRepository.updateUser(userId, {
      password: await hashPassword(newPassword),
    });
    return true;
  }

  async updateUserRole(id: string, role: Role) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found.', ErrorCode.NOT_FOUND);

    logSecurityEvent.adminAction({
      action:   'UPDATE_USER_ROLE',
      adminId:  id,
      targetId: id,
    });
    return userRepository.updateUser(id, { role });
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found.', ErrorCode.NOT_FOUND);

    const active = await userRepository.countActiveBookings(id);
    if (active > 0) {
      throw new AppError(
        'Cannot delete a user with active bookings.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    return userRepository.deleteUser(id);
  }

  // ── User-level documents ───────────────────────────────────────────────────

  getMyDocuments(userId: string) {
    return userRepository.findDocumentsByUserId(userId);
  }

  async saveDocuments(userId: string, input: DocumentsInput) {
    const [
      licenseFrontUrl,
      licenseBackUrl,
      idCardFrontUrl,
      idCardBackUrl,
      addressProofUrl,
    ] = await Promise.all([
      uploadFileIfPresent(input.licenseFrontFile),
      uploadFileIfPresent(input.licenseBackFile),
      uploadFileIfPresent(input.idCardFrontFile),
      uploadFileIfPresent(input.idCardBackFile),
      uploadFileIfPresent(input.addressProofFile),
    ]);

    return userRepository.upsertUserDocuments(userId, {
      licenseFrontUrl,
      licenseBackUrl,
      idCardFrontUrl,
      idCardBackUrl,
      addressProofUrl,
      licenseNumber: input.licenseNumber,
      licenseExpiry: input.licenseExpiry
        ? (input.licenseExpiry instanceof Date ? input.licenseExpiry : new Date(input.licenseExpiry))
        : undefined,
      age:      input.age,
      idNumber: input.idNumber,
      idExpiry: input.idExpiry 
        ? (input.idExpiry instanceof Date ? input.idExpiry : new Date(input.idExpiry))
        : undefined,
      address:  input.address,
    });
  }

  async adminVerifyDocuments(userId: string, status: VerificationStatus) {
    const docs = await userRepository.findDocumentsByUserId(userId);
    if (!docs) {
      throw new AppError(
        'No documents found for this user.',
        ErrorCode.NOT_FOUND,
      );
    }
    return userRepository.updateDocumentsStatus(userId, status);
  }

  // ── Document reuse ─────────────────────────────────────────────────────────

  async hasApprovedDocuments(userId: string): Promise<{
    hasApprovedDocuments: boolean;
    documents: Awaited<
      ReturnType<typeof userRepository.findDocumentsByUserId>
    >;
  }> {
    const docs    = await userRepository.findDocumentsByUserId(userId);
    const approved = docs?.status === VerificationStatus.APPROVED;
    return {
      hasApprovedDocuments: approved,
      documents:            approved ? docs : null,
    };
  }

  async reuseDocumentsForBooking(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { userId: true, status: true },
    });

    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }
    if (booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }
    if (booking.status !== BookingStatus.RESERVED) {
      throw new AppError(
        'Documents can only be attached to RESERVED bookings.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const userDocs = await userRepository.findDocumentsByUserId(userId);
    if (!userDocs) {
      throw new AppError(
        'No saved documents found on your profile.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    // Rule 6: Booking must maintain its own independent document verification workflow
    return userRepository.upsertBookingDocuments(bookingId, {
      licenseFrontUrl: userDocs.licenseFrontUrl ?? undefined,
      licenseBackUrl:  userDocs.licenseBackUrl  ?? undefined,
      idCardFrontUrl:  userDocs.idCardFrontUrl  ?? undefined,
      idCardBackUrl:   userDocs.idCardBackUrl   ?? undefined,
      addressProofUrl: userDocs.addressProofUrl ?? undefined,
      licenseNumber:   userDocs.licenseNumber   ?? undefined,
      licenseExpiry:   userDocs.licenseExpiry   ?? undefined,
      age:             userDocs.age             ?? undefined,
      idNumber:        userDocs.idNumber        ?? undefined,
      idExpiry:        userDocs.idExpiry        ?? undefined,
      address:         userDocs.address         ?? undefined,
      status:          VerificationStatus.PENDING, // Always starts as PENDING for the individual booking
    });
  }

  async saveBookingDocuments(
    userId:        string,
    bookingId:     string,
    input:         DocumentsInput,
    saveToProfile?: boolean,
  ) {
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: { userId: true, status: true },
    });

    if (!booking) {
      throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
    }
    if (booking.userId !== userId) {
      throw new AppError(
        'Access denied. You do not own this booking.',
        ErrorCode.FORBIDDEN,
      );
    }
    if (booking.status !== BookingStatus.RESERVED) {
      throw new AppError(
        'Documents can only be uploaded for RESERVED bookings.',
        ErrorCode.BAD_USER_INPUT,
      );
    }

    const [
      licenseFrontUrl,
      licenseBackUrl,
      idCardFrontUrl,
      idCardBackUrl,
      addressProofUrl,
    ] = await Promise.all([
      uploadFileIfPresent(input.licenseFrontFile),
      uploadFileIfPresent(input.licenseBackFile),
      uploadFileIfPresent(input.idCardFrontFile),
      uploadFileIfPresent(input.idCardBackFile),
      uploadFileIfPresent(input.addressProofFile),
    ]);

    const documentPayload = {
      licenseFrontUrl,
      licenseBackUrl,
      idCardFrontUrl,
      idCardBackUrl,
      addressProofUrl,
      licenseNumber: input.licenseNumber,
      licenseExpiry: input.licenseExpiry
        ? (input.licenseExpiry instanceof Date ? input.licenseExpiry : new Date(input.licenseExpiry))
        : undefined,
      age:      input.age,
      idNumber: input.idNumber,
      idExpiry: input.idExpiry
        ? (input.idExpiry instanceof Date ? input.idExpiry : new Date(input.idExpiry))
        : undefined,
      address:  input.address,
    };

    // Save strictly to the current booking
    const bookingDocs = await userRepository.upsertBookingDocuments(bookingId, {
      ...documentPayload,
      status:   VerificationStatus.PENDING,
    });

    // Rule 3 & 4: Propagate to user profile ONLY if user explicitly agreed (saveToProfile === true)
    if (saveToProfile) {
      await userRepository.upsertUserDocuments(userId, documentPayload);
      securityLogger.info('User documents updated in profile from booking upload', { userId, bookingId });
    }

    return bookingDocs;
  }

  // ── OCR ────────────────────────────────────────────────────────────────────

  async processOCR(
    file:         UploadPromise,
    documentType: OcrDocumentType,
    side:         OcrDocumentSide,
  ): Promise<OcrResult> {
    let ocrService: import('../documents/gemini.service').OCRService;
    try {
      const mod  = await import('../documents/gemini.service.js');
      ocrService = new mod.OCRService();
    } catch {
      throw new AppError(
        'OCR service is not available (GEMINI_API_KEY not configured).',
        ErrorCode.SERVICE_UNAVAILABLE,
      );
    }

    const { createReadStream, mimetype } = await file;
    validateFileMime(mimetype, 'ocr_document');

    const chunks: Buffer[] = [];
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      createReadStream()
        .on('data',  (chunk: Buffer) => chunks.push(chunk))
        .on('end',   () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });

    const typeMap: Record<OcrDocumentType, 'license' | 'id' | 'address'> = {
      LICENSE:       'license',
      ID_CARD:       'id',
      ADDRESS_PROOF: 'address',
    };
    const sideMap: Record<OcrDocumentSide, 'front' | 'back'> = {
      FRONT: 'front',
      BACK:  'back',
    };

    const result = (await ocrService.extractDocumentData(
      buffer,
      typeMap[documentType],
      sideMap[side],
      mimetype,
    )) as OcrResult;

    return result.isQuotaExceeded
      ? { isQuotaExceeded: true, fallbackUsed: false }
      : result;
  }
}

export const userService = new UserService();