import { GraphQLFormattedError } from 'graphql';
import { AppError, ErrorCode } from './AppError';
import logger from '../../config/logger';

// Maps internal ErrorCode → the string Apollo sends to the client
const CODE_MAP: Record<ErrorCode, string> = {
  [ErrorCode.BAD_USER_INPUT]:        'BAD_USER_INPUT',
  [ErrorCode.UNAUTHENTICATED]:       'UNAUTHENTICATED',
  [ErrorCode.FORBIDDEN]:             'FORBIDDEN',
  [ErrorCode.NOT_FOUND]:             'NOT_FOUND',
  [ErrorCode.ALREADY_EXISTS]:        'ALREADY_EXISTS',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [ErrorCode.UPLOAD_ERROR]:          'UPLOAD_ERROR',
  // Config errors must NOT leak details to clients
  [ErrorCode.CONFIGURATION_ERROR]:   'INTERNAL_SERVER_ERROR',
  [ErrorCode.RATE_LIMIT_EXCEEDED]:   'RATE_LIMIT_EXCEEDED',
  [ErrorCode.SERVICE_UNAVAILABLE]:   'SERVICE_UNAVAILABLE',
};

/**
 * Pass this to Apollo Server's `formatError` option.
 *
 * - AppError → exposes our message + mapped code (safe, intentional errors)
 * - Unknown error in production → generic message, hides implementation details
 * - Unknown error in development → passes through the full formatted error
 */
export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
  originalError: unknown,
): GraphQLFormattedError {
  if (originalError instanceof AppError) {
    return {
      message: originalError.message,
      extensions: {
        code: CODE_MAP[originalError.code] ?? 'INTERNAL_SERVER_ERROR',
      },
    };
  }

  // Log unexpected errors so they are visible in the server logs
  if (!(originalError instanceof AppError)) {
    logger.error('Unhandled GraphQL error', {
      message: originalError instanceof Error ? originalError.message : String(originalError),
      stack: originalError instanceof Error ? originalError.stack : undefined,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'An unexpected error occurred.',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  }

  // Development: return full detail including stack trace
  return formattedError;
}
