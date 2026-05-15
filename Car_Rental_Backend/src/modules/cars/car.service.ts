import type { FileUpload } from 'graphql-upload-ts';
import { CarStatus } from '@prisma/client';

import { AppError, ErrorCode } from '../../core/errors/AppError';
import { normalizePagination } from '../../core/utils/pagination';
import { validateFileMime } from '../../core/utils/fileValidation';
import cloudinary from '../../config/cloudinary';
import { carRepository } from './car.repository';
import type { CarWithRelations } from '../../prisma/types';

// ─── Upload helpers ───────────────────────────────────────────────────────────

function uploadStream(createReadStream: () => NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'cars', resource_type: 'image' },
      (error, result) => {
        if (error ?? !result) return reject(error ?? new Error('Upload failed'));
        resolve(result!.secure_url);
      },
    );
    createReadStream().pipe(upload);
  });
}

async function uploadImage(file: Promise<FileUpload>): Promise<string> {
  const { createReadStream, mimetype } = await file;
  validateFileMime(mimetype, 'car_image');
  return uploadStream(createReadStream);
}

// ─── CarService ───────────────────────────────────────────────────────────────

export class CarService {
  // ── CRUD ───────────────────────────────────────────────────────────────────

  async addCar(input: {
    modelId:       string;
    plateNumber:   string;
    fuelTypeId?:   string;
    basePrice:     number;
    status?:       CarStatus;
    primaryImage?: Promise<FileUpload>;
  }): Promise<CarWithRelations> {
    const existing = await carRepository.findByPlate(input.plateNumber);
    if (existing) {
      throw new AppError('A car with this plate number already exists.', ErrorCode.ALREADY_EXISTS);
    }

    let primaryImageUrl: string | undefined;
    if (input.primaryImage) {
      primaryImageUrl = await uploadImage(input.primaryImage);
    }

    return carRepository.create({
      modelId:        input.modelId,
      plateNumber:    input.plateNumber.toUpperCase(),
      fuelTypeId:     input.fuelTypeId,
      basePrice:      input.basePrice,
      status:         input.status,
      primaryImageUrl,
    });
  }

  async updateCar(id: string, input: {
    plateNumber?:  string;
    fuelTypeId?:   string | null;
    basePrice?:    number;
    primaryImage?: Promise<FileUpload>;
  }): Promise<CarWithRelations> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    let primaryImageUrl: string | undefined;
    if (input.primaryImage) {
      primaryImageUrl = await uploadImage(input.primaryImage);
    }

    return carRepository.update(id, {
      ...(input.plateNumber != null && { plateNumber: input.plateNumber.toUpperCase() }),
      ...(input.fuelTypeId  !== undefined && {
        fuelType: input.fuelTypeId
          ? { connect: { id: input.fuelTypeId } }
          : { disconnect: true },
      }),
      ...(input.basePrice   != null && { basePrice: input.basePrice }),
      ...(primaryImageUrl   != null && { primaryImageUrl }),
    });
  }

  async deleteCar(id: string): Promise<boolean> {
    const car = await carRepository.findById(id);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);
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

  // ── Images ─────────────────────────────────────────────────────────────────

  async uploadCarImages(
    carId:      string,
    images:     Promise<FileUpload>[],
    setPrimary: boolean,
  ): Promise<CarWithRelations> {
    const car = await carRepository.findById(carId);
    if (!car) throw new AppError('Car not found.', ErrorCode.NOT_FOUND);

    const urls    = await Promise.all(images.map(uploadImage));
    const updated = await carRepository.addImages(carId, urls);

    if (setPrimary && urls[0]) {
      return carRepository.update(carId, { primaryImageUrl: urls[0] });
    }
    return updated;
  }

  async deleteCarImage(imageId: string): Promise<boolean> {
    const image = await carRepository.findImageById(imageId);
    if (!image) throw new AppError('Image not found.', ErrorCode.NOT_FOUND);
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
    return carRepository.update(carId, { primaryImageUrl: image.url });
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

  // ── Availability Calendar ──────────────────────────────────────────────────

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
      const date    = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const booking = bookings.find(b => b.startDate <= date && b.endDate > date);

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
