import { Car, CarImage, Brand, VehicleModel } from '@prisma/client';
import { isAdmin } from '../../utils/authguard';
import { carService } from '../../services/carService';
import { 
  GraphQLContext, 
  CreateCarInput, 
  UpdateCarInput, 
  CarFilterInput, 
  PaginationInput 
} from '../../types/graphql';

type CarWithRelations = Car & {
  brand?: Brand;
  model?: VehicleModel;
  images?: CarImage[];
};

export const carResolvers = {
  Query: {
    cars: async (_: unknown, { filter, pagination }: { filter: CarFilterInput, pagination: PaginationInput }) => {
      return await carService.getCars(filter, pagination);
    },
    car: async (_: unknown, { id }: { id: string }) => {
      return await carService.getCarById(id);
    },
  },

  Mutation: {
    createCar: async (_: unknown, { input }: { input: CreateCarInput }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.createCar(input);
    },

    updateCar: async (_: unknown, { id, input }: { id: string, input: UpdateCarInput }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.updateCar(id, input);
    },

    deleteCar: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.deleteCar(id);
    },

    // Image Mutations
    addCarImage: async (_: unknown, { carId, url, publicId, isPrimary }: { carId: string, url: string, publicId: string, isPrimary?: boolean }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.addCarImage(carId, url, publicId, isPrimary);
    },

    setPrimaryCarImage: async (_: unknown, { carId, imageId }: { carId: string, imageId: string }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.setPrimaryImage(carId, imageId);
    },

    deleteCarImage: async (_: unknown, { imageId }: { imageId: string }, context: GraphQLContext) => {
      isAdmin(context);
      return await carService.deleteImage(imageId);
    }
  },

  Car: {
    brand: async (parent: CarWithRelations, _: unknown, { loaders }: GraphQLContext) => {
      if (parent.brand) return parent.brand;
      return await loaders.brandLoader.load(parent.brandId);
    },
    model: async (parent: CarWithRelations, _: unknown, { loaders }: GraphQLContext) => {
      if (parent.model) return parent.model;
      return await loaders.modelLoader.load(parent.modelId);
    },
    images: async (parent: CarWithRelations) => {
      return parent.images || [];
    }
  }
};