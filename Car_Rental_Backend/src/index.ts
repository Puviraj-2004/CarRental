import dotenv from 'dotenv';
dotenv.config();

// ─── Global error handlers (must be set before any async operations) ───
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION – shutting down', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED REJECTION – shutting down', reason);
  process.exit(1);
});

import { validateEnv } from './config/env';
validateEnv();

import { startServer } from './server';

startServer().catch((err) => {
  console.error('Fatal: server failed to start', err);
  process.exit(1);
});