import { gql } from '@apollo/client';

// --- 👤 USER & PROFILE QUERIES ---

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      fullName
      email
      phoneNumber
      dateOfBirth
      fullAddress
      role
      
    }
  }
`;

export const GET_MY_BOOKINGS_QUERY = gql`
  query GetMyBookings {
    myBookings {
      id
      createdAt
      startDate
      endDate
      pickupTime
      returnTime

      # Meter Tracking
      startOdometer
      endOdometer
      
      # Corrected Field Name
      extraKmFee 

      # Financials
      totalPrice
      basePrice
      taxAmount
      depositAmount
      status
      bookingType
      repairOrderId
      createdByAdmin
      isWalkIn
      guestName
      guestPhone
      guestEmail
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
      car {
        brand { name }
        model { name }
        plateNumber
        dailyKmLimit
        extraKmCharge
        requiredLicense
        images {
          url
          isPrimary
        }
      }
      payment {
        status
        amount
      }
    }
  }
`;

export const GET_ALL_BOOKINGS_QUERY = gql`
  query GetAllBookings($pagination: PaginationInput) {
    bookings(pagination: $pagination) {
      items {
        id
        startDate
        endDate
        pickupTime
        returnTime
        totalPrice
        basePrice
        taxAmount
        depositAmount
        status
        bookingType
        repairOrderId
        createdByAdmin
        isWalkIn
        guestName
        guestPhone
        guestEmail
        createdAt
        verification {
          id
          token
          expiresAt
          isVerified
          verifiedAt
        }
        user {
          id
          fullName
          email
          phoneNumber
          dateOfBirth
          fullAddress
        }
        payment {
          id
          status
          amount
          stripeId
          createdAt
          updatedAt
        }
        car {
          id
          plateNumber
          status
          transmission
          fuelType
          seats
          brand { name }
          model { name }
          images {
            url
            isPrimary
          }
        }
        documentVerification {
          id
          licenseFrontUrl
          licenseBackUrl
          idCardUrl
          idCardBackUrl
          addressProofUrl
          licenseNumber
          licenseExpiry
          licenseIssueDate
          driverDob
          licenseCategories
          idNumber
          idExpiry
          verifiedAddress
          status
          aiMetadata
          rejectionReason
          verifiedAt
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

// --- 🚗 CARS QUERIES ---

export const GET_CARS_QUERY = gql`
  query GetCars($filter: CarFilterInput, $pagination: PaginationInput) {
    cars(filter: $filter, pagination: $pagination) {
      items {
        id
        plateNumber
        brand { id name }
        model { id name }
        year
        fuelType
        transmission
        seats
        requiredLicense

        # Car Specs
        dailyKmLimit
        extraKmCharge
        currentOdometer

        depositAmount
        pricePerDay
        critAirRating
        status
        images {
          id
          url
          isPrimary
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

export const GET_CAR_QUERY = gql`
  query GetCar($id: ID!) {
    car(id: $id) {
      id
      brand {
        id
        name
      }
      model {
        id
        name
        brandId
      }
      year
      plateNumber
      fuelType
      transmission
      seats
      requiredLicense

      dailyKmLimit
      extraKmCharge
      currentOdometer

      depositAmount
      pricePerDay
      critAirRating
      status
      images {
        id
        url
        isPrimary
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_AVAILABLE_CARS_QUERY = gql`
  query GetAvailableCars($startDate: String!, $endDate: String!) {
    availableCars(startDate: $startDate, endDate: $endDate) {
      id
      brand { id name }
      model { id name }
      year
      fuelType
      transmission
      requiredLicense
      pricePerDay
      images {
        url
        isPrimary
      }
    }
  }
`;

// --- ⚙️ UTILS (ENUMS & SETTINGS) ---

export const GET_CAR_ENUMS = gql`
  query GetCarEnums {
    fuelTypeEnum: __type(name: "FuelType") {
      enumValues { name }
    }
    transmissionEnum: __type(name: "Transmission") {
      enumValues { name }
    }
    critAirEnum: __type(name: "CritAirCategory") {
      enumValues { name }
    }
    carStatusEnum: __type(name: "CarStatus") {
      enumValues { name }
    }
    licenseCategoryEnum: __type(name: "LicenseCategory") {
      enumValues { name }
    }
  }
`;

export const GET_PLATFORM_SETTINGS_QUERY = gql`
  query GetPlatformSettings {
    platformSettings {
      id
      companyName
      currency
      taxPercentage
      youngDriverMinAge
      youngDriverFee
      supportPhone
      supportEmail
      address
    }
  }
`;

export const GET_BRANDS_QUERY = gql`
  query GetBrands {
    brands {
      id
      name
      logoUrl
    }
  }
`;

export const GET_MODELS_QUERY = gql`
  query GetModels {
    models {
      id
      name
      brandId
    }
  }
`;

export const GET_MODELS_BY_BRAND_QUERY = gql`
  query GetModelsByBrand($brandId: ID!) {
    models(brandId: $brandId) {
      id
      name
      brandId
    }
  }
`;

export const GET_BOOKING_QUERY = gql`
  query GetBooking($id: ID!) {
    booking(id: $id) {
      id
      startDate
      endDate
      pickupTime
      returnTime
      createdAt

      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }

      user {
        id
        fullName
        email
        phoneNumber
        dateOfBirth
        fullAddress
      }

      startOdometer
      endOdometer
      extraKmFee
      returnNotes
      totalPrice
      basePrice
      taxAmount
      depositAmount
      status
      bookingType
      repairOrderId
      createdByAdmin
      isWalkIn
      guestName
      guestPhone
      guestEmail
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        seats
        status
        requiredLicense
        dailyKmLimit
        extraKmCharge
        pricePerDay
        depositAmount
        images {
          url
          isPrimary
        }
      }
      payment {
        id
        status
        amount
        stripeId
        createdAt
      }
      documentVerification {
        id
        licenseFrontUrl
        licenseBackUrl
        idCardUrl
        idCardBackUrl
        addressProofUrl
        licenseNumber
        licenseExpiry
        licenseIssueDate
        driverDob
        licenseCategories
        idNumber
        idExpiry
        verifiedAddress
        status
        aiMetadata
        rejectionReason
        verifiedAt
      }
    }
  }
`;

export const CHECK_CAR_AVAILABILITY_QUERY = gql`
  query CheckCarAvailability($carId: ID!, $startDate: String!, $endDate: String!, $excludeBookingId: ID) {
    checkCarAvailability(carId: $carId, startDate: $startDate, endDate: $endDate, excludeBookingId: $excludeBookingId) {
      available
      conflictingBookings {
        id
        startDate
        endDate
        user {
          fullName
        }
      }
    }
  }
`;

export const GET_BOOKING_ID_BY_TOKEN_QUERY = gql`
  query GetBookingIdByToken($token: String!) {
    bookingByToken(token: $token) {
      id
      status
    }
  }
`;

export const GET_BOOKING_BY_TOKEN_QUERY = gql`
  query GetBookingByToken($token: String!) {
    bookingByToken(token: $token) {
      id
      startDate
      endDate
      startOdometer
      endOdometer
      extraKmFee
      
      totalPrice
      basePrice
      taxAmount
      depositAmount
      status
      bookingType
      repairOrderId
      createdByAdmin
      isWalkIn
      guestName
      guestPhone
      guestEmail
      verification {
        id
        token
        expiresAt
        isVerified
        verifiedAt
      }
      user {
        id
        fullName
        email
        phoneNumber
      }
      car {
        id
        brand { name }
        model { name }
        plateNumber
        fuelType
        transmission
        requiredLicense
        dailyKmLimit
        extraKmCharge
        pricePerDay
        depositAmount
        images {
          url
          isPrimary
        }
      }
      payment {
        status
        amount
      }
    }
  }
`;

// --- � ADMIN USER MANAGEMENT ---
export const GET_USERS_QUERY = gql`
  query GetUsers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      items {
        id
        email
        fullName
        phoneNumber
        role
        createdAt
        updatedAt
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

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      fullName
      phoneNumber
      dateOfBirth
      fullAddress
      role
      createdAt
      updatedAt
    }
  }
`;

// --- �🔐 AUTH UTILS ---
export const IS_EMAIL_AVAILABLE_QUERY = gql`
  query IsEmailAvailable($email: String!) {
    isEmailAvailable(email: $email)
  }
`;
// --- 📊 DASHBOARD STATS ---
export const GET_DASHBOARD_STATS_QUERY = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalCars
      totalBookings
      totalRevenue
      availableCars
      recentBookings {
        id
        isWalkIn
        guestName
        guestEmail
        guestPhone
        totalPrice
        status
        createdAt
        user { fullName email }
        car { brand { name } model { name } }
      }
    }
  }
`;