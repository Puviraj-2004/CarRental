import { gql } from '@apollo/client';

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      id
      startDate
      endDate
      numberOfDays
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

export const UPDATE_BOOKING_MUTATION = gql`
  mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
    updateBooking(id: $id, input: $input) {
      id
      guestName
      guestPhone
      notes
    }
  }
`;