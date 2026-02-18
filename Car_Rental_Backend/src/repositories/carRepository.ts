import prisma from '../utils/database';
import { Prisma, BookingStatus } from '@prisma/client';
import { NormalizedPagination, buildPaginatedResult, PaginatedResult } from '../utils/pagination';
import { AppError, ErrorCode } from '../errors/AppError';

export const CAR_INCLUDES = {
  model: { include: { brand: true } },
  images: true,
  bookings: true,
};

export class CarRepository {
  async findMany(where: Prisma.CarWhereInput) {
    return await prisma.car.findMany({
      where,
      include: { model: { include: { brand: true } }, images: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Paginated findMany with server-side search.
   * Searches across: plate number, brand name, model name.
   */
  async findPaginated(
    pagination: NormalizedPagination,
    extraWhere: Prisma.CarWhereInput = {}
  ): Promise<PaginatedResult<any>> {
    const where: Prisma.CarWhereInput = { ...extraWhere };

    // Server-side search across plate, brand name, model name
    if (pagination.search) {
      (where as any).AND = [
        ...(Array.isArray((where as any).AND) ? (where as any).AND : []),
        {
          OR: [
            { plateNumber: { contains: pagination.search, mode: 'insensitive' } },
            { model: { name: { contains: pagination.search, mode: 'insensitive' } } },
            { model: { brand: { name: { contains: pagination.search, mode: 'insensitive' } } } },
          ],
        },
      ];
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        include: { model: { include: { brand: true } }, images: true },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
      prisma.car.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, pagination.page, pagination.pageSize);
  }

  async findUnique(id: string) {
    return await prisma.car.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        images: { orderBy: { isPrimary: 'desc' } },
        bookings: true
      }
    });
  }

  async findAllModels() {
    return await prisma.vehicleModel.findMany({ 
      include: { brand: true },
      orderBy: { name: 'asc' } 
    });
  }

  async findBrands() {
    return await prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async findModelsByBrand(brandId: string) {
    return await prisma.vehicleModel.findMany({ 
      where: { brandId }, 
      orderBy: { name: 'asc' } 
    });
  }

  // Admin CRUD - Brands
  async createBrand(data: { name: string; logoUrl?: string }) {
    return await prisma.brand.create({ data });
  }
  async updateBrand(id: string, data: { name?: string; logoUrl?: string }) {
    return await prisma.brand.update({ where: { id }, data });
  }
  async deleteBrand(id: string) {
    return await prisma.brand.delete({ where: { id } });
  }

  // Admin CRUD - Models
  async createModel(data: { name: string; brandId: string }) {
    return await prisma.vehicleModel.create({ data });
  }
  async updateModel(id: string, data: { name?: string }) {
    return await prisma.vehicleModel.update({ where: { id }, data });
  }
  async deleteModel(id: string) {
    // First check if model exists
    const existingModel = await prisma.vehicleModel.findUnique({
      where: { id }
    });
    
    if (!existingModel) {
      throw new AppError(`Model with ID ${id} not found`, ErrorCode.NOT_FOUND);
    }
    
    await prisma.vehicleModel.delete({ where: { id } });
    return true; // Return boolean instead of deleted record
  }

  // Admin CRUD - Cars
  async createCar(data: Prisma.CarCreateInput) {
    return await prisma.car.create({
      data,
      include: { model: { include: { brand: true } } }
    });
  }
  async updateCar(id: string, data: Prisma.CarUpdateInput) {
    return await prisma.car.update({
      where: { id },
      data,
      include: { model: { include: { brand: true } } }
    });
  }
  async deleteCar(id: string) {
    return await prisma.car.delete({ where: { id } });
  }

  // Image Management
  async findImageById(id: string) {
    return await prisma.carImage.findUnique({ where: { id } });
  }
  async createImage(data: Prisma.CarImageCreateInput) {
    return await prisma.carImage.create({ data });
  }
  async deleteImage(id: string) {
    return await prisma.carImage.delete({ where: { id } });
  }
  async updateManyImages(where: Prisma.CarImageWhereInput, data: Prisma.CarImageUpdateManyMutationInput) {
    return await prisma.carImage.updateMany({ where, data });
  }
  async updateImage(id: string, data: Prisma.CarImageUpdateInput) {
    return await prisma.carImage.update({ where: { id }, data });
  }

  // Helper methods for business logic validation
  async countModelsByBrand(brandId: string): Promise<number> {
    return await prisma.vehicleModel.count({
      where: { brandId }
    });
  }

  async countCarsByModel(modelId: string): Promise<number> {
    return await prisma.car.count({
      where: { modelId }
    });
  }

  async countActiveBookings(carId: string): Promise<number> {
    return await prisma.booking.count({
      where: {
        carId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.VERIFIED, BookingStatus.CONFIRMED, BookingStatus.ONGOING]
        }
      }
    });
  }
}

export const carRepository = new CarRepository();