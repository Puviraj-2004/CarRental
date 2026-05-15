import { Request } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma/client';
import { DataLoaders } from './loaders/index';

type PrismaInstance = typeof prisma;

export interface GraphQLContext {
  prisma: PrismaInstance;
  req: Request;
  userId?: string;
  role?: Role;
  loaders: DataLoaders;
}
