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

  enum LicenseCategory {
    A
    B
    C
    D
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

  type PaginatedCars {
    cars: [Car!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  # --- Inputs ---
  input PaginationInput {
    page: Int
    limit: Int
  }

  input CarFilterInput {
    brandIds: [ID!]
    modelIds: [ID!]
    fuelTypes: [FuelType!]
    transmissions: [Transmission!]
    statuses: [CarStatus!]
    minPrice: Float
    maxPrice: Float
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
    year: Int
    transmission: Transmission
    fuelType: FuelType
    seats: Int
    pricePerDay: Float
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float
    currentOdometer: Float
    status: CarStatus
  }

  # --- Queries ---
  extend type Query {
    cars(filter: CarFilterInput, pagination: PaginationInput): PaginatedCars!
    car(id: ID!): Car
  }

  # --- Mutations ---
  extend type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!
    
    # Image Management
    addCarImage(carId: ID!, file: Upload!, isPrimary: Boolean): CarImage!
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }
`;