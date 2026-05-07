import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CARS_QUERY,
  GET_BRANDS_QUERY,
} from '@/lib/graphql/queries';
import { CREATE_BOOKING_MUTATION } from '@/lib/graphql/mutations';
import { CAR_ENUMS } from '@/hooks/graphql/useAddCar';

export const useCars = (filterPayload: any, shouldSkip: boolean) => {
  const { data: carsData, loading: carsLoading, error: carsError } = useQuery(GET_CARS_QUERY, {
    variables: {
      filter: filterPayload,
      pagination: { page: 1, pageSize: 100 },
    },
    fetchPolicy: 'cache-first',
    skip: shouldSkip,
  });

  const { data: brandData } = useQuery(GET_BRANDS_QUERY);

  const [createBooking, { loading: isBooking }] = useMutation(CREATE_BOOKING_MUTATION);

  return {
    cars: carsData?.cars?.items || [],
    pageInfo: carsData?.cars?.pageInfo,
    // Static enums — no network request, no introspection dependency
    enums: CAR_ENUMS,
    brands: brandData?.brands || [],
    loading: carsLoading || isBooking,
    error: carsError,
    createBooking,
  };
};