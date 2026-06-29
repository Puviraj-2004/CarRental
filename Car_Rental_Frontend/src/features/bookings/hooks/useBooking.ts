import { useMutation, useQuery, FetchResult } from '@apollo/client';
import { CREATE_BOOKING_MUTATION, CANCEL_BOOKING_MUTATION, EXTEND_BOOKING_DATES_MUTATION } from '../graphql/mutations';
import { GET_BOOKING_QUERY } from '../graphql/queries';

export interface Booking {
  id:             string;
  carId:          string;
  userId?:        string | null;
  startDate:      string;
  endDate:        string;
  numberOfDays:   number;
  basePrice:      number;
  subtotal:       number;
  taxRate:        number;
  taxAmount:      number;
  totalPrice:     number;
  guestName?:     string | null;
  guestPhone?:    string | null;
  notes?:         string | null;
  status:         'RESERVED' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'REJECTED';
  type:           'RENTAL' | 'COURTESY';
  reminderSentAt?: string | null;
  createdAt:      string;
  updatedAt?:     string;
  car: {
    id:              string;
    primaryImageUrl: string;
    model: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
  documents?: {
    id:             string;
    status:         'PENDING' | 'APPROVED' | 'REJECTED';
    licenseFrontUrl?: string | null;
    licenseBackUrl?:  string | null;
    idCardFrontUrl?:  string | null;
    idCardBackUrl?:   string | null;
    addressProofUrl?: string | null;
    licenseNumber:  string | null;
    licenseExpiry?: string | null;
  } | null;
  payment?: {
    id:     string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
  } | null;
}

export interface CreateBookingInput {
  carId:       string;
  startDate:   string;
  endDate:     string;
  guestName?:  string;
  guestPhone?: string;
  notes?:      string;
  type?:       'RENTAL' | 'COURTESY';
}

export interface CreateBookingData {
  createBooking: Booking;
}

export interface GetBookingData {
  booking: Booking | null;
}

export interface UseBookingReturn {
  booking:          Booking | null;
  loadingQuery:     boolean;
  executeCreate:    (input: CreateBookingInput) => Promise<FetchResult<CreateBookingData>>;
  loadingCreate:    boolean;
  executeCancel:    (id: string) => Promise<FetchResult<{ cancelBooking: Booking }>>;
  loadingCancel:    boolean;
  executeExtend:    (id: string, newEndDate: string) => Promise<FetchResult<{ extendBookingDates: Booking }>>;
  loadingExtend:    boolean;
}

export const useBooking = (bookingId?: string): UseBookingReturn => {
  const { data, loading: loadingQuery } = useQuery<GetBookingData, { id: string }>(
    GET_BOOKING_QUERY,
    {
      variables: { id: bookingId || '' },
      skip: !bookingId,
    }
  );

  const [createBooking, { loading: loadingCreate }] = useMutation<CreateBookingData, { input: CreateBookingInput }>(
    CREATE_BOOKING_MUTATION
  );

  const [cancelBooking, { loading: loadingCancel }] = useMutation<{ cancelBooking: Booking }, { id: string }>(
    CANCEL_BOOKING_MUTATION
  );

  const [extendBookingDates, { loading: loadingExtend }] = useMutation<
    { extendBookingDates: Booking },
    { id: string; newEndDate: string }
  >(EXTEND_BOOKING_DATES_MUTATION);

  const executeCreate = async (input: CreateBookingInput): Promise<FetchResult<CreateBookingData>> => {
    return await createBooking({
      variables: { input },
    });
  };

  const executeCancel = async (id: string): Promise<FetchResult<{ cancelBooking: Booking }>> => {
    return await cancelBooking({
      variables: { id },
    });
  };

  const executeExtend = async (id: string, newEndDate: string): Promise<FetchResult<{ extendBookingDates: Booking }>> => {
    return await extendBookingDates({
      variables: { id, newEndDate },
    });
  };

  return {
    booking: data?.booking || null,
    loadingQuery,
    executeCreate,
    loadingCreate,
    executeCancel,
    loadingCancel,
    executeExtend,
    loadingExtend,
  };
};
