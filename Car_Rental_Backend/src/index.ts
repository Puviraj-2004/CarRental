import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './config/env';
validateEnv();

import { startServer } from './server';

startServer().catch((err) => {
  console.error('Fatal: server failed to start', err);
  process.exit(1);
});
