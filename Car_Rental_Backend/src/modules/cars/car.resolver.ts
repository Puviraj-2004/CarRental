import type { FileUpload } from 'graphql-upload-ts';
import { CarStatus } from '@prisma/client';

import { isAdmin } from '../../core/middleware/admin.middleware';
import { GraphQLContext } from '../../graphql/context';
import { carService } from './car.service';
import type {
  Resolvers,
  QueryCarsArgs,
  QueryAvailableCarsArgs,
  QueryCarsByStatusArgs,
  QueryCarAvailabilityCalendarArgs,
} from '../../graphql/__generated__/types';

export const carResolvers: Partial<Resolvers> = {
  Car: {
    basePrice: (parent) => Number(parent.basePrice),
  },

  CarImage: {
    carId: (parent) => parent.carId,
  },

  // Field resolver to resolve the Brand relation nested inside VehicleModel
  VehicleModel: {
    brand: (parent, _, ctx) => 
      ctx.prisma.brand.findUniqueOrThrow({ where: { id: parent.brandId } }),
  },

  Query: {
    car: (_: unknown, { id }: { id: string }) =>
      carService.getCarById(id),

    // ─── New dropdown query resolvers (fetches directly from DB) ───────────
    brands: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) =>
      ctx.prisma.brand.findMany({ orderBy: { name: 'asc' } }),

    models: async (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      const models = await ctx.prisma.vehicleModel.findMany({
        include: { brand: true }   // ← add relation
      });
      return models;
    },

    fuelTypes: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) =>
      ctx.prisma.fuelType.findMany({ orderBy: { name: 'asc' } }),

    cars: (_: unknown, { pagination, filter }: QueryCarsArgs) =>
      carService.getCars(
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
        filter != null
          ? {
              status:     (filter.status     ?? undefined) as CarStatus | undefined,
              brandId:    filter.brandId    ?? undefined,
              modelId:    filter.modelId    ?? undefined,
              fuelTypeId: filter.fuelTypeId ?? undefined,
              minPrice:   filter.minPrice   ?? undefined,
              maxPrice:   filter.maxPrice   ?? undefined,
              search:     filter.search     ?? undefined,
            }
          : undefined,
      ),

    availableCars: (
      _: unknown,
      { startDate, endDate, pagination }: QueryAvailableCarsArgs,
    ) =>
      carService.getAvailableCars(
        startDate,
        endDate,
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
      ),

    carsByStatus: (
      _: unknown,
      { status, pagination }: QueryCarsByStatusArgs,
    ) =>
      carService.getCarsByStatus(
        status as CarStatus,
        pagination != null
          ? { page: pagination.page ?? undefined, pageSize: pagination.pageSize ?? undefined }
          : undefined,
      ),

    carAvailabilityCalendar: (
      _: unknown,
      { carId, month, year }: QueryCarAvailabilityCalendarArgs,
    ) => carService.getAvailabilityCalendar(carId, month, year),
  },

  Mutation: {
    addCar: (_: unknown, { input }: { input: {
      modelId:      string;
      plateNumber:  string;
      fuelTypeId?:  string | null;
      basePrice:    number;
      status?:      string | null;
      primaryImage?: Promise<FileUpload> | null;
    }}, ctx: GraphQLContext) => {
      isAdmin(ctx);

        console.log("📂 Backend resolver received input:", {
        modelId: input.modelId,
        plateNumber: input.plateNumber,
        primaryImage: input.primaryImage,
      });

      return carService.addCar({
        modelId:      input.modelId,
        plateNumber:  input.plateNumber,
        fuelTypeId:   input.fuelTypeId  ?? undefined,
        basePrice:    input.basePrice,
        status:       (input.status as CarStatus | undefined) ?? undefined,
        primaryImage: input.primaryImage ?? undefined,
      });
    },

    updateCar: (_: unknown, { id, input }: { id: string; input: {
      plateNumber?:  string | null;
      fuelTypeId?:   string | null;
      basePrice?:    number | null;
      primaryImage?: Promise<FileUpload> | null;
    }}, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return carService.updateCar(id, {
        plateNumber:  input.plateNumber  ?? undefined,
        fuelTypeId:   input.fuelTypeId  !== undefined ? input.fuelTypeId : undefined,
        basePrice:    input.basePrice    ?? undefined,
        primaryImage: input.primaryImage ?? undefined,
      });
    },

    deleteCar: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return carService.deleteCar(id);
    },

    uploadCarImages: (
      _: unknown,
      { carId, images, setPrimary }: { carId: string; images: Promise<FileUpload>[]; setPrimary?: boolean | null },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return carService.uploadCarImages(carId, images, setPrimary ?? false);
    },

    deleteCarImage: (_: unknown, { imageId }: { imageId: string }, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return carService.deleteCarImage(imageId);
    },

    setPrimaryImage: (
      _: unknown,
      { carId, imageId }: { carId: string; imageId: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return carService.setPrimaryImage(carId, imageId);
    },

    updateCarStatus: (
      _: unknown,
      { id, status }: { id: string; status: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return carService.updateCarStatus(id, status as CarStatus);
    },

    updateCarPricing: (
      _: unknown,
      { id, basePrice }: { id: string; basePrice: number },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return carService.updateCarPricing(id, basePrice);
    },

    scheduleCarMaintenance: (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return carService.scheduleCarMaintenance(id);
    },
  },
};
