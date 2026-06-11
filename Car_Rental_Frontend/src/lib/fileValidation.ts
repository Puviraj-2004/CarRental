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

export type UploadContext = 'car_image' | 'verification_document' | 'ocr_document';

// --- Max file sizes (in MB) by upload context ---
const MAX_SIZES_MB: Record<UploadContext, number> = {
  car_image: 10,             // 10MB limit for Cloudinary image uploads [2]
  verification_document: 10, // 10MB limit
  ocr_document: 10,          // 10MB limit
};

/**
 * Asserts that the file's MIME type matches the allowed types for the upload context.
 */
export function validateFileMime(
  declaredMime: string | undefined,
  context: UploadContext
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

  if (!normalizedMime || !allowedSet.has(normalizedMime)) {
    const allowed = [...allowedSet].join(', ');
    throw new Error(
      `${contextLabel} upload rejected: unsupported file type "${normalizedMime || 'unknown'}". Allowed: ${allowed}`
    );
  }
}

/**
 * Asserts that the file's extension matches the allowed extensions for the upload context.
 */
export function validateFileExtension(
  filename: string | undefined,
  context: UploadContext
): void {
  if (!filename) return;

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
    throw new Error(
      `File upload rejected: unsupported file extension "${ext || 'none'}". Allowed: ${allowed}`
    );
  }
}

/**
 * Asserts that the file size is within acceptable limits for the context.
 */
export function validateFileSize(
  sizeInBytes: number,
  filename: string | undefined,
  context: UploadContext
): void {
  const maxMb = MAX_SIZES_MB[context] || 10;
  const maxBytes = maxMb * 1024 * 1024;

  if (sizeInBytes > maxBytes) {
    const currentSizeMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File "${filename || 'unknown'}" upload rejected: size ${currentSizeMB}MB exceeds the ${maxMb}MB limit.`
    );
  }
}