import { brandRepository } from '../repositories/brandRepository';
import { AppError, ErrorCode } from '../errors/AppError';
import { handleDatabaseError } from '../errors/errorManager';
import { CreateBrandArgs, UpdateBrandArgs } from '../types/graphql';

export class BrandService {
  /**
   * Get all brands from the database
   */
  async getBrands() {
    try {
      return await brandRepository.findAll();
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  /**
   * Create a new brand.
   * Performs an explicit duplicate check before inserting so the client
   * always receives a clean "Brand already exists" error rather than a
   * raw Prisma constraint violation.
   */
  async createBrand(data: CreateBrandArgs) {
    if (!data.name?.trim()) {
      throw new AppError('Brand name cannot be empty', ErrorCode.BAD_USER_INPUT);
    }

    const normalizedName = data.name.trim();

    try {
      const existing = await brandRepository.findByName(normalizedName);
      if (existing) {
        throw new AppError(
          `Brand "${normalizedName}" already exists`,
          ErrorCode.ALREADY_EXISTS,
        );
      }

      return await brandRepository.create({
        name: normalizedName,
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
      });
    } catch (error) {
      // Re-throw our own errors directly — do not pass them through
      // handleDatabaseError, which would wrap them unnecessarily.
      if (error instanceof AppError) throw error;
      throw handleDatabaseError(error);
    }
  }

  /**
   * Update brand details
   */
  async updateBrand(id: string, data: UpdateBrandArgs) {
    try {
      return await brandRepository.update(id, {
        name: data.name?.trim(),
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw handleDatabaseError(error);
    }
  }

  /**
   * Delete a brand only if it has no associated models
   */
  async deleteBrand(id: string) {
    try {
      const modelsCount = await brandRepository.countModelsByBrand(id);

      if (modelsCount > 0) {
        throw new AppError(
          'Cannot delete brand. Please delete associated models first.',
          ErrorCode.BAD_USER_INPUT,
        );
      }

      await brandRepository.delete(id);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw handleDatabaseError(error);
    }
  }
}

export const brandService = new BrandService();