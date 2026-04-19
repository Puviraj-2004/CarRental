import prisma from '../utils/database';
import { Prisma } from '@prisma/client';

export class CarRepository {
  async findPaginated(
    pagination: { skip: number; take: number }, 
    where: Prisma.CarWhereInput
  ) {
    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where,
        include: {
          model: true,
          brand: true,
          images: true,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.car.count({ where }),
    ]);

    return {
      cars,
      totalCount,
      hasMore: pagination.skip + cars.length < totalCount,
    };
  }

  async findUnique(id: string) {
    return await prisma.car.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        brand: true,
        images: true,
      },
    });
  }

  async findMany(where: Prisma.CarWhereInput) {
    return await prisma.car.findMany({
      where,
      include: { images: true, model: true, brand: true },
    });
  }

  async createCar(data: Prisma.CarCreateInput) {
    return await prisma.car.create({
      data,
      include: { model: true, brand: true },
    });
  }

  async updateCar(id: string, data: Prisma.CarUpdateInput) {
    return await prisma.car.update({
      where: { id },
      data,
      include: { model: true, brand: true, images: true },
    });
  }

  async deleteCar(id: string) {
    await prisma.car.delete({ where: { id } });
    return true;
  }

  async createImage(data: Prisma.CarImageCreateInput) {
    return await prisma.carImage.create({ data });
  }

  async updateImage(id: string, data: Prisma.CarImageUpdateInput) {
    return await prisma.carImage.update({
      where: { id },
      data,
    });
  }

  async updateManyImages(where: Prisma.CarImageWhereInput, data: Prisma.CarImageUpdateManyMutationInput) {
    return await prisma.carImage.updateMany({ where, data });
  }

  async deleteImage(id: string) {
    await prisma.carImage.delete({ where: { id } });
    return true;
  }

  async countActiveBookings(carId: string) {
    return await prisma.booking.count({
      where: {
        carId,
        status: { in: ['CONFIRMED', 'ONGOING', 'PENDING'] as any },
      },
    });
  }
}

export const carRepository = new CarRepository();