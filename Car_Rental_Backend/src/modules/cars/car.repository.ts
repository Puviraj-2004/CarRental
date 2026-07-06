import { CarStatus, BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  NormalizedPagination,
  buildPaginatedResult,
  PaginatedResult,
} from '../../core/utils/pagination';
import type { CarWithRelations } from '../../prisma/types';

const CAR_INCLUDE = {
  model:    { include: { brand: true } },
  images:   true,
  fuelType: true,
} as const;

const BLOCKING_STATUSES = [
  BookingStatus.RESERVED,
  BookingStatus.CONFIRMED,
  BookingStatus.ONGOING,
] as const;

export class CarRepository {
  // ── Queries ────────────────────────────────────────────────────────────────

  findById(id: string): Promise<CarWithRelations | null> {
    return prisma.car.findUnique({ where: { id }, include: CAR_INCLUDE });
  }

  findByPlate(plateNumber: string): Promise<CarWithRelations | null> {
    return prisma.car.findUnique({ where: { plateNumber }, include: CAR_INCLUDE });
  }

  async findPaginated(
    p: NormalizedPagination,
    filter?: {
      status?:     CarStatus;
      statusNot?:  CarStatus;
      brandId?:    string;
      modelId?:    string;
      fuelTypeId?: string;
      minPrice?:   number;
      maxPrice?:   number;
      search?:     string;
    },
  ): Promise<PaginatedResult<CarWithRelations>> {
    const where: Prisma.CarWhereInput = {};

    if (filter?.status)    where.status    = filter.status;
    if (filter?.statusNot) where.status    = { not: filter.statusNot };
    if (filter?.modelId)   where.modelId   = filter.modelId;
    if (filter?.fuelTypeId) where.fuelTypeId = filter.fuelTypeId;
    if (filter?.brandId)   where.model     = { brandId: filter.brandId };

    if (filter?.minPrice != null || filter?.maxPrice != null) {
      where.basePrice = {};
      if (filter?.minPrice != null) (where.basePrice as Prisma.DecimalFilter).gte = filter.minPrice;
      if (filter?.maxPrice != null) (where.basePrice as Prisma.DecimalFilter).lte = filter.maxPrice;
    }

    if (filter?.search) {
      where.OR = [
        { plateNumber: { contains: filter.search, mode: 'insensitive' } },
        { model: { name:  { contains: filter.search, mode: 'insensitive' } } },
        { model: { brand: { name: { contains: filter.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.car.findMany({
        where,
        include:  CAR_INCLUDE,
        skip:     p.skip,
        take:     p.take,
        orderBy:  { basePrice: 'asc' },
      }),
      prisma.car.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  async findAvailable(
    startDate: Date,
    endDate:   Date,
    p:         NormalizedPagination,
  ): Promise<PaginatedResult<CarWithRelations>> {
    const booked = await prisma.booking.findMany({
      where: {
        status: { in: [...BLOCKING_STATUSES] },
        AND: [
          // Enforces same-day turnover buffer [1]
          { startDate: { lte: endDate } }, 
          { endDate:   { gte: startDate } },
        ],
      },
      select: { carId: true },
    });

    const excludedIds = booked.map(b => b.carId);
    const where: Prisma.CarWhereInput = {
      status: { not: CarStatus.UNAVAILABLE },
      id:     { notIn: excludedIds },
    };

    const [items, totalCount] = await prisma.$transaction([
      prisma.car.findMany({ where, include: CAR_INCLUDE, skip: p.skip, take: p.take, orderBy: { basePrice: 'asc' } }),
      prisma.car.count({ where }),
    ]);

    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  async findByStatus(
    status: CarStatus,
    p:      NormalizedPagination,
  ): Promise<PaginatedResult<CarWithRelations>> {
    const [items, totalCount] = await prisma.$transaction([
      prisma.car.findMany({ where: { status }, include: CAR_INCLUDE, skip: p.skip, take: p.take }),
      prisma.car.count({ where: { status } }),
    ]);
    return buildPaginatedResult(items, totalCount, p.page, p.pageSize);
  }

  // ── Mutations Updated ──────────────────────────────────────────────────────

  create(data: {
    modelId:              string;
    plateNumber:          string;
    fuelTypeId?:          string | null;
    basePrice:            number;
    status?:              CarStatus;
    primaryImageUrl?:     string;
    primaryImagePublicId?: string | null; // <-- Added: Expects tracking ID [1]
  }): Promise<CarWithRelations> {
    return prisma.car.create({ data, include: CAR_INCLUDE });
  }

  update(id: string, data: Prisma.CarUpdateInput): Promise<CarWithRelations> {
    return prisma.car.update({ where: { id }, data, include: CAR_INCLUDE });
  }

  delete(id: string): Promise<CarWithRelations> {
    return prisma.car.delete({ where: { id }, include: CAR_INCLUDE });
  }

  // ── Images Updated ─────────────────────────────────────────────────────────

  addImages(carId: string, images: { url: string; publicId: string }[]): Promise<CarWithRelations> {
    return prisma.car.update({
      where:   { id: carId },
      data:    { 
        images: { 
          create: images.map(img => ({ 
            url: img.url, 
            publicId: img.publicId 
          })) 
        } 
      },
      include: CAR_INCLUDE,
    });
  }

  findImageById(imageId: string) {
    return prisma.carImage.findUnique({ where: { id: imageId } });
  }

  deleteImage(imageId: string) {
    return prisma.carImage.delete({ where: { id: imageId } });
  }

  // ── Calendar ───────────────────────────────────────────────────────────────

  getMonthBookings(carId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);
    return prisma.booking.findMany({
      where: {
        carId,
        status: { in: [...BLOCKING_STATUSES] },
        AND: [
          // Enforces same-day turnover buffer on the calendar
          { startDate: { lte: end } },
          { endDate:   { gte: start } },
        ],
      },
      select: { id: true, startDate: true, endDate: true },
    });
  }
}

export const carRepository = new CarRepository();
