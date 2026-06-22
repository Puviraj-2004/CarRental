import { gql } from '@apollo/client';

export const HAS_APPROVED_DOCUMENTS_QUERY = gql`
  query HasApprovedDocuments {
    hasApprovedDocuments {
      hasApprovedDocuments
      documents {
        id
        licenseFrontUrl
        licenseBackUrl
        idCardFrontUrl
        idCardBackUrl
        addressProofUrl
        licenseNumber
        licenseExpiry
        age
        idNumber
        idExpiry
        address
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BOOKING_DOCUMENTS_QUERY = gql`
  query BookingDocuments($bookingId: ID!) {
    bookingDocuments(bookingId: $bookingId) {
      id
      licenseFrontUrl
      licenseBackUrl
      idCardFrontUrl
      idCardBackUrl
      addressProofUrl
      licenseNumber
      licenseExpiry
      age
      idNumber
      idExpiry
      address
      status
      createdAt
      updatedAt
    }
  }
`;