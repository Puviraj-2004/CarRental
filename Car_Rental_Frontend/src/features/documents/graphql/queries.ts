import { gql } from '@apollo/client';

export const GET_MY_DOCUMENTS_QUERY = gql`
  query GetMyDocuments {
    myDocuments {
      id
      userId
      bookingId
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

export const HAS_APPROVED_DOCUMENTS_QUERY = gql`
  query HasApprovedDocuments {
    hasApprovedDocuments {
      hasApprovedDocuments
      documents {
        id
        userId
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
      }
    }
  }
`;