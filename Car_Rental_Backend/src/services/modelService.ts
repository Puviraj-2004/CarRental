import { modelRepository } from '../repositories/modelRepository';
import { handleDatabaseError } from '../errors/errorManager';
import { AppError, ErrorCode } from '../errors/AppError';
import { CreateModelArgs, UpdateModelArgs } from '../types/graphql';

export class ModelService {
  async getModels(brandId?: string) {
    try {
      return await modelRepository.findAll(brandId);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async getModelById(id: string) {
    try {
      const model = await modelRepository.findById(id);
      if (!model) throw new AppError('Model not found', ErrorCode.NOT_FOUND);
      return model;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async createModel(data: CreateModelArgs) {
    if (!data.name?.trim()) {
      throw new AppError('Model name is required', ErrorCode.BAD_USER_INPUT);
    }
    try {
      return await modelRepository.create({
        name: data.name.trim(),
        brandId: data.brandId
      });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async updateModel(id: string, data: UpdateModelArgs) {
    try {
      return await modelRepository.update(id, {
        name: data.name?.trim(),
        brandId: data.brandId
      });
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteModel(id: string) {
    try {
      const carsCount = await modelRepository.countCarsByModel(id);
      if (carsCount > 0) {
        throw new AppError('Cannot delete model with existing cars', ErrorCode.BAD_USER_INPUT);
      }
      await modelRepository.delete(id);
      return true;
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
}

export const modelService = new ModelService();