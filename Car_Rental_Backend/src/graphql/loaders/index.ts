import DataLoader from 'dataloader';

import { createUserLoader }                                        from './user.loader';
import { createBrandLoader, createCarLoader,
         createModelLoader, createCarImagesLoader }               from './car.loader';
import { createPaymentByBookingLoader,
         createDocsByBookingLoader }                              from './booking.loader';

import type { UserWithRelations, CarWithRelations,
              ModelWithBrand, PaymentWithMethod,
              Brand, CarImage, Documents }                        from '../../prisma/types';
import type { Payment }                                           from '@prisma/client';

export interface DataLoaders {
  userLoader:              DataLoader<string, UserWithRelations | null>;
  brandLoader:             DataLoader<string, Brand | null>;
  carLoader:               DataLoader<string, CarWithRelations | null>;
  modelLoader:             DataLoader<string, ModelWithBrand | null>;
  carImagesLoader:         DataLoader<string, CarImage[]>;
  paymentByBookingLoader:  DataLoader<string, Payment | null>;
  docsByBookingLoader:     DataLoader<string, Documents | null>;
}

export function createDataLoaders(): DataLoaders {
  return {
    userLoader:              createUserLoader(),
    brandLoader:             createBrandLoader(),
    carLoader:               createCarLoader(),
    modelLoader:             createModelLoader(),
    carImagesLoader:         createCarImagesLoader(),
    paymentByBookingLoader:  createPaymentByBookingLoader(),
    docsByBookingLoader:     createDocsByBookingLoader(),
  };
}

// Re-export payload types so callers can import from one place
export type { UserWithRelations, CarWithRelations,
              ModelWithBrand, PaymentWithMethod,
              Brand, CarImage, Documents };