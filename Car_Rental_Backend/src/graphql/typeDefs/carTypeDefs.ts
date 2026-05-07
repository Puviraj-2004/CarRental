import { gql } from 'graphql-tag';

export const carTypeDefs = gql`
  scalar Upload

  enum CritAirCategory {
    CRIT_AIR_0
    CRIT_AIR_1
    CRIT_AIR_2
    CRIT_AIR_3
    CRIT_AIR_4
    CRIT_AIR_5
    NO_STICKER
  }

  enum FuelType {
    PETROL
    DIESEL
    ELECTRIC
    HYBRID
    LPG
    CNG
  }

  enum Transmission {
    MANUAL
    AUTOMATIC
    CVT
    DCT
  }

  enum CarStatus {
    AVAILABLE
    RENTED
    MAINTENANCE
    OUT_OF_SERVICE
  }

  # All 15 categories — must match schema.prisma exactly.
  enum LicenseCategory {
    AM
    A1
    A2
    A
    B1
    B
    BE
    C1
    C
    C1E
    CE
    D1
    D
    D1E
    DE
  }

  type CarImage {
    id: ID!
    carId: ID!
    url: String!
    isPrimary: Boolean!
  }

  type Car {
    id: ID!
    modelId: ID!
    brandId: ID!
    model: VehicleModel!
    brand: Brand!
    year: Int!
    plateNumber: String!
    transmission: Transmission!
    fuelType: FuelType
    seats: Int!
    requiredLicense: LicenseCategory!
    pricePerDay: Float!
    depositAmount: Float!
    dailyKmLimit: Float
    extraKmCharge: Float!
    currentOdometer: Float!
    critAirRating: CritAirCategory!
    status: CarStatus!
    images: [CarImage!]!
    createdAt: String!
    updatedAt: String!
  }

  # NOTE: PageInfo, PaginatedCars, and PaginationInput are defined in
  # paginationTypeDefs.ts — do NOT redefine them here or Apollo will
  # throw "Type already exists in schema" on startup.

  input CarFilterInput {
    brandIds: [ID!]
    modelIds: [ID!]
    fuelTypes: [FuelType!]
    transmissions: [Transmission!]
    statuses: [CarStatus!]
    critAirRatings: [CritAirCategory!]
    includeOutOfService: Boolean
    minPrice: Float
    maxPrice: Float
    startDate: String
    endDate: String
  }

  input CreateCarInput {
    modelId: ID!
    brandId: ID!
    year: Int!
    plateNumber: String!
    transmission: Transmission!
    fuelType: FuelType
    seats: Int!
    requiredLicense: LicenseCategory
    pricePerDay: Float!
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float
    currentOdometer: Float
    critAirRating: CritAirCategory
    status: CarStatus
  }

  input UpdateCarInput {
    modelId: ID
    brandId: ID
    year: Int
    plateNumber: String
    transmission: Transmission
    fuelType: FuelType
    seats: Int
    requiredLicense: LicenseCategory
    pricePerDay: Float
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float
    currentOdometer: Float
    critAirRating: CritAirCategory
    status: CarStatus
  }

  extend type Query {
    cars(filter: CarFilterInput, pagination: PaginationInput): PaginatedCars!
    car(id: ID!): Car
  }

  extend type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!

    addCarImage(carId: ID!, file: Upload!, isPrimary: Boolean): CarImage!
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }
`;