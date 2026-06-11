import { gql } from '@apollo/client';

export const GET_CAR_QUERY = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      plateNumber
      basePrice
      status
      primaryImageUrl
      model {
        id
        name
        brand {
          id
          name
        }
      }
      fuelType {
        id
        name
      }
      images {
        id
        url
      }
    }
  }
`;

export const GET_CARS_QUERY = gql`
  query GetCars($pagination: PaginationInput, $filter: CarFilterInput) {
    cars(pagination: $pagination, filter: $filter) {
      items {
        id
        plateNumber
        basePrice
        status
        primaryImageUrl
        model {
          id
          name
          brand {
            id
            name
          }
        }
        fuelType {
          id
          name
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_AVAILABLE_CARS_QUERY = gql`
  query GetAvailableCars($startDate: String!, $endDate: String!, $pagination: PaginationInput) {
    availableCars(startDate: $startDate, endDate: $endDate, pagination: $pagination) {
      items {
        id
        basePrice
        status
        primaryImageUrl
        model {
          id
          name
          brand {
            id
            name
          }
        }
        fuelType {
          id
          name
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_CAR_AVAILABILITY_CALENDAR_QUERY = gql`
  query GetCarAvailabilityCalendar($carId: ID!, $month: Int!, $year: Int!) {
    carAvailabilityCalendar(carId: $carId, month: $month, year: $year) {
      date
      available
      bookingId
    }
  }
`;

// ─── DESCRIPTOR QUERIES (Moved from legacy global files) ───────────────────

export const GET_BRANDS_QUERY = gql`
  query GetBrands {
    brands {
      id
      name
    }
  }
`;

export const GET_MODELS_QUERY = gql`
  query GetModels {
    models {
      id
      name
      brand {
        id
      }
    }
  }
`;