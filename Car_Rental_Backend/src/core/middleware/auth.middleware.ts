import { AppError, ErrorCode } from '../errors/AppError';
import { GraphQLContext } from '../../graphql/context';

/** Throws UNAUTHENTICATED if the request has no valid session. */
export const isAuthenticated = (context: GraphQLContext): void => {
  if (!context.userId) {
    throw new AppError(
      'Authentication required. Please log in.',
      ErrorCode.UNAUTHENTICATED,
    );
  }
};

export const isOwnerOrAdmin = (
  context: GraphQLContext,
  ownerId: string,
): void => {
  isAuthenticated(context);
  if (context.role !== 'ADMIN' && context.userId !== ownerId) {
    throw new AppError(
      'Access denied. You do not own this resource.',
      ErrorCode.FORBIDDEN,
    );
  }
};
