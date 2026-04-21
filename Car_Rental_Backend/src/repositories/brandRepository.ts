import { prisma } from '../utils/database';

export class BrandRepository {
  /**
   * Fetch all brands with their associated models
   */
  async findAll() {
    return await prisma.brand.findMany({
      include: {
        models: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Find a single brand by its ID
   */
  async findById(id: string) {
    return await prisma.brand.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new brand in the database
   */
  async create(data: { name: string; logoUrl?: string | null; logoPublicId?: string | null }) {
    return await prisma.brand.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
      },
    });
  }

  /**
   * Update an existing brand record
   */
  async update(id: string, data: { name?: string; logoUrl?: string | null; logoPublicId?: string | null }) {
    return await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
      },
    });
  }

  /**
   * Delete a brand record from the database
   */
  async delete(id: string) {
    return await prisma.brand.delete({
      where: { id },
    });
  }

  /**
   * Count how many models are linked to this brand
   * Used for safety check before deletion
   */
  async countModelsByBrand(brandId: string) {
    return await prisma.vehicleModel.count({
      where: { brandId },
    });
  }
}

export const brandRepository = new BrandRepository();