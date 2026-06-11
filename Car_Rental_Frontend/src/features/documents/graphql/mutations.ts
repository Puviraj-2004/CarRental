import { gql } from '@apollo/client';

export const SAVE_DOCUMENTS_MUTATION = gql`
  mutation SaveDocuments($input: DocumentsInput!) {
    saveDocuments(input: $input) {
      id
      status
    }
  }
`;

export const SAVE_BOOKING_DOCUMENTS_MUTATION = gql`
  mutation SaveBookingDocuments($bookingId: ID!, $input: DocumentsInput!, $saveToProfile: Boolean) {
    saveBookingDocuments(bookingId: $bookingId, input: $input, saveToProfile: $saveToProfile) {
      id
      bookingId
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

export const PROCESS_DOCUMENT_OCR_MUTATION = gql`
  mutation ProcessDocumentOCR($file: Upload!, $documentType: DocumentType!, $side: DocumentSide!) {
    processDocumentOCR(file: $file, documentType: $documentType, side: $side) {
      licenseNumber
      licenseExpiry
      age
      idNumber
      idExpiry
      address
      fallbackUsed
      isQuotaExceeded
    }
  }
`;