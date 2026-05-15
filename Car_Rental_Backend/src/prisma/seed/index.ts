import prisma from '../client';
import { seedAdmin }          from './admin.seed';
import { seedBrands }         from './brands.seed';
import { seedFuelTypes }      from './fuel.seed';
import { seedPaymentMethods } from './payment.seed';

export async function runAllSeeds(): Promise<void> {
  console.log('🌱 Starting database seed...');

  await seedAdmin();
  await seedFuelTypes();
  await seedPaymentMethods();
  await seedBrands();

  console.log('🎉 All seeding completed successfully!');
}

// Allow running directly: ts-node src/prisma/seed/index.ts
if (require.main === module) {
  runAllSeeds()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
