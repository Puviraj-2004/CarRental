import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError';
import logger from '../../config/logger';

const HTTP_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.BAD_USER_INPUT]:        400,
  [ErrorCode.UNAUTHENTICATED]:       401,
  [ErrorCode.FORBIDDEN]:             403,
  [ErrorCode.NOT_FOUND]:             404,
  [ErrorCode.ALREADY_EXISTS]:        409,
  [ErrorCode.RATE_LIMIT_EXCEEDED]:   429,
  [ErrorCode.UPLOAD_ERROR]:          422,
  [ErrorCode.CONFIGURATION_ERROR]:   503,
  [ErrorCode.SERVICE_UNAVAILABLE]:   503,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn('Application error', { code: err.code, message: err.message });
    res.status(HTTP_STATUS[err.code] ?? 400).json({
      error: err.message,
      code:  err.code,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error('Unhandled error', { error: message });
  res.status(500).json({ error: 'Internal server error' });
}
