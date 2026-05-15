export enum ErrorCode {
  BAD_USER_INPUT        = 'BAD_USER_INPUT',
  UNAUTHENTICATED       = 'UNAUTHENTICATED',
  FORBIDDEN             = 'FORBIDDEN',
  NOT_FOUND             = 'NOT_FOUND',
  ALREADY_EXISTS        = 'ALREADY_EXISTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UPLOAD_ERROR          = 'UPLOAD_ERROR',
  CONFIGURATION_ERROR   = 'CONFIGURATION_ERROR',
  RATE_LIMIT_EXCEEDED   = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE   = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  public readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
