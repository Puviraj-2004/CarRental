import { platformRepository } from '../repositories/platformRepository';
import { cleanupService } from './cleanupService';
import { expirationService } from './expirationService';
import { AppError, ErrorCode } from '../errors/AppError';
import { PlatformSettingsInput } from '../types/graphql';
import prisma from '../utils/database';

export class PlatformService {
  async getPlatformSettings() {
    try {
      let settings = await platformRepository.getSettings();

      if (!settings) {
        // Business Logic: Auto-initialize settings if DB is empty
        settings = await platformRepository.createSettings({
          companyName: 'RentCar Premium',
          currency: 'EUR',
          taxPercentage: 20.0,
          youngDriverMinAge: 25,
          youngDriverFee: 30.0,
          supportEmail: 'support@rentcar.com',
          supportPhone: '+33 1 23 45 67 89',
          address: 'Paris, France',
        });
      }
      return settings;
    } catch (error) {
      throw new AppError("Failed to fetch platform settings", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePlatformSettings(input: PlatformSettingsInput) {
    const existingSettings = await platformRepository.getSettings();

    // Mapping logic kept exactly as provided in original code
    const dataToUpdate: Partial<PlatformSettingsInput> = {
      companyName: input.companyName,
      supportEmail: input.supportEmail,
      supportPhone: input.supportPhone,
      address: input.address,
      facebookUrl: input.facebookUrl,
      twitterUrl: input.twitterUrl,
      instagramUrl: input.instagramUrl,
      linkedinUrl: input.linkedinUrl,
      youngDriverMinAge: input.youngDriverMinAge,
      youngDriverFee: input.youngDriverFee,
      termsAndConditions: input.termsAndConditions,
      privacyPolicy: input.privacyPolicy,
      currency: input.currency,
      taxPercentage: input.taxPercentage,
      // Novice driver and logo fields handled with safe checks for schema compatibility
      ...(input.noviceLicenseYears && { noviceLicenseYears: input.noviceLicenseYears }),
      ...(input.logoUrl && { logoUrl: input.logoUrl })
    };

    if (existingSettings) {
      return await platformRepository.updateSettings(existingSettings.id, dataToUpdate);
    } else {
      return await platformRepository.createSettings(input);
    }
  }

  async runOldBookingsCleanup(daysOld: number) {
    const result = await cleanupService.cleanupOldCompletedBookings(daysOld);
    return result.deletedCount;
  }

  async triggerManualExpiration() {
    return await expirationService.triggerExpirationCheck();
  }

  /**
   * Optimized dashboard stats using Prisma count() and aggregate().
   * Replaces fetching entire users/cars/bookings tables.
   */
  async getDashboardStats() {
    const [totalUsers, totalCars, totalBookings, availableCars, revenueResult, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.car.count(),
      prisma.booking.count({ where: { status: { not: 'DRAFT' } } }),
      prisma.car.count({ where: { status: 'AVAILABLE' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: { notIn: ['CANCELLED', 'REJECTED', 'EXPIRED', 'DRAFT'] } },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: { not: 'DRAFT' } },
        include: {
          user: true,
          car: { include: { model: { include: { brand: true } }, images: true } },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCars,
      totalBookings,
      totalRevenue: revenueResult._sum.totalPrice || 0,
      availableCars,
      recentBookings,
    };
  }
}

export const platformService = new PlatformService();