import { gql } from '@apollo/client';

export const MOCK_FINALIZE_PAYMENT_MUTATION = gql`
  mutation MockFinalizePayment($bookingId: String!, $success: Boolean!) {
    mockFinalizePayment(bookingId: $bookingId, success: $success) {
      id
      status
      amount
      booking {
        id
        status
      }
    }
  }
`;