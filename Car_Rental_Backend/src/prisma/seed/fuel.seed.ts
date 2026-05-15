import prisma from '../client';

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID'];

export async function seedFuelTypes(): Promise<void> {
  console.log('Seeding fuel types...');
  for (const name of FUEL_TYPES) {
    await prisma.fuelType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✓ ${FUEL_TYPES.length} fuel types seeded`);
}
