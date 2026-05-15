import { AppError, ErrorCode } from '../errors/AppError';
import { GraphQLContext } from '../../graphql/context';
import { isAuthenticated } from './auth.middleware';

/** Throws FORBIDDEN if the caller is not an admin. Checks authentication first. */
export const isAdmin = (context: GraphQLContext): void => {
  isAuthenticated(context);
  if (context.role !== 'ADMIN') {
    throw new AppError(
      'Access denied. Admin rights required.',
      ErrorCode.FORBIDDEN,
    );
  }
};
