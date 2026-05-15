import { runAllSeeds } from '../src/prisma/seed/index';

runAllSeeds()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });