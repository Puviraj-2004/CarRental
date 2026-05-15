import { Role, VerificationStatus } from '@prisma/client';
import type { FileUpload } from 'graphql-upload-ts';

import { AppError, ErrorCode } from '../../core/errors/AppError';
import { hashPassword, comparePasswords } from '../../core/utils/jwt';
import { normalizePagination } from '../../core/utils/pagination';
import { logSecurityEvent, securityLogger } from '../../config/logger';
import cloudinary from '../../config/cloudinary';
import { validatePassword } from '../../core/utils/validation';
import { validateFileMime } from '../../core/utils/fileValidation';
import { userRepository } from './user.repository';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Shape of a graphql-upload-ts file after it resolves.
 * We reference the FileUpload promise so the resolver stays clean.
 */
type UploadPromise = Promise<FileUpload>;

export interface DocumentsInput {
  licenseFrontFile?: UploadPromise;
  licenseBackFile?:  UploadPromise;
  idCardFrontFile?:  UploadPromise;
  idCardBackFile?:   UploadPromise;
  addressProofFile?: UploadPromise;
  licenseNumber?:    string;
  licenseExpiry?:    string;
  age?:              number;
  idNumber?:         string;
  idExpiry?:         string;
  address?:          string;
}

/** Subset of DocumentType enum values used for OCR dispatch. */
export type OcrDocumentType = 'LICENSE' | 'ID_CARD' | 'ADDRESS_PROOF';
/** Subset of DocumentSide enum values used for OCR dispatch. */
export type OcrDocumentSide = 'FRONT' | 'BACK';

// ─── Cloudinary upload helpers ────────────────────────────────────────────────

function uploadStream(createReadStream: () => NodeJS.ReadableStream): Promise<string> {
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

async function uploadFileIfPresent(filePromise?: UploadPromise): Promise<string | undefined> {
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

// ─── OCR result shape ─────────────────────────────────────────────────────────

export interface OcrResult {
  licenseNumber?:    string | null;
  licenseExpiry?:    string | null;
  age?:              number | null;
  idNumber?:         string | null;
  idExpiry?:         string | null;
  address?:          string | null;
  fallbackUsed?:     boolean;
  isQuotaExceeded?:  boolean;
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

  getAllUsers(pagination?: { page?: number; pageSize?: number; search?: string }) {
    return userRepository.findPaginated(normalizePagination(pagination));
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return false;
    return !(await userRepository.findByEmail(normalized));
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user?.password) throw new AppError('User not found.', ErrorCode.NOT_FOUND);

    const valid = await comparePasswords(currentPassword, user.password);
    if (!valid) {
      throw new AppError('Current password is incorrect.', ErrorCode.UNAUTHENTICATED);
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.isValid) {
      throw new AppError(pwCheck.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    await userRepository.updateUser(userId, { password: await hashPassword(newPassword) });
    return true;
  }

  /**
   * Role is already a Prisma `Role` enum value — the resolver receives it
   * directly from GraphQL after codegen maps the enum.  No cast needed.
   */
  async updateUserRole(id: string, role: Role) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found.', ErrorCode.NOT_FOUND);

    logSecurityEvent.adminAction({ action: 'UPDATE_USER_ROLE', adminId: id, targetId: id });
    return userRepository.updateUser(id, { role });
  }

  async deleteUser(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('User not found.', ErrorCode.NOT_FOUND);

    const active = await userRepository.countActiveBookings(id);
    if (active > 0) {
      throw new AppError('Cannot delete a user with active bookings.', ErrorCode.BAD_USER_INPUT);
    }

    return userRepository.deleteUser(id);
  }

  // ── Documents ──────────────────────────────────────────────────────────────

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
      licenseExpiry: input.licenseExpiry ? new Date(input.licenseExpiry) : undefined,
      age:           input.age,
      idNumber:      input.idNumber,
      idExpiry:      input.idExpiry ? new Date(input.idExpiry) : undefined,
      address:       input.address,
    });
  }

  async adminVerifyDocuments(userId: string, status: VerificationStatus) {
    const docs = await userRepository.findDocumentsByUserId(userId);
    if (!docs) throw new AppError('No documents found for this user.', ErrorCode.NOT_FOUND);
    return userRepository.updateDocumentsStatus(userId, status);
  }

  // ── OCR ────────────────────────────────────────────────────────────────────

  async processOCR(
    file:         UploadPromise,
    documentType: OcrDocumentType,
    side:         OcrDocumentSide,
  ): Promise<OcrResult> {
    // Dynamic import — avoids crashing startup when GEMINI_API_KEY is absent
    let ocrService: InstanceType<typeof import('../documents/gemini.service.js').OCRService>;
    try {
      const { OCRService } = await import('../documents/gemini.service.js');
      ocrService = new OCRService();
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

    const result = await ocrService.extractDocumentData(
      buffer,
      typeMap[documentType],
      sideMap[side],
      mimetype,
    ) as OcrResult;

    return result.isQuotaExceeded
      ? { isQuotaExceeded: true, fallbackUsed: false }
      : result;
  }
}

export const userService = new UserService();