import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '../graphql/queries';

export interface Brand {
  id:   string;
  name: string;
}

export interface VehicleModel {
  id:    string;
  name:  string;
  brand: Brand;
}

export interface FuelType {
  id:   string;
  name: string;
}

export interface Car {
  id:              string;
  plateNumber:     string;
  basePrice:       number;
  status:          'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE';
  primaryImageUrl: string;
  model:           VehicleModel;
  fuelType?:       FuelType | null;
}

export interface PageInfo {
  totalCount:      number;
  totalPages:      number;
  currentPage:     number;
  hasNextPage:     boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCarsData {
  cars: {
    items:    Car[];
    pageInfo: PageInfo;
  };
}

export interface PaginationInput {
  page?:     number;
  pageSize?: number;
  search?:   string;
}

export interface CarFilterInput {
  status?:     'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE';
  statusNot?:  'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE';
  brandId?:    string;
  modelId?:    string;
  fuelTypeId?: string;
  minPrice?:   number;
  maxPrice?:   number;
  search?:     string;
}

export interface UseCarsVariables {
  pagination?: PaginationInput;
  filter?:     CarFilterInput;
}

export const useCars = (variables?: UseCarsVariables) => {
  const { data, loading, error, refetch } = useQuery<PaginatedCarsData, UseCarsVariables>(
    GET_CARS_QUERY,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    }
  );

  return {
    cars:     data?.cars.items || [],
    pageInfo: data?.cars.pageInfo,
    loading,
    error,
    refetch,
  };
};
