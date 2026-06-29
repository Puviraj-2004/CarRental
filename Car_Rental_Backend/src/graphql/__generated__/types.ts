import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { UserWithRelations, PrismaDocuments, BookingWithRelations, CarWithRelations, ModelWithBrand, PaymentWithMethod } from '../../prisma/types';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  JSON: { input: unknown; output: unknown; }
  Upload: { input: Promise<import("graphql-upload-ts").FileUpload>; output: Promise<import("graphql-upload-ts").FileUpload>; }
};

export type AddCarInput = {
  basePrice: Scalars['Float']['input'];
  fuelTypeId?: InputMaybe<Scalars['ID']['input']>;
  modelId: Scalars['ID']['input'];
  plateNumber: Scalars['String']['input'];
  primaryImage?: InputMaybe<ImageInput>;
  status?: InputMaybe<CarStatus>;
};

export type AdminBookingLane =
  | 'COURTESY'
  | 'ONLINE'
  | 'ONSITE';

export type AdminDashboardBooking = {
  __typename?: 'AdminDashboardBooking';
  car: AdminDashboardCar;
  createdAt: Scalars['DateTime']['output'];
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isWalkIn: Scalars['Boolean']['output'];
  reminderSentAt?: Maybe<Scalars['DateTime']['output']>;
  status: BookingStatus;
  totalPrice: Scalars['Float']['output'];
  user?: Maybe<User>;
};

export type AdminDashboardCar = {
  __typename?: 'AdminDashboardCar';
  brand: Brand;
  model: VehicleModel;
};

export type AdminReportBookingLanes = {
  __typename?: 'AdminReportBookingLanes';
  courtesy: Scalars['Int']['output'];
  online: Scalars['Int']['output'];
  onsite: Scalars['Int']['output'];
};

export type AdminReportFilterInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type AdminReportMoneyMetric = {
  __typename?: 'AdminReportMoneyMetric';
  amount: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
};

export type AdminReportPaymentMethod = {
  __typename?: 'AdminReportPaymentMethod';
  amount: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
};

export type AdminReportStatusBreakdown = {
  __typename?: 'AdminReportStatusBreakdown';
  cancelled: Scalars['Int']['output'];
  completed: Scalars['Int']['output'];
  confirmed: Scalars['Int']['output'];
  expired: Scalars['Int']['output'];
  ongoing: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
  reserved: Scalars['Int']['output'];
};

export type AdminReports = {
  __typename?: 'AdminReports';
  availableCars: Scalars['Int']['output'];
  bookingLanes: AdminReportBookingLanes;
  bookingStatuses: AdminReportStatusBreakdown;
  paid: AdminReportMoneyMetric;
  paymentMethods: Array<AdminReportPaymentMethod>;
  pendingDocuments: Scalars['Int']['output'];
  pendingPayments: AdminReportMoneyMetric;
  refunded: AdminReportMoneyMetric;
  rentedCars: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  basePrice: Scalars['Float']['output'];
  car: Car;
  carId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentRejectedAt?: Maybe<Scalars['DateTime']['output']>;
  documentReuploadDeadline?: Maybe<Scalars['DateTime']['output']>;
  documents?: Maybe<Documents>;
  endDate: Scalars['DateTime']['output'];
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  numberOfDays: Scalars['Int']['output'];
  payment?: Maybe<Payment>;
  reminderSentAt?: Maybe<Scalars['DateTime']['output']>;
  startDate: Scalars['DateTime']['output'];
  status: BookingStatus;
  subtotal: Scalars['Float']['output'];
  taxAmount: Scalars['Float']['output'];
  taxRate: Scalars['Float']['output'];
  totalPrice: Scalars['Float']['output'];
  type: BookingType;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type BookingFilterInput = {
  carId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  lane?: InputMaybe<AdminBookingLane>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BookingStatus>;
  type?: InputMaybe<BookingType>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type BookingQuote = {
  __typename?: 'BookingQuote';
  basePrice: Scalars['Float']['output'];
  carId: Scalars['ID']['output'];
  currency: Scalars['String']['output'];
  endDate: Scalars['DateTime']['output'];
  numberOfDays: Scalars['Int']['output'];
  startDate: Scalars['DateTime']['output'];
  subtotal: Scalars['Float']['output'];
  taxAmount: Scalars['Float']['output'];
  taxRate: Scalars['Float']['output'];
  totalPrice: Scalars['Float']['output'];
};

export type BookingStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'ONGOING'
  | 'REJECTED'
  | 'RESERVED';

export type BookingType =
  | 'COURTESY'
  | 'RENTAL';

export type Brand = {
  __typename?: 'Brand';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CalendarDay = {
  __typename?: 'CalendarDay';
  available: Scalars['Boolean']['output'];
  bookingId?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
};

export type Car = {
  __typename?: 'Car';
  basePrice: Scalars['Float']['output'];
  fuelType?: Maybe<FuelType>;
  id: Scalars['ID']['output'];
  images: Array<CarImage>;
  model: VehicleModel;
  plateNumber: Scalars['String']['output'];
  primaryImagePublicId?: Maybe<Scalars['String']['output']>;
  primaryImageUrl: Scalars['String']['output'];
  status: CarStatus;
};

export type CarFilterInput = {
  brandId?: InputMaybe<Scalars['ID']['input']>;
  fuelTypeId?: InputMaybe<Scalars['ID']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  modelId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CarStatus>;
};

export type CarImage = {
  __typename?: 'CarImage';
  carId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  publicId: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CarStatus =
  | 'AVAILABLE'
  | 'RENTED'
  | 'RESERVED'
  | 'UNAVAILABLE';

export type CheckoutSession = {
  __typename?: 'CheckoutSession';
  sessionId: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CloudinarySignature = {
  __typename?: 'CloudinarySignature';
  apiKey: Scalars['String']['output'];
  cloudName: Scalars['String']['output'];
  folder: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  timestamp: Scalars['Int']['output'];
};

export type CreateBookingInput = {
  carId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
  type?: InputMaybe<BookingType>;
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  availableCars: Scalars['Int']['output'];
  cancelledBookings: Scalars['Int']['output'];
  completedBookings: Scalars['Int']['output'];
  confirmedBookings: Scalars['Int']['output'];
  ongoingBookings: Scalars['Int']['output'];
  pendingDocuments: Scalars['Int']['output'];
  pendingPayments: Scalars['Int']['output'];
  recentBookings: Array<AdminDashboardBooking>;
  rejectedBookings: Scalars['Int']['output'];
  reservedBookings: Scalars['Int']['output'];
  totalBookings: Scalars['Int']['output'];
  totalCars: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type DocumentReuseStatus = {
  __typename?: 'DocumentReuseStatus';
  documents?: Maybe<Documents>;
  hasApprovedDocuments: Scalars['Boolean']['output'];
};

export type DocumentSide =
  | 'BACK'
  | 'FRONT';

export type DocumentType =
  | 'ADDRESS_PROOF'
  | 'ID_CARD'
  | 'LICENSE';

export type Documents = {
  __typename?: 'Documents';
  address?: Maybe<Scalars['String']['output']>;
  addressProofUrl?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  bookingId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  idCardBackUrl?: Maybe<Scalars['String']['output']>;
  idCardFrontUrl?: Maybe<Scalars['String']['output']>;
  idExpiry?: Maybe<Scalars['DateTime']['output']>;
  idNumber?: Maybe<Scalars['String']['output']>;
  licenseBackUrl?: Maybe<Scalars['String']['output']>;
  licenseExpiry?: Maybe<Scalars['DateTime']['output']>;
  licenseFrontUrl?: Maybe<Scalars['String']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
  status: VerificationStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type DocumentsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addressProofUrl: Scalars['String']['input'];
  birthDate?: InputMaybe<Scalars['String']['input']>;
  idCardBackUrl: Scalars['String']['input'];
  idCardFrontUrl: Scalars['String']['input'];
  idExpiry?: InputMaybe<Scalars['String']['input']>;
  idNumber?: InputMaybe<Scalars['String']['input']>;
  licenseBackUrl: Scalars['String']['input'];
  licenseExpiry?: InputMaybe<Scalars['String']['input']>;
  licenseFrontUrl: Scalars['String']['input'];
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
};

export type FuelType = {
  __typename?: 'FuelType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ImageInput = {
  publicId: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginPayload = {
  __typename?: 'LoginPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCar: Car;
  adminCreateBooking: Booking;
  adminRecordBookingPayment: Payment;
  adminRefundBookingPayment: Payment;
  adminUpdateBookingStatus: Booking;
  adminVerifyBookingDocuments: Documents;
  adminVerifyDocuments: Documents;
  cancelBooking: Booking;
  changePassword: Scalars['Boolean']['output'];
  createBooking: Booking;
  createBrand: Brand;
  createCheckoutSession: CheckoutSession;
  createFuelType: FuelType;
  createModel: VehicleModel;
  createPaymentMethod: PaymentMethod;
  deleteBrand: Scalars['Boolean']['output'];
  deleteCar: Scalars['Boolean']['output'];
  deleteCarImage: Scalars['Boolean']['output'];
  deleteFuelType: Scalars['Boolean']['output'];
  deleteModel: Scalars['Boolean']['output'];
  deletePaymentMethod: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  extendBookingDates: Booking;
  login: LoginPayload;
  logout?: Maybe<Scalars['Boolean']['output']>;
  mockFinalizePayment: Payment;
  processDocumentOCR: OcrPayload;
  refreshTokens: RefreshTokensPayload;
  refundPayment: Payment;
  register: RegisterPayload;
  resendOTP: ResendOtpPayload;
  reuseDocumentsForBooking: Documents;
  saveBookingDocuments: Documents;
  saveDocuments: Documents;
  scheduleCarMaintenance: Car;
  setPrimaryImage: Car;
  updateBooking: Booking;
  updateBrand: Brand;
  updateCar: Car;
  updateCarPricing: Car;
  updateCarStatus: Car;
  updateFuelType: FuelType;
  updateModel: VehicleModel;
  updateMyProfile: User;
  updatePaymentMethod: PaymentMethod;
  updateUserRole: User;
  uploadCarImages: Car;
  verifyOTP: VerifyOtpPayload;
};


export type MutationAddCarArgs = {
  input: AddCarInput;
};


export type MutationAdminCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationAdminRecordBookingPaymentArgs = {
  amount: Scalars['Float']['input'];
  bookingId: Scalars['ID']['input'];
  paymentMethodId: Scalars['ID']['input'];
};


export type MutationAdminRefundBookingPaymentArgs = {
  bookingId: Scalars['ID']['input'];
};


export type MutationAdminUpdateBookingStatusArgs = {
  id: Scalars['ID']['input'];
  status: BookingStatus;
};


export type MutationAdminVerifyBookingDocumentsArgs = {
  bookingId: Scalars['ID']['input'];
  status: VerificationStatus;
};


export type MutationAdminVerifyDocumentsArgs = {
  status: VerificationStatus;
  userId: Scalars['ID']['input'];
};


export type MutationCancelBookingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationCreateBookingArgs = {
  input: CreateBookingInput;
};


export type MutationCreateBrandArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateCheckoutSessionArgs = {
  bookingId: Scalars['ID']['input'];
};


export type MutationCreateFuelTypeArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateModelArgs = {
  brandId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreatePaymentMethodArgs = {
  name: Scalars['String']['input'];
};


export type MutationDeleteBrandArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCarArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCarImageArgs = {
  imageId: Scalars['ID']['input'];
};


export type MutationDeleteFuelTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteModelArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationExtendBookingDatesArgs = {
  id: Scalars['ID']['input'];
  newEndDate: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationMockFinalizePaymentArgs = {
  bookingId: Scalars['String']['input'];
  success: Scalars['Boolean']['input'];
};


export type MutationProcessDocumentOcrArgs = {
  addressProofUrl: Scalars['String']['input'];
  idCardBackUrl: Scalars['String']['input'];
  idCardFrontUrl: Scalars['String']['input'];
  licenseBackUrl: Scalars['String']['input'];
  licenseFrontUrl: Scalars['String']['input'];
};


export type MutationRefreshTokensArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRefundPaymentArgs = {
  paymentId: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationResendOtpArgs = {
  email: Scalars['String']['input'];
};


export type MutationReuseDocumentsForBookingArgs = {
  bookingId: Scalars['ID']['input'];
};


export type MutationSaveBookingDocumentsArgs = {
  bookingId: Scalars['ID']['input'];
  input: DocumentsInput;
  saveToProfile?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationSaveDocumentsArgs = {
  input: DocumentsInput;
};


export type MutationScheduleCarMaintenanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetPrimaryImageArgs = {
  carId: Scalars['ID']['input'];
  imageId: Scalars['ID']['input'];
};


export type MutationUpdateBookingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBookingInput;
};


export type MutationUpdateBrandArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateCarArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCarInput;
};


export type MutationUpdateCarPricingArgs = {
  basePrice: Scalars['Float']['input'];
  id: Scalars['ID']['input'];
};


export type MutationUpdateCarStatusArgs = {
  id: Scalars['ID']['input'];
  status: CarStatus;
};


export type MutationUpdateFuelTypeArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateModelArgs = {
  brandId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateMyProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdatePaymentMethodArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateUserRoleArgs = {
  id: Scalars['ID']['input'];
  role: Role;
};


export type MutationUploadCarImagesArgs = {
  carId: Scalars['ID']['input'];
  images: Array<ImageInput>;
  setPrimary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationVerifyOtpArgs = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type OcrPayload = {
  __typename?: 'OCRPayload';
  address?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['String']['output']>;
  idExpiry?: Maybe<Scalars['String']['output']>;
  idNumber?: Maybe<Scalars['String']['output']>;
  licenseExpiry?: Maybe<Scalars['String']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
};

export type OcrResult = {
  __typename?: 'OCRResult';
  address?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  fallbackUsed?: Maybe<Scalars['Boolean']['output']>;
  idExpiry?: Maybe<Scalars['DateTime']['output']>;
  idNumber?: Maybe<Scalars['String']['output']>;
  isQuotaExceeded?: Maybe<Scalars['Boolean']['output']>;
  licenseExpiry?: Maybe<Scalars['DateTime']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginatedBookings = {
  __typename?: 'PaginatedBookings';
  items: Array<Booking>;
  pageInfo: PageInfo;
};

export type PaginatedCars = {
  __typename?: 'PaginatedCars';
  items: Array<Car>;
  pageInfo: PageInfo;
};

export type PaginatedPayments = {
  __typename?: 'PaginatedPayments';
  items: Array<Payment>;
  pageInfo: PageInfo;
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  items: Array<User>;
  pageInfo: PageInfo;
};

export type PaginationInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  bookingId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  paymentMethod?: Maybe<PaymentMethod>;
  refundPolicy?: Maybe<Scalars['String']['output']>;
  refundedAmount: Scalars['Float']['output'];
  refundedAt?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentStatus;
  stripeId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type PaymentStatus =
  | 'FAILED'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUNDED';

export type Query = {
  __typename?: 'Query';
  adminReports: AdminReports;
  availableCars: PaginatedCars;
  booking?: Maybe<Booking>;
  bookingDocuments?: Maybe<Documents>;
  bookingQuote: BookingQuote;
  bookings: PaginatedBookings;
  brands: Array<Brand>;
  car?: Maybe<Car>;
  carAvailabilityCalendar: Array<CalendarDay>;
  cars: PaginatedCars;
  carsByStatus: PaginatedCars;
  cloudinarySignature: CloudinarySignature;
  dashboardStats: DashboardStats;
  fuelTypes: Array<FuelType>;
  hasApprovedDocuments: DocumentReuseStatus;
  isEmailAvailable: Scalars['Boolean']['output'];
  me?: Maybe<User>;
  models: Array<VehicleModel>;
  myBookings: PaginatedBookings;
  myDocuments?: Maybe<Documents>;
  myPayments: PaginatedPayments;
  payment?: Maybe<Payment>;
  paymentByBooking?: Maybe<Payment>;
  paymentMethods: Array<PaymentMethod>;
  payments: PaginatedPayments;
  refundPreview?: Maybe<RefundPreview>;
  user?: Maybe<User>;
  users: PaginatedUsers;
};


export type QueryAdminReportsArgs = {
  filter?: InputMaybe<AdminReportFilterInput>;
};


export type QueryAvailableCarsArgs = {
  endDate: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
  startDate: Scalars['String']['input'];
};


export type QueryBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookingDocumentsArgs = {
  bookingId: Scalars['ID']['input'];
};


export type QueryBookingQuoteArgs = {
  carId: Scalars['ID']['input'];
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
  type?: InputMaybe<BookingType>;
};


export type QueryBookingsArgs = {
  filter?: InputMaybe<BookingFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryCarArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCarAvailabilityCalendarArgs = {
  carId: Scalars['ID']['input'];
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type QueryCarsArgs = {
  filter?: InputMaybe<CarFilterInput>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryCarsByStatusArgs = {
  pagination?: InputMaybe<PaginationInput>;
  status: CarStatus;
};


export type QueryCloudinarySignatureArgs = {
  folder: Scalars['String']['input'];
};


export type QueryIsEmailAvailableArgs = {
  email: Scalars['String']['input'];
};


export type QueryMyBookingsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMyPaymentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentByBookingArgs = {
  bookingId: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryRefundPreviewArgs = {
  bookingId: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type RefreshTokensPayload = {
  __typename?: 'RefreshTokensPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type RefundPreview = {
  __typename?: 'RefundPreview';
  hoursUntilPickup: Scalars['Float']['output'];
  keepAmount: Scalars['Float']['output'];
  policy: Scalars['String']['output'];
  refundAmount: Scalars['Float']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterPayload = {
  __typename?: 'RegisterPayload';
  email: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ResendOtpPayload = {
  __typename?: 'ResendOTPPayload';
  expiresAt: Scalars['DateTime']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Role =
  | 'ADMIN'
  | 'USER';

export type UpdateBookingInput = {
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCarInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  fuelTypeId?: InputMaybe<Scalars['ID']['input']>;
  plateNumber?: InputMaybe<Scalars['String']['input']>;
  primaryImage?: InputMaybe<ImageInput>;
};

export type UpdateProfileInput = {
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  bookings: Array<Booking>;
  documents?: Maybe<Documents>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  phoneNumber?: Maybe<Scalars['String']['output']>;
  role: Role;
};

export type VehicleModel = {
  __typename?: 'VehicleModel';
  brand: Brand;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type VerificationStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED';

export type VerifyOtpPayload = {
  __typename?: 'VerifyOTPPayload';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddCarInput: AddCarInput;
  AdminBookingLane: AdminBookingLane;
  AdminDashboardBooking: ResolverTypeWrapper<Omit<AdminDashboardBooking, 'car' | 'user'> & { car: ResolversTypes['AdminDashboardCar'], user?: Maybe<ResolversTypes['User']> }>;
  AdminDashboardCar: ResolverTypeWrapper<Omit<AdminDashboardCar, 'model'> & { model: ResolversTypes['VehicleModel'] }>;
  AdminReportBookingLanes: ResolverTypeWrapper<AdminReportBookingLanes>;
  AdminReportFilterInput: AdminReportFilterInput;
  AdminReportMoneyMetric: ResolverTypeWrapper<AdminReportMoneyMetric>;
  AdminReportPaymentMethod: ResolverTypeWrapper<AdminReportPaymentMethod>;
  AdminReportStatusBreakdown: ResolverTypeWrapper<AdminReportStatusBreakdown>;
  AdminReports: ResolverTypeWrapper<AdminReports>;
  Booking: ResolverTypeWrapper<BookingWithRelations>;
  BookingFilterInput: BookingFilterInput;
  BookingQuote: ResolverTypeWrapper<BookingQuote>;
  BookingStatus: BookingStatus;
  BookingType: BookingType;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Brand: ResolverTypeWrapper<Brand>;
  CalendarDay: ResolverTypeWrapper<CalendarDay>;
  Car: ResolverTypeWrapper<CarWithRelations>;
  CarFilterInput: CarFilterInput;
  CarImage: ResolverTypeWrapper<CarImage>;
  CarStatus: CarStatus;
  CheckoutSession: ResolverTypeWrapper<CheckoutSession>;
  CloudinarySignature: ResolverTypeWrapper<CloudinarySignature>;
  CreateBookingInput: CreateBookingInput;
  DashboardStats: ResolverTypeWrapper<Omit<DashboardStats, 'recentBookings'> & { recentBookings: Array<ResolversTypes['AdminDashboardBooking']> }>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DocumentReuseStatus: ResolverTypeWrapper<Omit<DocumentReuseStatus, 'documents'> & { documents?: Maybe<ResolversTypes['Documents']> }>;
  DocumentSide: DocumentSide;
  DocumentType: DocumentType;
  Documents: ResolverTypeWrapper<PrismaDocuments>;
  DocumentsInput: DocumentsInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FuelType: ResolverTypeWrapper<FuelType>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  ImageInput: ImageInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LoginInput: LoginInput;
  LoginPayload: ResolverTypeWrapper<Omit<LoginPayload, 'user'> & { user: ResolversTypes['User'] }>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OCRPayload: ResolverTypeWrapper<OcrPayload>;
  OCRResult: ResolverTypeWrapper<OcrResult>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedBookings: ResolverTypeWrapper<Omit<PaginatedBookings, 'items'> & { items: Array<ResolversTypes['Booking']> }>;
  PaginatedCars: ResolverTypeWrapper<Omit<PaginatedCars, 'items'> & { items: Array<ResolversTypes['Car']> }>;
  PaginatedPayments: ResolverTypeWrapper<Omit<PaginatedPayments, 'items'> & { items: Array<ResolversTypes['Payment']> }>;
  PaginatedUsers: ResolverTypeWrapper<Omit<PaginatedUsers, 'items'> & { items: Array<ResolversTypes['User']> }>;
  PaginationInput: PaginationInput;
  Payment: ResolverTypeWrapper<PaymentWithMethod>;
  PaymentMethod: ResolverTypeWrapper<PaymentMethod>;
  PaymentStatus: PaymentStatus;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefreshTokensPayload: ResolverTypeWrapper<RefreshTokensPayload>;
  RefundPreview: ResolverTypeWrapper<RefundPreview>;
  RegisterInput: RegisterInput;
  RegisterPayload: ResolverTypeWrapper<RegisterPayload>;
  ResendOTPPayload: ResolverTypeWrapper<ResendOtpPayload>;
  Role: Role;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateBookingInput: UpdateBookingInput;
  UpdateCarInput: UpdateCarInput;
  UpdateProfileInput: UpdateProfileInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<UserWithRelations>;
  VehicleModel: ResolverTypeWrapper<ModelWithBrand>;
  VerificationStatus: VerificationStatus;
  VerifyOTPPayload: ResolverTypeWrapper<VerifyOtpPayload>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddCarInput: AddCarInput;
  AdminDashboardBooking: Omit<AdminDashboardBooking, 'car' | 'user'> & { car: ResolversParentTypes['AdminDashboardCar'], user?: Maybe<ResolversParentTypes['User']> };
  AdminDashboardCar: Omit<AdminDashboardCar, 'model'> & { model: ResolversParentTypes['VehicleModel'] };
  AdminReportBookingLanes: AdminReportBookingLanes;
  AdminReportFilterInput: AdminReportFilterInput;
  AdminReportMoneyMetric: AdminReportMoneyMetric;
  AdminReportPaymentMethod: AdminReportPaymentMethod;
  AdminReportStatusBreakdown: AdminReportStatusBreakdown;
  AdminReports: AdminReports;
  Booking: BookingWithRelations;
  BookingFilterInput: BookingFilterInput;
  BookingQuote: BookingQuote;
  Boolean: Scalars['Boolean']['output'];
  Brand: Brand;
  CalendarDay: CalendarDay;
  Car: CarWithRelations;
  CarFilterInput: CarFilterInput;
  CarImage: CarImage;
  CheckoutSession: CheckoutSession;
  CloudinarySignature: CloudinarySignature;
  CreateBookingInput: CreateBookingInput;
  DashboardStats: Omit<DashboardStats, 'recentBookings'> & { recentBookings: Array<ResolversParentTypes['AdminDashboardBooking']> };
  DateTime: Scalars['DateTime']['output'];
  DocumentReuseStatus: Omit<DocumentReuseStatus, 'documents'> & { documents?: Maybe<ResolversParentTypes['Documents']> };
  Documents: PrismaDocuments;
  DocumentsInput: DocumentsInput;
  Float: Scalars['Float']['output'];
  FuelType: FuelType;
  ID: Scalars['ID']['output'];
  ImageInput: ImageInput;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LoginInput: LoginInput;
  LoginPayload: Omit<LoginPayload, 'user'> & { user: ResolversParentTypes['User'] };
  Mutation: Record<PropertyKey, never>;
  OCRPayload: OcrPayload;
  OCRResult: OcrResult;
  PageInfo: PageInfo;
  PaginatedBookings: Omit<PaginatedBookings, 'items'> & { items: Array<ResolversParentTypes['Booking']> };
  PaginatedCars: Omit<PaginatedCars, 'items'> & { items: Array<ResolversParentTypes['Car']> };
  PaginatedPayments: Omit<PaginatedPayments, 'items'> & { items: Array<ResolversParentTypes['Payment']> };
  PaginatedUsers: Omit<PaginatedUsers, 'items'> & { items: Array<ResolversParentTypes['User']> };
  PaginationInput: PaginationInput;
  Payment: PaymentWithMethod;
  PaymentMethod: PaymentMethod;
  Query: Record<PropertyKey, never>;
  RefreshTokensPayload: RefreshTokensPayload;
  RefundPreview: RefundPreview;
  RegisterInput: RegisterInput;
  RegisterPayload: RegisterPayload;
  ResendOTPPayload: ResendOtpPayload;
  String: Scalars['String']['output'];
  UpdateBookingInput: UpdateBookingInput;
  UpdateCarInput: UpdateCarInput;
  UpdateProfileInput: UpdateProfileInput;
  Upload: Scalars['Upload']['output'];
  User: UserWithRelations;
  VehicleModel: ModelWithBrand;
  VerifyOTPPayload: VerifyOtpPayload;
}>;

export type AdminDashboardBookingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminDashboardBooking'] = ResolversParentTypes['AdminDashboardBooking']> = ResolversObject<{
  car?: Resolver<ResolversTypes['AdminDashboardCar'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  guestEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guestName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guestPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isWalkIn?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  reminderSentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BookingStatus'], ParentType, ContextType>;
  totalPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
}>;

export type AdminDashboardCarResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminDashboardCar'] = ResolversParentTypes['AdminDashboardCar']> = ResolversObject<{
  brand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType>;
  model?: Resolver<ResolversTypes['VehicleModel'], ParentType, ContextType>;
}>;

export type AdminReportBookingLanesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminReportBookingLanes'] = ResolversParentTypes['AdminReportBookingLanes']> = ResolversObject<{
  courtesy?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  online?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  onsite?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AdminReportMoneyMetricResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminReportMoneyMetric'] = ResolversParentTypes['AdminReportMoneyMetric']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AdminReportPaymentMethodResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminReportPaymentMethod'] = ResolversParentTypes['AdminReportPaymentMethod']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type AdminReportStatusBreakdownResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminReportStatusBreakdown'] = ResolversParentTypes['AdminReportStatusBreakdown']> = ResolversObject<{
  cancelled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  confirmed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  expired?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ongoing?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rejected?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reserved?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type AdminReportsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AdminReports'] = ResolversParentTypes['AdminReports']> = ResolversObject<{
  availableCars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  bookingLanes?: Resolver<ResolversTypes['AdminReportBookingLanes'], ParentType, ContextType>;
  bookingStatuses?: Resolver<ResolversTypes['AdminReportStatusBreakdown'], ParentType, ContextType>;
  paid?: Resolver<ResolversTypes['AdminReportMoneyMetric'], ParentType, ContextType>;
  paymentMethods?: Resolver<Array<ResolversTypes['AdminReportPaymentMethod']>, ParentType, ContextType>;
  pendingDocuments?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingPayments?: Resolver<ResolversTypes['AdminReportMoneyMetric'], ParentType, ContextType>;
  refunded?: Resolver<ResolversTypes['AdminReportMoneyMetric'], ParentType, ContextType>;
  rentedCars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalRevenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type BookingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = ResolversObject<{
  basePrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  car?: Resolver<ResolversTypes['Car'], ParentType, ContextType>;
  carId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  documentRejectedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  documentReuploadDeadline?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  documents?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  guestName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guestPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numberOfDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType>;
  reminderSentAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BookingStatus'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  taxAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  taxRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['BookingType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type BookingQuoteResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BookingQuote'] = ResolversParentTypes['BookingQuote']> = ResolversObject<{
  basePrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  carId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  numberOfDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  subtotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  taxAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  taxRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type BrandResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Brand'] = ResolversParentTypes['Brand']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type CalendarDayResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CalendarDay'] = ResolversParentTypes['CalendarDay']> = ResolversObject<{
  available?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bookingId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type CarResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Car'] = ResolversParentTypes['Car']> = ResolversObject<{
  basePrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  fuelType?: Resolver<Maybe<ResolversTypes['FuelType']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<ResolversTypes['CarImage']>, ParentType, ContextType>;
  model?: Resolver<ResolversTypes['VehicleModel'], ParentType, ContextType>;
  plateNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryImagePublicId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  primaryImageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['CarStatus'], ParentType, ContextType>;
}>;

export type CarImageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CarImage'] = ResolversParentTypes['CarImage']> = ResolversObject<{
  carId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  publicId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type CheckoutSessionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CheckoutSession'] = ResolversParentTypes['CheckoutSession']> = ResolversObject<{
  sessionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type CloudinarySignatureResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CloudinarySignature'] = ResolversParentTypes['CloudinarySignature']> = ResolversObject<{
  apiKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cloudName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signature?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DashboardStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DashboardStats'] = ResolversParentTypes['DashboardStats']> = ResolversObject<{
  availableCars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  cancelledBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  completedBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  confirmedBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ongoingBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingDocuments?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingPayments?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  recentBookings?: Resolver<Array<ResolversTypes['AdminDashboardBooking']>, ParentType, ContextType>;
  rejectedBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reservedBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalBookings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalCars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalRevenue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DocumentReuseStatusResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DocumentReuseStatus'] = ResolversParentTypes['DocumentReuseStatus']> = ResolversObject<{
  documents?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType>;
  hasApprovedDocuments?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type DocumentsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Documents'] = ResolversParentTypes['Documents']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressProofUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bookingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  idCardBackUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idCardFrontUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idExpiry?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  idNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseBackUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseExpiry?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  licenseFrontUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['VerificationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
}>;

export type FuelTypeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FuelType'] = ResolversParentTypes['FuelType']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type LoginPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LoginPayload'] = ResolversParentTypes['LoginPayload']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addCar?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationAddCarArgs, 'input'>>;
  adminCreateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationAdminCreateBookingArgs, 'input'>>;
  adminRecordBookingPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationAdminRecordBookingPaymentArgs, 'amount' | 'bookingId' | 'paymentMethodId'>>;
  adminRefundBookingPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationAdminRefundBookingPaymentArgs, 'bookingId'>>;
  adminUpdateBookingStatus?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationAdminUpdateBookingStatusArgs, 'id' | 'status'>>;
  adminVerifyBookingDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationAdminVerifyBookingDocumentsArgs, 'bookingId' | 'status'>>;
  adminVerifyDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationAdminVerifyDocumentsArgs, 'status' | 'userId'>>;
  cancelBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCancelBookingArgs, 'id'>>;
  changePassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'currentPassword' | 'newPassword'>>;
  createBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationCreateBookingArgs, 'input'>>;
  createBrand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType, RequireFields<MutationCreateBrandArgs, 'name'>>;
  createCheckoutSession?: Resolver<ResolversTypes['CheckoutSession'], ParentType, ContextType, RequireFields<MutationCreateCheckoutSessionArgs, 'bookingId'>>;
  createFuelType?: Resolver<ResolversTypes['FuelType'], ParentType, ContextType, RequireFields<MutationCreateFuelTypeArgs, 'name'>>;
  createModel?: Resolver<ResolversTypes['VehicleModel'], ParentType, ContextType, RequireFields<MutationCreateModelArgs, 'brandId' | 'name'>>;
  createPaymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationCreatePaymentMethodArgs, 'name'>>;
  deleteBrand?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteBrandArgs, 'id'>>;
  deleteCar?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCarArgs, 'id'>>;
  deleteCarImage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCarImageArgs, 'imageId'>>;
  deleteFuelType?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteFuelTypeArgs, 'id'>>;
  deleteModel?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteModelArgs, 'id'>>;
  deletePaymentMethod?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePaymentMethodArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  extendBookingDates?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationExtendBookingDatesArgs, 'id' | 'newEndDate'>>;
  login?: Resolver<ResolversTypes['LoginPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationLogoutArgs, 'refreshToken'>>;
  mockFinalizePayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationMockFinalizePaymentArgs, 'bookingId' | 'success'>>;
  processDocumentOCR?: Resolver<ResolversTypes['OCRPayload'], ParentType, ContextType, RequireFields<MutationProcessDocumentOcrArgs, 'addressProofUrl' | 'idCardBackUrl' | 'idCardFrontUrl' | 'licenseBackUrl' | 'licenseFrontUrl'>>;
  refreshTokens?: Resolver<ResolversTypes['RefreshTokensPayload'], ParentType, ContextType, RequireFields<MutationRefreshTokensArgs, 'refreshToken'>>;
  refundPayment?: Resolver<ResolversTypes['Payment'], ParentType, ContextType, RequireFields<MutationRefundPaymentArgs, 'paymentId'>>;
  register?: Resolver<ResolversTypes['RegisterPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'input'>>;
  resendOTP?: Resolver<ResolversTypes['ResendOTPPayload'], ParentType, ContextType, RequireFields<MutationResendOtpArgs, 'email'>>;
  reuseDocumentsForBooking?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationReuseDocumentsForBookingArgs, 'bookingId'>>;
  saveBookingDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationSaveBookingDocumentsArgs, 'bookingId' | 'input'>>;
  saveDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationSaveDocumentsArgs, 'input'>>;
  scheduleCarMaintenance?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationScheduleCarMaintenanceArgs, 'id'>>;
  setPrimaryImage?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationSetPrimaryImageArgs, 'carId' | 'imageId'>>;
  updateBooking?: Resolver<ResolversTypes['Booking'], ParentType, ContextType, RequireFields<MutationUpdateBookingArgs, 'id' | 'input'>>;
  updateBrand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType, RequireFields<MutationUpdateBrandArgs, 'id' | 'name'>>;
  updateCar?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarArgs, 'id' | 'input'>>;
  updateCarPricing?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarPricingArgs, 'basePrice' | 'id'>>;
  updateCarStatus?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarStatusArgs, 'id' | 'status'>>;
  updateFuelType?: Resolver<ResolversTypes['FuelType'], ParentType, ContextType, RequireFields<MutationUpdateFuelTypeArgs, 'id' | 'name'>>;
  updateModel?: Resolver<ResolversTypes['VehicleModel'], ParentType, ContextType, RequireFields<MutationUpdateModelArgs, 'id'>>;
  updateMyProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateMyProfileArgs, 'input'>>;
  updatePaymentMethod?: Resolver<ResolversTypes['PaymentMethod'], ParentType, ContextType, RequireFields<MutationUpdatePaymentMethodArgs, 'id' | 'name'>>;
  updateUserRole?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'id' | 'role'>>;
  uploadCarImages?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUploadCarImagesArgs, 'carId' | 'images'>>;
  verifyOTP?: Resolver<ResolversTypes['VerifyOTPPayload'], ParentType, ContextType, RequireFields<MutationVerifyOtpArgs, 'email' | 'otp'>>;
}>;

export type OcrPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OCRPayload'] = ResolversParentTypes['OCRPayload']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birthDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type OcrResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OCRResult'] = ResolversParentTypes['OCRResult']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fallbackUsed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  idExpiry?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  idNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isQuotaExceeded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  licenseExpiry?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  licenseNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  currentPage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type PaginatedBookingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedBookings'] = ResolversParentTypes['PaginatedBookings']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type PaginatedCarsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedCars'] = ResolversParentTypes['PaginatedCars']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['Car']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type PaginatedPaymentsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedPayments'] = ResolversParentTypes['PaginatedPayments']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['Payment']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type PaginatedUsersResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedUsers'] = ResolversParentTypes['PaginatedUsers']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type PaymentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Payment'] = ResolversParentTypes['Payment']> = ResolversObject<{
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  bookingId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  refundPolicy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refundedAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  refundedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['PaymentStatus'], ParentType, ContextType>;
  stripeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
}>;

export type PaymentMethodResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaymentMethod'] = ResolversParentTypes['PaymentMethod']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  adminReports?: Resolver<ResolversTypes['AdminReports'], ParentType, ContextType, Partial<QueryAdminReportsArgs>>;
  availableCars?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, RequireFields<QueryAvailableCarsArgs, 'endDate' | 'startDate'>>;
  booking?: Resolver<Maybe<ResolversTypes['Booking']>, ParentType, ContextType, RequireFields<QueryBookingArgs, 'id'>>;
  bookingDocuments?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType, RequireFields<QueryBookingDocumentsArgs, 'bookingId'>>;
  bookingQuote?: Resolver<ResolversTypes['BookingQuote'], ParentType, ContextType, RequireFields<QueryBookingQuoteArgs, 'carId' | 'endDate' | 'startDate'>>;
  bookings?: Resolver<ResolversTypes['PaginatedBookings'], ParentType, ContextType, Partial<QueryBookingsArgs>>;
  brands?: Resolver<Array<ResolversTypes['Brand']>, ParentType, ContextType>;
  car?: Resolver<Maybe<ResolversTypes['Car']>, ParentType, ContextType, RequireFields<QueryCarArgs, 'id'>>;
  carAvailabilityCalendar?: Resolver<Array<ResolversTypes['CalendarDay']>, ParentType, ContextType, RequireFields<QueryCarAvailabilityCalendarArgs, 'carId' | 'month' | 'year'>>;
  cars?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, Partial<QueryCarsArgs>>;
  carsByStatus?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, RequireFields<QueryCarsByStatusArgs, 'status'>>;
  cloudinarySignature?: Resolver<ResolversTypes['CloudinarySignature'], ParentType, ContextType, RequireFields<QueryCloudinarySignatureArgs, 'folder'>>;
  dashboardStats?: Resolver<ResolversTypes['DashboardStats'], ParentType, ContextType>;
  fuelTypes?: Resolver<Array<ResolversTypes['FuelType']>, ParentType, ContextType>;
  hasApprovedDocuments?: Resolver<ResolversTypes['DocumentReuseStatus'], ParentType, ContextType>;
  isEmailAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryIsEmailAvailableArgs, 'email'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  models?: Resolver<Array<ResolversTypes['VehicleModel']>, ParentType, ContextType>;
  myBookings?: Resolver<ResolversTypes['PaginatedBookings'], ParentType, ContextType, Partial<QueryMyBookingsArgs>>;
  myDocuments?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType>;
  myPayments?: Resolver<ResolversTypes['PaginatedPayments'], ParentType, ContextType, Partial<QueryMyPaymentsArgs>>;
  payment?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType, RequireFields<QueryPaymentArgs, 'id'>>;
  paymentByBooking?: Resolver<Maybe<ResolversTypes['Payment']>, ParentType, ContextType, RequireFields<QueryPaymentByBookingArgs, 'bookingId'>>;
  paymentMethods?: Resolver<Array<ResolversTypes['PaymentMethod']>, ParentType, ContextType>;
  payments?: Resolver<ResolversTypes['PaginatedPayments'], ParentType, ContextType, Partial<QueryPaymentsArgs>>;
  refundPreview?: Resolver<Maybe<ResolversTypes['RefundPreview']>, ParentType, ContextType, RequireFields<QueryRefundPreviewArgs, 'bookingId'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUsers'], ParentType, ContextType, Partial<QueryUsersArgs>>;
}>;

export type RefreshTokensPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RefreshTokensPayload'] = ResolversParentTypes['RefreshTokensPayload']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type RefundPreviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RefundPreview'] = ResolversParentTypes['RefundPreview']> = ResolversObject<{
  hoursUntilPickup?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  keepAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  policy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refundAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
}>;

export type RegisterPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RegisterPayload'] = ResolversParentTypes['RegisterPayload']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type ResendOtpPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ResendOTPPayload'] = ResolversParentTypes['ResendOTPPayload']> = ResolversObject<{
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  bookings?: Resolver<Array<ResolversTypes['Booking']>, ParentType, ContextType>;
  documents?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fullName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
}>;

export type VehicleModelResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VehicleModel'] = ResolversParentTypes['VehicleModel']> = ResolversObject<{
  brand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type VerifyOtpPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['VerifyOTPPayload'] = ResolversParentTypes['VerifyOTPPayload']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  AdminDashboardBooking?: AdminDashboardBookingResolvers<ContextType>;
  AdminDashboardCar?: AdminDashboardCarResolvers<ContextType>;
  AdminReportBookingLanes?: AdminReportBookingLanesResolvers<ContextType>;
  AdminReportMoneyMetric?: AdminReportMoneyMetricResolvers<ContextType>;
  AdminReportPaymentMethod?: AdminReportPaymentMethodResolvers<ContextType>;
  AdminReportStatusBreakdown?: AdminReportStatusBreakdownResolvers<ContextType>;
  AdminReports?: AdminReportsResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  BookingQuote?: BookingQuoteResolvers<ContextType>;
  Brand?: BrandResolvers<ContextType>;
  CalendarDay?: CalendarDayResolvers<ContextType>;
  Car?: CarResolvers<ContextType>;
  CarImage?: CarImageResolvers<ContextType>;
  CheckoutSession?: CheckoutSessionResolvers<ContextType>;
  CloudinarySignature?: CloudinarySignatureResolvers<ContextType>;
  DashboardStats?: DashboardStatsResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DocumentReuseStatus?: DocumentReuseStatusResolvers<ContextType>;
  Documents?: DocumentsResolvers<ContextType>;
  FuelType?: FuelTypeResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  LoginPayload?: LoginPayloadResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OCRPayload?: OcrPayloadResolvers<ContextType>;
  OCRResult?: OcrResultResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedBookings?: PaginatedBookingsResolvers<ContextType>;
  PaginatedCars?: PaginatedCarsResolvers<ContextType>;
  PaginatedPayments?: PaginatedPaymentsResolvers<ContextType>;
  PaginatedUsers?: PaginatedUsersResolvers<ContextType>;
  Payment?: PaymentResolvers<ContextType>;
  PaymentMethod?: PaymentMethodResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshTokensPayload?: RefreshTokensPayloadResolvers<ContextType>;
  RefundPreview?: RefundPreviewResolvers<ContextType>;
  RegisterPayload?: RegisterPayloadResolvers<ContextType>;
  ResendOTPPayload?: ResendOtpPayloadResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  VehicleModel?: VehicleModelResolvers<ContextType>;
  VerifyOTPPayload?: VerifyOtpPayloadResolvers<ContextType>;
}>;

