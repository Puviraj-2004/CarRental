import { Prisma } from '@prisma/client';
import { AppError, ErrorCode } from './AppError';

export const handleDatabaseError = (error: any): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.target as string[]) || ['Field'];
        throw new AppError(`${target[0]} already exists`, ErrorCode.ALREADY_EXISTS);
      }
      case 'P2025':
        throw new AppError('The requested record was not found', ErrorCode.NOT_FOUND);
      case 'P2003':
        throw new AppError('This record is being used elsewhere', ErrorCode.BAD_USER_INPUT);
      default:
        throw new AppError('A database error occurred', ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  if (error instanceof AppError) {
    throw error;
  }
  
  console.error('--- UNEXPECTED SYSTEM ERROR ---', error);
  
  throw new AppError('An unexpected internal error occurred', ErrorCode.INTERNAL_SERVER_ERROR);
};