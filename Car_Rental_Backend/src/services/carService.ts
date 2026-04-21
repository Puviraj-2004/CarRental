import { carRepository } from '../repositories/carRepository';
import { validateCarData } from '../utils/validation';
import { AppError, ErrorCode } from '../errors/AppError';
import { Prisma, CarStatus, BookingStatus } from '@prisma/client';
import { PaginationInput, normalizePagination } from '../utils/pagination';
import {
  CarFilterInput,
  CreateCarInput,
  UpdateCarInput
} from '../types/graphql';

export class CarService {
  private buildBookingAvailabilityFilter(startDateTime: Date, endDateTime: Date) {
    const bufferMs = 24 * 60 * 60 * 1000;

    const overlapNoBuffer = { 
      AND: [{ startDate: { lt: endDateTime } }, { endDate: { gt: startDateTime } }] 
    };
    
    const overlapWithBuffer = {
      OR: [
        { 
          AND: [
            { startDate: { lt: new Date(endDateTime.getTime() + bufferMs) } }, 
            { endDate: { gt: new Date(startDateTime.getTime() - bufferMs) } }
          ] 
        }
      ]
    };

    return {
      none: {
        OR: [
          {
            AND: [
              { status: { in: [BookingStatus.PENDING, BookingStatus.VERIFIED] } },
              overlapNoBuffer
            ]
          },
          {
            AND: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] } },
              overlapWithBuffer
            ]
          }
        ]
      }
    };
  }

  private buildStatusFilter(includeOutOfService: boolean = false): Prisma.CarWhereInput {
    return includeOutOfService ? {} : { status: { not: CarStatus.OUT_OF_SERVICE } };
  }

  async getCars(filter?: CarFilterInput, pagination?: PaginationInput) {
    const where: Prisma.CarWhereInput = {};

    if (filter) {
      if (filter.brandIds?.length) where.brandId = { in: filter.brandIds };
      if (filter.modelIds?.length) where.modelId = { in: filter.modelIds };
      if (filter.fuelTypes?.length) where.fuelType = { in: filter.fuelTypes };
      if (filter.transmissions?.length) where.transmission = { in: filter.transmissions };
      if (filter.statuses?.length) where.status = { in: filter.statuses };
      
      // விலை ஃபில்டர் (Price Range)
      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        where.pricePerDay = {
          gte: filter.minPrice,
          lte: filter.maxPrice
        };
      }

      // Availability Search Logic
      if (filter.startDate && filter.endDate) {
        const start = new Date(filter.startDate);
        const end = new Date(filter.endDate);
        where.status = { in: [CarStatus.AVAILABLE, CarStatus.RENTED] };
        where.bookings = this.buildBookingAvailabilityFilter(start, end);
      } else {
        Object.assign(where, this.buildStatusFilter(false));
      }
    } else {
      Object.assign(where, this.buildStatusFilter(false));
    }

    const normalized = normalizePagination(pagination);
    return await carRepository.findPaginated(normalized, where);
  }

  async getCarById(id: string) {
    const car = await carRepository.findUnique(id);
    if (!car) throw new AppError('Car not found', ErrorCode.NOT_FOUND);
    return car;
  }

async createCar(data: CreateCarInput) {
    const validation = validateCarData(data);
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    try {
      const { modelId, brandId, ...rest } = data;
      
      return await carRepository.createCar({
        ...rest,
        model: { connect: { id: modelId } },
        brand: { connect: { id: brandId } },
        requiredLicense: data.requiredLicense || 'B',
        status: data.status || CarStatus.AVAILABLE
      } as any); 
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('A car with this plate number already exists', ErrorCode.ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async updateCar(id: string, data: UpdateCarInput) {
    return await carRepository.updateCar(id, data);
  }

  async deleteCar(id: string) {
    const activeBookingsCount = await carRepository.countActiveBookings(id);
    if (activeBookingsCount > 0) {
      throw new AppError('Cannot delete car with active bookings', ErrorCode.BAD_USER_INPUT);
    }
    return await carRepository.deleteCar(id);
  }

  async addCarImage(carId: string, url: string, publicId: string, isPrimary?: boolean) {
    if (isPrimary) {
      await carRepository.updateManyImages({ carId }, { isPrimary: false });
    }

    return await carRepository.createImage({
      car: { connect: { id: carId } },
      url: url,
      publicId: publicId,
      isPrimary: !!isPrimary
    });
  }

  async finishMaintenance(carId: string) {
    return await carRepository.updateCar(carId, { status: CarStatus.AVAILABLE });
  }

async setPrimaryImage(carId: string, imageId: string) {
    await carRepository.updateManyImages({ carId }, { isPrimary: false });
    return await carRepository.updateImage(imageId, { isPrimary: true });
  }

  async deleteImage(imageId: string) {
    return await carRepository.deleteImage(imageId);
  }
}

export const carService = new CarService();