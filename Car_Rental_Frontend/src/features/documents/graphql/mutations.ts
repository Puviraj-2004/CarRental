import { gql } from '@apollo/client';

export const PROCESS_DOCUMENT_OCR_MUTATION = gql`
  mutation ProcessDocumentOCR(
    $licenseFrontUrl: String!,
    $licenseBackUrl: String!,
    $idCardFrontUrl: String!,
    $idCardBackUrl: String!,
    $addressProofUrl: String!
  ) {
    processDocumentOCR(
      licenseFrontUrl: $licenseFrontUrl,
      licenseBackUrl: $licenseBackUrl,
      idCardFrontUrl: $idCardFrontUrl,
      idCardBackUrl: $idCardBackUrl,
      addressProofUrl: $addressProofUrl
    ) {
      licenseNumber
      licenseExpiry
      idNumber
      idExpiry
      address
      birthDate
    }
  }
`;

export const SAVE_BOOKING_DOCUMENTS_MUTATION = gql`
  mutation SaveBookingDocuments($bookingId: ID!, $input: DocumentsInput!, $saveToProfile: Boolean!) { # <-- Updated: Takes saveToProfile [1]
    saveBookingDocuments(bookingId: $bookingId, input: $input, saveToProfile: $saveToProfile) {
      id
      bookingId
      status
    }
  }
`;

export const SAVE_DOCUMENTS_MUTATION = gql`
  mutation SaveDocuments($input: DocumentsInput!) {
    saveDocuments(input: $input) {
      id
      status
    }
  }
`;

export const REUSE_DOCUMENTS_FOR_BOOKING_MUTATION = gql`
  mutation ReuseDocumentsForBooking($bookingId: ID!) {
    reuseDocumentsForBooking(bookingId: $bookingId) {
      id
      bookingId
      status
    }
  }
`;