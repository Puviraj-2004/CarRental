import multer from 'multer';
import type { RequestHandler } from 'express';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

export const uploadSingle: RequestHandler = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file') as unknown as RequestHandler;

export const uploadMultiple = (fieldName: string, maxCount = 5): RequestHandler =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).array(fieldName, maxCount) as unknown as RequestHandler;
