import { AppError, ErrorCode } from '../errors/AppError';
import { GraphQLContext } from '../types/graphql';

// 1. Check if User is Logged In
export const isAuthenticated = (context: GraphQLContext) => {
  if (!context.userId) {
    throw new AppError('Authentication required. Please login.', ErrorCode.UNAUTHENTICATED);
  }
};

// 2. Check if User is Admin
export const isAdmin = (context: GraphQLContext) => {
  isAuthenticated(context); // First check login

  if (context.role !== 'ADMIN') {
    throw new AppError('Access denied. Admin rights required.', ErrorCode.FORBIDDEN);
  }
};

// 3. Check if User owns the data OR is Admin
export const isOwnerOrAdmin = (context: GraphQLContext, ownerId: string) => {
  isAuthenticated(context);

  if (context.role !== 'ADMIN' && context.userId !== ownerId) {
    throw new AppError('Access denied. You do not own this resource.', ErrorCode.FORBIDDEN);
  }
};