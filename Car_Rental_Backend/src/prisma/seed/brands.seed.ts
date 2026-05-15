import prisma from '../client';

const BRANDS: { name: string; models: string[] }[] = [
  { name: 'Renault',       models: ['Clio', 'Captur', 'Megane', 'Zoe', 'Austral'] },
  { name: 'Peugeot',       models: ['208', '2008', '308', '3008', '5008'] },
  { name: 'Citroën',       models: ['C3', 'C4', 'C5 X', 'Berlingo'] },
  { name: 'Toyota',        models: ['Yaris', 'Corolla', 'RAV4', 'C-HR', 'Aygo X'] },
  { name: 'Volkswagen',    models: ['Golf', 'Polo', 'Tiguan', 'ID.3', 'ID.4'] },
  { name: 'BMW',           models: ['1 Series', '3 Series', 'X1', 'X3', 'i4'] },
  { name: 'Mercedes-Benz', models: ['A-Class', 'C-Class', 'E-Class', 'GLA', 'EQC'] },
  { name: 'Tesla',         models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { name: 'Audi',          models: ['A1', 'A3', 'A4', 'Q3', 'Q5'] },
  { name: 'Ford',          models: ['Fiesta', 'Focus', 'Puma', 'Kuga'] },
  { name: 'Dacia',         models: ['Sandero', 'Duster', 'Logan', 'Spring'] },
  { name: 'Hyundai',       models: ['i20', 'i30', 'Kona', 'Tucson'] },
  { name: 'Kia',           models: ['Picanto', 'Stonic', 'Sportage', 'EV6'] },
  { name: 'Opel',          models: ['Corsa', 'Astra', 'Mokka', 'Crossland'] },
];

export async function seedBrands(): Promise<void> {
  console.log('Seeding brands and models...');

  for (const item of BRANDS) {
    const brand = await prisma.brand.upsert({
      where:  { name: item.name },
      update: {},
      create: { name: item.name },
    });

    for (const modelName of item.models) {
      await prisma.vehicleModel.upsert({
        where:  { name_brandId: { name: modelName, brandId: brand.id } },
        update: {},
        create: { name: modelName, brandId: brand.id },
      });
    }
  }

  const totalModels = BRANDS.reduce((sum, b) => sum + b.models.length, 0);
  console.log(`✓ ${BRANDS.length} brands and ${totalModels} models seeded`);
}
