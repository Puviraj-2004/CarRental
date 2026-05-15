import { PrismaClient } from '@prisma/client';
import {env} from '../config/env';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.nodeEnv === 'development'
      ? ['query', 'warn', 'error']
      : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (env.nodeEnv !== 'production') globalThis.prisma = prisma;