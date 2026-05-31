import { buildApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import logger from './config/logger';
import { startScheduler } from './jobs/scheduler';


export async function startServer(): Promise<void> {
  logger.info('Initialising Car Rental Backend');
  
  await startScheduler();

  const { httpServer, apollo } = await buildApp();

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: env.port }, resolve),
  );

  logger.info(`Server ready at http://localhost:${env.port}/graphql`);

  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info('Graceful shutdown initiated', { signal });

    await apollo.stop();

    httpServer.close(async () => {
      logger.info('HTTP server closed');
      try {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
      } catch (err) {
        logger.error('Error disconnecting Prisma', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
      logger.info('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10_000);
  };


  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
}
