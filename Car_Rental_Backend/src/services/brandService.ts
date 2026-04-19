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
      handleDatabaseError(error);
    }
  }

  /**
   * Create a new brand with basic validation
   */
  async createBrand(data: CreateBrandArgs) {
    if (!data.name?.trim()) {
      throw new AppError('Brand name cannot be empty', ErrorCode.BAD_USER_INPUT);
    }

    try {
      return await brandRepository.create({
        name: data.name.trim(),
        logoUrl: data.logoUrl
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Update brand details
   */
  async updateBrand(id: string, data: UpdateBrandArgs) {
    try {
      return await brandRepository.update(id, {
        name: data.name?.trim(),
        logoUrl: data.logoUrl
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Delete a brand only if it has no associated models
   */
  async deleteBrand(id: string) {
    try {
      // Logic: Check if models exist before deleting
      const modelsCount = await brandRepository.countModelsByBrand(id);
      
      if (modelsCount > 0) {
        throw new AppError(
          'Cannot delete brand. Please delete associated models first.',
          ErrorCode.BAD_USER_INPUT
        );
      }

      await brandRepository.delete(id);
      return true;
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export const brandService = new BrandService();