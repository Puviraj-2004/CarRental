import { useQuery } from '@apollo/client';
import { GET_CAR_QUERY, GET_CAR_AVAILABILITY_CALENDAR_QUERY } from '../graphql/queries';
import { Car } from './useCar';


export interface DetailedCar extends Car {
  images: Array<{
    id:  string;
    url: string;
  }>;
}

export interface GetCarData {
  car: DetailedCar | null;
}

export interface CalendarDay {
  date:      string;
  available: boolean;
  bookingId: string | null;
}

export interface GetCalendarData {
  carAvailabilityCalendar: CalendarDay[];
}

export interface UseCarDetailsReturn {
  car:            DetailedCar | null;
  loadingCar:     boolean;
  calendar:       CalendarDay[];
  loadingCalendar:boolean;
  refetchCalendar:(variables: { month: number; year: number }) => Promise<unknown>;
}

export const useCarDetails = (carId: string, month: number, year: number): UseCarDetailsReturn => {
  const { data: carData, loading: loadingCar } = useQuery<GetCarData, { id: string }>(
    GET_CAR_QUERY,
    { variables: { id: carId } }
  );

  const { data: calData, loading: loadingCalendar, refetch: refetchCalendar } = useQuery<
    GetCalendarData,
    { carId: string; month: number; year: number }
  >(GET_CAR_AVAILABILITY_CALENDAR_QUERY, {
    variables: { carId, month, year },
  });

  return {
    car:             carData?.car || null,
    loadingCar,
    calendar:        calData?.carAvailabilityCalendar || [],
    loadingCalendar,
    refetchCalendar: refetchCalendar as (variables: { month: number; year: number }) => Promise<unknown>,
  };
};