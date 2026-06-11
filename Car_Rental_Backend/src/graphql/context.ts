import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma/client';
import { DataLoaders } from './loaders/index';

type PrismaInstance = typeof prisma;

export interface GraphQLContext {
  prisma: PrismaInstance;
  req: Request;
  res: Response;      
  userId?: string;
  role?: Role;
  loaders: DataLoaders;
}