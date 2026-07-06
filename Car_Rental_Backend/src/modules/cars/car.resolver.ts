import { CarStatus } from '@prisma/client';

import { isAdmin } from '../../core/middleware/admin.middleware';
import { GraphQLContext } from '../../graphql/context';
import { carService } from './car.service';
import { AppError, ErrorCode } from '../../core/errors/AppError';
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

  VehicleModel: {
    brand: (parent, _, ctx) => 
      ctx.prisma.brand.findUniqueOrThrow({ where: { id: parent.brandId } }),
  },

  Query: {
    car: (_: unknown, { id }: { id: string }) =>
      carService.getCarById(id),

    brands: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) =>
      ctx.prisma.brand.findMany({ orderBy: { name: 'asc' } }),

    models: async (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      return ctx.prisma.vehicleModel.findMany({
        include: { brand: true }
      });
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
              statusNot:  (filter.statusNot  ?? undefined) as CarStatus | undefined,
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

    // Resolves secure Cloudinary credentials for the frontend client
    cloudinarySignature: (_: unknown, { folder }: { folder: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required to access upload routes.', ErrorCode.UNAUTHENTICATED);
      }
      return carService.getUploadSignature(folder);
    },
  },

  Mutation: {
    addCar: (_: unknown, { input }: { input: {
      modelId:      string;
      plateNumber:  string;
      fuelTypeId?:  string | null;
      basePrice:    number;
      status?:      string | null;
      primaryImage?: { url: string; publicId: string } | null; // <-- Updated: Expects metadata object
    }}, ctx: GraphQLContext) => {
      isAdmin(ctx);

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
      primaryImage?: { url: string; publicId: string } | null; // <-- Updated: Expects metadata object
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
      { carId, images, setPrimary }: { carId: string; images: { url: string; publicId: string }[]; setPrimary?: boolean | null }, // <-- Updated: Array of metadata
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

    // ── Brand CRUD ─────────────────────────────────────────────────────────
    createBrand: async (
      _: unknown,
      { name }: { name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.brand.create({ data: { name } });
    },

    updateBrand: async (
      _: unknown,
      { id, name }: { id: string; name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.brand.update({ where: { id }, data: { name } });
    },

    deleteBrand: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      await ctx.prisma.brand.delete({ where: { id } });
      return true;
    },

    // ── Model CRUD ─────────────────────────────────────────────────────────
    createModel: async (
      _: unknown,
      { name, brandId }: { name: string; brandId: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.vehicleModel.create({
        data: { name, brandId },
        include: { brand: true },
      });
    },

    updateModel: async (
      _: unknown,
      { id, name, brandId }: { id: string; name?: string | null; brandId?: string | null },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      const data: { name?: string; brandId?: string } = {};
      if (name !== undefined && name !== null) data.name = name;
      if (brandId !== undefined && brandId !== null) data.brandId = brandId;
      
      return ctx.prisma.vehicleModel.update({
        where: { id },
        data,
        include: { brand: true },
      });
    },

    deleteModel: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      await ctx.prisma.vehicleModel.delete({ where: { id } });
      return true;
    },

    // ── FuelType CRUD ──────────────────────────────────────────────────────
    createFuelType: async (
      _: unknown,
      { name }: { name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.fuelType.create({ data: { name } });
    },

    updateFuelType: async (
      _: unknown,
      { id, name }: { id: string; name: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return ctx.prisma.fuelType.update({ where: { id }, data: { name } });
    },

    deleteFuelType: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      await ctx.prisma.fuelType.delete({ where: { id } });
      return true;
    },
  },
};
