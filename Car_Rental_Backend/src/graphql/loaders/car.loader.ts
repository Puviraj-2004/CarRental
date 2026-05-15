import DataLoader from 'dataloader';
import { prisma } from '../../config/database';
import type { CarWithRelations, ModelWithBrand, Brand, CarImage } from '../../prisma/types';

export function createBrandLoader(): DataLoader<string, Brand | null> {
  return new DataLoader<string, Brand | null>(async (ids) => {
    const brands = await prisma.brand.findMany({
      where: { id: { in: [...ids] } },
    });
    const map = new Map(brands.map((b) => [b.id, b]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

export function createCarLoader(): DataLoader<string, CarWithRelations | null> {
  return new DataLoader<string, CarWithRelations | null>(async (ids) => {
    const cars = await prisma.car.findMany({
      where:   { id: { in: [...ids] } },
      include: { model: { include: { brand: true } }, images: true, fuelType: true },
    });
    const map = new Map(cars.map((c) => [c.id, c]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

export function createModelLoader(): DataLoader<string, ModelWithBrand | null> {
  return new DataLoader<string, ModelWithBrand | null>(async (ids) => {
    const models = await prisma.vehicleModel.findMany({
      where:   { id: { in: [...ids] } },
      include: { brand: true },
    });
    const map = new Map(models.map((m) => [m.id, m]));
    return ids.map((id) => map.get(id) ?? null);
  });
}

export function createCarImagesLoader(): DataLoader<string, CarImage[]> {
  return new DataLoader<string, CarImage[]>(async (carIds) => {
    const images = await prisma.carImage.findMany({
      where: { carId: { in: [...carIds] } },
    });
    const map = new Map<string, CarImage[]>();
    for (const img of images) {
      const list = map.get(img.carId) ?? [];
      list.push(img);
      map.set(img.carId, list);
    }
    return carIds.map((id) => map.get(id) ?? []);
  });
}