import { CarStatus } from '@prisma/client';

import { AppError, ErrorCode } from '../../core/errors/AppError';
import { normalizePagination } from '../../core/utils/pagination';
import cloudinary, { signUploadRequest } from '../../config/cloudinary';
import { carRepository } from './car.repository';
import type { CarWithRelations } from '../../prisma/types';
import logger from '../../config/logger';

export class CarService {

  // ── Secure Signature Generator for Client Side Direct Uploads ──────────────

  getUploadSignature(folder: string) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = { timestamp, folder };
    
    // Generates the HMAC-SHA256 signature securely using the apiSecret kept on the server
    const signature = signUploadRequest(params);
    const config = cloudinary.config();

    return {
      signature,
      timestamp,
      apiKey: config.api_key || '',
      cloudName: config.cloud_name || '',
      folder,
    };
  }

  // ── CRUD Mutations Updated ─────────────────────────────────────────────────

  async addCar(input: {
    modelId:       string;
    plateNumber:   string;
    fuelTypeId?:   string;
    basePrice:     number;
    status?:       CarStatus;
    primaryImage?: { url: string; publicId: string }; 
  }): Promise<CarWithRelations> {
    const existing = await carRepository.findByPlate(input.plateNumber);
    if (existing) {
      throw new AppError('A car with this plate number already exists.', ErrorCode.ALREADY_EXISTS);
    }

    return carRepository.create({
      modelId:              input.modelId,
      plateNumber:          input.plateNumber.toUpperCase(),
      fuelTypeId:           input.fuelTypeId,
      basePrice:            input.basePrice,
      status:               input.status,
      primaryImageUrl:      input.primaryImage?.url || '',
      primaryImagePublicId: input.primaryImage?.publicId || null,
    });
  }

  async updateCar(id: string, input: {
    plateNumber?:  string;
    fuelTypeId?:   string | null;
    basePrice?:    number;
    primaryImage?: { url: string; publicId: string }; 
  }): Promise<CarWithRelations> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    // If updating/overwriting the primary image, clean up the previous file on Cloudinary first
    if (input.primaryImage && car.primaryImagePublicId) {
      try {
        await cloudinary.uploader.destroy(car.primaryImagePublicId);
      } catch (err) {
        logger.error('Failed to clean old primary image from Cloudinary on update', { 
          publicId: car.primaryImagePublicId, 
          error: err 
        });
      }
    }

    return carRepository.update(id, {
      ...(input.plateNumber != null && { plateNumber: input.plateNumber.toUpperCase() }),
      ...(input.fuelTypeId  !== undefined && {
        fuelType: input.fuelTypeId
          ? { connect: { id: input.fuelTypeId } }
          : { disconnect: true },
      }),
      ...(input.basePrice   != null && { basePrice: input.basePrice }),
      ...(input.primaryImage != null && { 
        primaryImageUrl:      input.primaryImage.url,
        primaryImagePublicId: input.primaryImage.publicId
      }),
    });
  }

  async deleteCar(id: string): Promise<boolean> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    const publicIdsToDelete: string[] = [];

    // Gather primary image tracking ID
    if (car.primaryImagePublicId) {
      publicIdsToDelete.push(car.primaryImagePublicId);
    }

    // Gather all secondary additional image tracking IDs
    if (car.images && car.images.length > 0) {
      for (const img of car.images) {
        if (img.publicId) {
          publicIdsToDelete.push(img.publicId);
        }
      }
    }

    // Destroy every single asset associated with the car on Cloudinary
    for (const publicId of publicIdsToDelete) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        logger.error('Failed to destroy Cloudinary asset on car deletion', { publicId, error: err });
      }
    }

    await carRepository.delete(id);
    return true;
  }

  getCarById(id: string): Promise<CarWithRelations | null> {
    return carRepository.findById(id);
  }

  getCars(
    pagination?: { page?: number; pageSize?: number },
    filter?: {
      status?:     CarStatus;
      brandId?:    string;
      modelId?:    string;
      fuelTypeId?: string;
      minPrice?:   number;
      maxPrice?:   number;
      search?:     string;
    },
  ) {
    return carRepository.findPaginated(normalizePagination(pagination), filter);
  }

  // ── Search / Filter ────────────────────────────────────────────────────────

  getAvailableCars(
    startDate:   string,
    endDate:     string,
    pagination?: { page?: number; pageSize?: number },
  ) {
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format.', ErrorCode.BAD_USER_INPUT);
    }
    if (start >= end) {
      throw new AppError('startDate must be before endDate.', ErrorCode.BAD_USER_INPUT);
    }
    return carRepository.findAvailable(start, end, normalizePagination(pagination));
  }

  getCarsByStatus(
    status:      CarStatus,
    pagination?: { page?: number; pageSize?: number },
  ) {
    return carRepository.findByStatus(status, normalizePagination(pagination));
  }

  // ── Images Updated ─────────────────────────────────────────────────────────

  async uploadCarImages(
    carId:      string,
    images:     { url: string; publicId: string }[], 
    setPrimary: boolean,
  ): Promise<CarWithRelations> {
    const car = await carRepository.findById(carId);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    if (images.length === 0) {
      return car;
    }

    const updated = await carRepository.addImages(carId, images);

    if (setPrimary && images[0]) {
      // Clean up previous unique primary image from Cloudinary to avoid leaks
      if (car.primaryImagePublicId) {
        try {
          await cloudinary.uploader.destroy(car.primaryImagePublicId);
        } catch (err) {
          logger.error('Failed to clean up old primary image during pointer swap', {
            publicId: car.primaryImagePublicId,
            error: err
          });
        }
      }
      return carRepository.update(carId, { 
        primaryImageUrl:      images[0].url,
        primaryImagePublicId: images[0].publicId
      });
    }
    return updated;
  }

  async deleteCarImage(imageId: string): Promise<boolean> {
    const image = await carRepository.findImageById(imageId);
    if (!image) throw new AppError('Image not found.', ErrorCode.NOT_FOUND);

    // Clean file from Cloudinary securely using the tracked public ID
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        logger.error('Failed to destroy car image from Cloudinary', { 
          publicId: image.publicId, 
          error: err 
        });
      }
    }

    await carRepository.deleteImage(imageId);
    return true;
  }

  async setPrimaryImage(carId: string, imageId: string): Promise<CarWithRelations> {
    const car   = await carRepository.findById(carId);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    const image = await carRepository.findImageById(imageId);
    if (!image || image.carId !== carId) {
      throw new AppError('Image not found for this car.', ErrorCode.NOT_FOUND);
    }

    // Safety: Clean up previous primary image ONLY if it was unique and not part of the additional image gallery.
    const isOldPrimaryShared = car.images.some(img => img.url === car.primaryImageUrl && img.id !== imageId);
    if (car.primaryImagePublicId && !isOldPrimaryShared && car.primaryImagePublicId !== image.publicId) {
      try {
        await cloudinary.uploader.destroy(car.primaryImagePublicId);
      } catch (err) {
        logger.error('Failed to clear old primary image from Cloudinary', {
          publicId: car.primaryImagePublicId,
          error: err
        });
      }
    }

    return carRepository.update(carId, { 
      primaryImageUrl:      image.url,
      primaryImagePublicId: image.publicId
    });
  }

  // ── Status / Pricing / Maintenance ─────────────────────────────────────────

  async updateCarStatus(id: string, status: CarStatus): Promise<CarWithRelations> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    return carRepository.update(id, { status });
  }

  async updateCarPricing(id: string, basePrice: number): Promise<CarWithRelations> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    if (basePrice <= 0) {
      throw new AppError('Base price must be greater than 0.', ErrorCode.BAD_USER_INPUT);
    }
    return carRepository.update(id, { basePrice });
  }

  async scheduleCarMaintenance(id: string): Promise<CarWithRelations> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
    return carRepository.update(id, { status: CarStatus.UNAVAILABLE });
  }

  // ── Availability Calendar Updated (Timezone-Agnostic String Comparison) ───

  async getAvailabilityCalendar(
    carId:  string,
    month:  number,
    year:   number,
  ): Promise<{ date: string; available: boolean; bookingId?: string | null }[]> {
    const car = await carRepository.findById(carId);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    const bookings    = await carRepository.getMonthBookings(carId, year, month);
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: { date: string; available: boolean; bookingId?: string | null }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // 1. Build a pure date string in YYYY-MM-DD format (no local timezone shifts) [1]
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // 2. Perform an inclusive, timezone-agnostic string comparison directly on the raw DB dates [1]
      const booking = bookings.find(b => {
        const bStartStr = b.startDate.toISOString().split('T')[0];
        const bEndStr = b.endDate.toISOString().split('T')[0];
        return dateStr >= bStartStr && dateStr <= bEndStr; // Inclusive check [1]
      });

      result.push({
        date:      dateStr,
        available: !booking && car.status === CarStatus.AVAILABLE,
        bookingId: booking?.id ?? null,
      });
    }

    return result;
  }
}

export const carService = new CarService();