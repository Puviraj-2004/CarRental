import prisma from '../utils/database';

export class ModelRepository {
  async findAll(brandId?: string) {
    return await prisma.vehicleModel.findMany({
      where: brandId ? { brandId } : {},
      include: { brand: true },
      orderBy: { name: 'asc' }
    });
  }

  async findById(id: string) {
    return await prisma.vehicleModel.findUnique({
      where: { id },
      include: { brand: true }
    });
  }

  async create(data: { name: string; brandId: string }) {
    return await prisma.vehicleModel.create({
      data,
      include: { brand: true }
    });
  }

  async update(id: string, data: { name?: string; brandId?: string }) {
    return await prisma.vehicleModel.update({
      where: { id },
      data,
      include: { brand: true }
    });
  }

  async delete(id: string) {
    return await prisma.vehicleModel.delete({
      where: { id }
    });
  }

  async countCarsByModel(modelId: string) {
    return await prisma.car.count({
      where: { modelId }
    });
  }
}

export const modelRepository = new ModelRepository();