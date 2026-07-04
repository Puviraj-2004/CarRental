import { gql } from '@apollo/client';

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      startDate
      endDate
      numberOfDays
      subtotal
      taxRate
      taxAmount
      totalPrice
      status
      type
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($id: ID!) {
    cancelBooking(id: $id) {
      id
      status
    }
  }
`;

export const EXTEND_BOOKING_DATES_MUTATION = gql`
  mutation ExtendBookingDates($id: ID!, $newEndDate: String!) {
    extendBookingDates(id: $id, newEndDate: $newEndDate) {
      id
      endDate
      numberOfDays
      subtotal
      taxRate
      taxAmount
      totalPrice
    }
  }
`;
