import { gql } from '@apollo/client';

export const GET_BOOKING_QUERY = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      carId
      userId
      startDate
      endDate
      numberOfDays
      basePrice
      totalPrice
      guestName
      guestPhone
      notes
      status
      type
      reminderSentAt
      createdAt
      updatedAt
      car {
        id
        primaryImageUrl
        model {
          name
          brand {
            name
          }
        }
      }
      documents {
        id
        status
        licenseNumber
        licenseExpiry
      }
    }
  }
`;

export const GET_MY_BOOKINGS_QUERY = gql`
  query GetMyBookings($pagination: PaginationInput) {
    myBookings(pagination: $pagination) {
      items {
        id
        startDate
        endDate
        numberOfDays
        totalPrice
        status
        type
        createdAt
        documents {
          id
          status
          licenseFrontUrl
          licenseBackUrl
          idCardFrontUrl
          idCardBackUrl
          addressProofUrl
        }
        payment {
          id
          status
        }
        car {
          id
          primaryImageUrl
          model {
            name
            brand {
              name
            }
          }
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;