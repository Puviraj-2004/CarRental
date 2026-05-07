/**
 * Static enum constants — single source of truth on the frontend.
 *
 * These values must stay in sync with:
 *   - schema.prisma (Prisma enums)
 *   - src/graphql/typeDefs/carTypeDefs.ts (GraphQL enums)
 *
 * Why static instead of fetching via __type introspection:
 *   - Introspection is disabled in production (Apollo default)
 *   - These values only change when the schema changes (requires redeployment anyway)
 *   - No network request needed — dropdowns render immediately
 */

export const FUEL_TYPE_VALUES = [
  'PETROL',
  'DIESEL',
  'ELECTRIC',
  'HYBRID',
  'LPG',
  'CNG',
] as const;

export const TRANSMISSION_VALUES = [
  'MANUAL',
  'AUTOMATIC',
  'CVT',
  'DCT',
] as const;

export const CRIT_AIR_VALUES = [
  'CRIT_AIR_0',
  'CRIT_AIR_1',
  'CRIT_AIR_2',
  'CRIT_AIR_3',
  'CRIT_AIR_4',
  'CRIT_AIR_5',
  'NO_STICKER',
] as const;

export const CAR_STATUS_VALUES = [
  'AVAILABLE',
  'RENTED',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const;

// All 15 categories — matches schema.prisma and carTypeDefs.ts exactly.
// Previous carTypeDefs.ts only had A, B, C, D — now fixed.
export const LICENSE_CATEGORY_VALUES = [
  'AM',
  'A1',
  'A2',
  'A',
  'B1',
  'B',
  'BE',
  'C1',
  'C',
  'C1E',
  'CE',
  'D1',
  'D',
  'D1E',
  'DE',
] as const;

// TypeScript types derived from the constants above
export type FuelType = typeof FUEL_TYPE_VALUES[number];
export type Transmission = typeof TRANSMISSION_VALUES[number];
export type CritAirCategory = typeof CRIT_AIR_VALUES[number];
export type CarStatus = typeof CAR_STATUS_VALUES[number];
export type LicenseCategory = typeof LICENSE_CATEGORY_VALUES[number];