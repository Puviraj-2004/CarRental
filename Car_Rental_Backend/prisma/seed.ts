import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initialBrands, initialPlatformSettings } from '../src/db/data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // --- 1. ADMIN USER SEEDING ---
  const adminEmail = 'admin@carrental.com';
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      fullName: 'Super Admin',
      role: Role.ADMIN,
      emailVerified: true,
    },
    create: {
      email: adminEmail,
      fullName: 'Super Admin',
      password: hashedPassword,
      phoneNumber: '+33612345678',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // --- 2. PLATFORM SETTINGS SEEDING (Using data.ts) ---
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    await prisma.platformSettings.create({
      data: {
        ...initialPlatformSettings,
        youngDriverMinAge: 25,
        youngDriverFee: 30.0,
      },
    });
    console.log('✅ Platform Settings seeded from data.ts!');
  }

  // --- 3. BRANDS & MODELS SEEDING (The Logic) ---
  console.log('📦 Seeding Brands and Models...');

  for (const item of initialBrands) {
    const brand = await prisma.brand.upsert({
      where: { name: item.name },
      update: {}, 
      create: {
        name: item.name,
      },
    });

    for (const modelName of item.models) {
      await prisma.vehicleModel.upsert({
        where: {
          name_brandId: {
            name: modelName,
            brandId: brand.id,
          },
        },
        update: {},
        create: {
          name: modelName,
          brandId: brand.id,
        },
      });
    }
  }
  console.log('✅ Brands and Models seeded successfully!');

  console.log('🎉 All seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });