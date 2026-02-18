import { AppError, ErrorCode } from '../errors/AppError';
import { securityLogger } from './logger';

// --- Allowed MIME types by upload context ---
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const DOCUMENT_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  'application/pdf',
]);

// --- Magic byte signatures for real content sniffing ---
const MAGIC_BYTES: { mime: string; bytes: number[] }[] = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
];

/**
 * Detect real MIME type from buffer magic bytes.
 * Returns the detected MIME or null if unrecognized.
 */
function detectMimeFromBuffer(buffer: Buffer): string | null {
  for (const { mime, bytes } of MAGIC_BYTES) {
    if (buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b)) {
      return mime;
    }
  }
  return null;
}

export type UploadContext = 'car_image' | 'verification_document' | 'ocr_document';

/**
 * Validate a file's MIME type against allowed types for the given context.
 * Checks both the declared mimetype and (when a buffer is provided) the actual magic bytes.
 *
 * @param declaredMime - The mimetype reported by the upload client
 * @param context      - Where the file is being uploaded
 * @param buffer       - Optional file buffer for magic-byte verification
 */
export function validateFileMime(
  declaredMime: string | undefined,
  context: UploadContext,
  buffer?: Buffer
): void {
  const allowedSet = context === 'car_image' || context === 'ocr_document'
    ? IMAGE_MIME_TYPES
    : DOCUMENT_MIME_TYPES;

  const contextLabel = context === 'car_image'
    ? 'Car image'
    : context === 'ocr_document'
      ? 'OCR document'
      : 'Verification document';

  const normalizedMime = (declaredMime || '').toLowerCase().trim();

  // 1. Check declared MIME
  if (!normalizedMime || !allowedSet.has(normalizedMime)) {
    const allowed = [...allowedSet].join(', ');
    securityLogger.warn('File upload rejected: invalid MIME type', {
      declaredMime: normalizedMime || '(empty)',
      context,
    });
    throw new AppError(
      `${contextLabel} upload rejected: unsupported file type "${normalizedMime || 'unknown'}". Allowed: ${allowed}`,
      ErrorCode.BAD_USER_INPUT
    );
  }

  // 2. If buffer provided, verify magic bytes match
  if (buffer && buffer.length >= 4) {
    const detectedMime = detectMimeFromBuffer(buffer);

    if (detectedMime && !allowedSet.has(detectedMime)) {
      securityLogger.warn('File upload rejected: magic bytes mismatch', {
        declaredMime: normalizedMime,
        detectedMime,
        context,
      });
      throw new AppError(
        `${contextLabel} upload rejected: file content does not match an allowed type`,
        ErrorCode.BAD_USER_INPUT
      );
    }

    // Detect spoofed extension (declared says PDF but bytes say JPEG, etc.)
    if (detectedMime && detectedMime !== normalizedMime) {
      // Allow image sub-type mismatches (e.g., declared jpeg but detected png) — still valid image
      const bothImages = detectedMime.startsWith('image/') && normalizedMime.startsWith('image/');
      if (!bothImages) {
        securityLogger.warn('File upload rejected: MIME spoofing detected', {
          declaredMime: normalizedMime,
          detectedMime,
          context,
        });
        throw new AppError(
          `${contextLabel} upload rejected: declared type "${normalizedMime}" does not match actual content`,
          ErrorCode.BAD_USER_INPUT
        );
      }
    }
  }
}

/**
 * Validate file extension from filename.
 * Returns true if the extension is allowed for the given context.
 */
export function validateFileExtension(
  filename: string | undefined,
  context: UploadContext
): void {
  if (!filename) return; // No filename to validate — rely on MIME check

  const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  const documentExtensions = new Set([...imageExtensions, '.pdf']);

  const allowedExt = context === 'car_image' || context === 'ocr_document'
    ? imageExtensions
    : documentExtensions;

  const ext = filename.lastIndexOf('.') >= 0
    ? filename.slice(filename.lastIndexOf('.')).toLowerCase()
    : '';

  if (!ext || !allowedExt.has(ext)) {
    const allowed = [...allowedExt].join(', ');
    securityLogger.warn('File upload rejected: invalid extension', {
      filename,
      extension: ext || '(none)',
      context,
    });
    throw new AppError(
      `File upload rejected: unsupported file extension "${ext || 'none'}". Allowed: ${allowed}`,
      ErrorCode.BAD_USER_INPUT
    );
  }
}
