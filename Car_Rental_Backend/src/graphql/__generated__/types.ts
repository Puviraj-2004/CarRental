import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { UserWithRelations, PrismaDocuments, BookingWithRelations, CarWithRelations, ModelWithBrand } from '../../prisma/types';
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
  primaryImage?: InputMaybe<Scalars['Upload']['input']>;
  status?: InputMaybe<CarStatus>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type Booking = {
  __typename?: 'Booking';
  createdAt: Scalars['String']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  startDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  totalPrice: Scalars['String']['output'];
};

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
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type CarStatus =
  | 'AVAILABLE'
  | 'RENTED'
  | 'RESERVED'
  | 'UNAVAILABLE';

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
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  idCardBackUrl?: Maybe<Scalars['String']['output']>;
  idCardFrontUrl?: Maybe<Scalars['String']['output']>;
  idExpiry?: Maybe<Scalars['String']['output']>;
  idNumber?: Maybe<Scalars['String']['output']>;
  licenseBackUrl?: Maybe<Scalars['String']['output']>;
  licenseExpiry?: Maybe<Scalars['String']['output']>;
  licenseFrontUrl?: Maybe<Scalars['String']['output']>;
  licenseNumber?: Maybe<Scalars['String']['output']>;
  status: VerificationStatus;
  updatedAt: Scalars['String']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type DocumentsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  addressProofFile?: InputMaybe<Scalars['Upload']['input']>;
  age?: InputMaybe<Scalars['Int']['input']>;
  idCardBackFile?: InputMaybe<Scalars['Upload']['input']>;
  idCardFrontFile?: InputMaybe<Scalars['Upload']['input']>;
  idExpiry?: InputMaybe<Scalars['String']['input']>;
  idNumber?: InputMaybe<Scalars['String']['input']>;
  licenseBackFile?: InputMaybe<Scalars['Upload']['input']>;
  licenseExpiry?: InputMaybe<Scalars['String']['input']>;
  licenseFrontFile?: InputMaybe<Scalars['Upload']['input']>;
  licenseNumber?: InputMaybe<Scalars['String']['input']>;
};

export type FuelType = {
  __typename?: 'FuelType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addCar: Car;
  adminVerifyDocuments: Documents;
  changePassword: Scalars['Boolean']['output'];
  deleteCar: Scalars['Boolean']['output'];
  deleteCarImage: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  processDocumentOCR: OcrResult;
  refreshTokens: RefreshPayload;
  register: RegisterPayload;
  resendOTP: ResendOtpPayload;
  saveDocuments: Documents;
  scheduleCarMaintenance: Car;
  setPrimaryImage: Car;
  updateCar: Car;
  updateCarPricing: Car;
  updateCarStatus: Car;
  updateUserRole: User;
  uploadCarImages: Car;
  verifyOTP: VerifyOtpPayload;
};


export type MutationAddCarArgs = {
  input: AddCarInput;
};


export type MutationAdminVerifyDocumentsArgs = {
  status: VerificationStatus;
  userId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationDeleteCarArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCarImageArgs = {
  imageId: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationProcessDocumentOcrArgs = {
  documentType: DocumentType;
  file: Scalars['Upload']['input'];
  side: DocumentSide;
};


export type MutationRefreshTokensArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationResendOtpArgs = {
  email: Scalars['String']['input'];
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


export type MutationUpdateUserRoleArgs = {
  id: Scalars['ID']['input'];
  role: Role;
};


export type MutationUploadCarImagesArgs = {
  carId: Scalars['ID']['input'];
  images: Array<Scalars['Upload']['input']>;
  setPrimary?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationVerifyOtpArgs = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
};

export type OcrResult = {
  __typename?: 'OCRResult';
  address?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  fallbackUsed?: Maybe<Scalars['Boolean']['output']>;
  idExpiry?: Maybe<Scalars['String']['output']>;
  idNumber?: Maybe<Scalars['String']['output']>;
  isQuotaExceeded?: Maybe<Scalars['Boolean']['output']>;
  licenseExpiry?: Maybe<Scalars['String']['output']>;
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

export type PaginatedCars = {
  __typename?: 'PaginatedCars';
  items: Array<Car>;
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

export type Query = {
  __typename?: 'Query';
  availableCars: PaginatedCars;
  car?: Maybe<Car>;
  carAvailabilityCalendar: Array<CalendarDay>;
  cars: PaginatedCars;
  carsByStatus: PaginatedCars;
  isEmailAvailable: Scalars['Boolean']['output'];
  me?: Maybe<User>;
  myDocuments?: Maybe<Documents>;
  user?: Maybe<User>;
  users: PaginatedUsers;
};


export type QueryAvailableCarsArgs = {
  endDate: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
  startDate: Scalars['String']['input'];
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


export type QueryIsEmailAvailableArgs = {
  email: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type RefreshPayload = {
  __typename?: 'RefreshPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RegisterPayload = {
  __typename?: 'RegisterPayload';
  email: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ResendOtpPayload = {
  __typename?: 'ResendOTPPayload';
  expiresAt?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Role =
  | 'ADMIN'
  | 'USER';

export type UpdateCarInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  fuelTypeId?: InputMaybe<Scalars['ID']['input']>;
  plateNumber?: InputMaybe<Scalars['String']['input']>;
  primaryImage?: InputMaybe<Scalars['Upload']['input']>;
};

export type User = {
  __typename?: 'User';
  bookings: Array<Booking>;
  documents?: Maybe<Documents>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
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
  AuthPayload: ResolverTypeWrapper<Omit<AuthPayload, 'user'> & { user: ResolversTypes['User'] }>;
  Booking: ResolverTypeWrapper<BookingWithRelations>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Brand: ResolverTypeWrapper<Brand>;
  CalendarDay: ResolverTypeWrapper<CalendarDay>;
  Car: ResolverTypeWrapper<CarWithRelations>;
  CarFilterInput: CarFilterInput;
  CarImage: ResolverTypeWrapper<CarImage>;
  CarStatus: CarStatus;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DocumentSide: DocumentSide;
  DocumentType: DocumentType;
  Documents: ResolverTypeWrapper<PrismaDocuments>;
  DocumentsInput: DocumentsInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FuelType: ResolverTypeWrapper<FuelType>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LoginInput: LoginInput;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  OCRResult: ResolverTypeWrapper<OcrResult>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedCars: ResolverTypeWrapper<Omit<PaginatedCars, 'items'> & { items: Array<ResolversTypes['Car']> }>;
  PaginatedUsers: ResolverTypeWrapper<Omit<PaginatedUsers, 'items'> & { items: Array<ResolversTypes['User']> }>;
  PaginationInput: PaginationInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefreshPayload: ResolverTypeWrapper<RefreshPayload>;
  RegisterInput: RegisterInput;
  RegisterPayload: ResolverTypeWrapper<RegisterPayload>;
  ResendOTPPayload: ResolverTypeWrapper<ResendOtpPayload>;
  Role: Role;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateCarInput: UpdateCarInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<UserWithRelations>;
  VehicleModel: ResolverTypeWrapper<ModelWithBrand>;
  VerificationStatus: VerificationStatus;
  VerifyOTPPayload: ResolverTypeWrapper<VerifyOtpPayload>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddCarInput: AddCarInput;
  AuthPayload: Omit<AuthPayload, 'user'> & { user: ResolversParentTypes['User'] };
  Booking: BookingWithRelations;
  Boolean: Scalars['Boolean']['output'];
  Brand: Brand;
  CalendarDay: CalendarDay;
  Car: CarWithRelations;
  CarFilterInput: CarFilterInput;
  CarImage: CarImage;
  DateTime: Scalars['DateTime']['output'];
  Documents: PrismaDocuments;
  DocumentsInput: DocumentsInput;
  Float: Scalars['Float']['output'];
  FuelType: FuelType;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LoginInput: LoginInput;
  Mutation: Record<PropertyKey, never>;
  OCRResult: OcrResult;
  PageInfo: PageInfo;
  PaginatedCars: Omit<PaginatedCars, 'items'> & { items: Array<ResolversParentTypes['Car']> };
  PaginatedUsers: Omit<PaginatedUsers, 'items'> & { items: Array<ResolversParentTypes['User']> };
  PaginationInput: PaginationInput;
  Query: Record<PropertyKey, never>;
  RefreshPayload: RefreshPayload;
  RegisterInput: RegisterInput;
  RegisterPayload: RegisterPayload;
  ResendOTPPayload: ResendOtpPayload;
  String: Scalars['String']['output'];
  UpdateCarInput: UpdateCarInput;
  Upload: Scalars['Upload']['output'];
  User: UserWithRelations;
  VehicleModel: ModelWithBrand;
  VerifyOTPPayload: VerifyOtpPayload;
}>;

export type AuthPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type BookingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Booking'] = ResolversParentTypes['Booking']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalPrice?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  primaryImageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['CarStatus'], ParentType, ContextType>;
}>;

export type CarImageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CarImage'] = ResolversParentTypes['CarImage']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DocumentsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Documents'] = ResolversParentTypes['Documents']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressProofUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bookingId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  idCardBackUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idCardFrontUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseBackUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseFrontUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['VerificationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
}>;

export type FuelTypeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['FuelType'] = ResolversParentTypes['FuelType']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addCar?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationAddCarArgs, 'input'>>;
  adminVerifyDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationAdminVerifyDocumentsArgs, 'status' | 'userId'>>;
  changePassword?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'currentPassword' | 'newPassword'>>;
  deleteCar?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCarArgs, 'id'>>;
  deleteCarImage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCarImageArgs, 'imageId'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationLogoutArgs, 'refreshToken'>>;
  processDocumentOCR?: Resolver<ResolversTypes['OCRResult'], ParentType, ContextType, RequireFields<MutationProcessDocumentOcrArgs, 'documentType' | 'file' | 'side'>>;
  refreshTokens?: Resolver<ResolversTypes['RefreshPayload'], ParentType, ContextType, RequireFields<MutationRefreshTokensArgs, 'refreshToken'>>;
  register?: Resolver<ResolversTypes['RegisterPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'input'>>;
  resendOTP?: Resolver<ResolversTypes['ResendOTPPayload'], ParentType, ContextType, RequireFields<MutationResendOtpArgs, 'email'>>;
  saveDocuments?: Resolver<ResolversTypes['Documents'], ParentType, ContextType, RequireFields<MutationSaveDocumentsArgs, 'input'>>;
  scheduleCarMaintenance?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationScheduleCarMaintenanceArgs, 'id'>>;
  setPrimaryImage?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationSetPrimaryImageArgs, 'carId' | 'imageId'>>;
  updateCar?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarArgs, 'id' | 'input'>>;
  updateCarPricing?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarPricingArgs, 'basePrice' | 'id'>>;
  updateCarStatus?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUpdateCarStatusArgs, 'id' | 'status'>>;
  updateUserRole?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'id' | 'role'>>;
  uploadCarImages?: Resolver<ResolversTypes['Car'], ParentType, ContextType, RequireFields<MutationUploadCarImagesArgs, 'carId' | 'images'>>;
  verifyOTP?: Resolver<ResolversTypes['VerifyOTPPayload'], ParentType, ContextType, RequireFields<MutationVerifyOtpArgs, 'email' | 'otp'>>;
}>;

export type OcrResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OCRResult'] = ResolversParentTypes['OCRResult']> = ResolversObject<{
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fallbackUsed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  idExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isQuotaExceeded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  licenseExpiry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  licenseNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PageInfoResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = ResolversObject<{
  currentPage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPages?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type PaginatedCarsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedCars'] = ResolversParentTypes['PaginatedCars']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['Car']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type PaginatedUsersResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PaginatedUsers'] = ResolversParentTypes['PaginatedUsers']> = ResolversObject<{
  items?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  availableCars?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, RequireFields<QueryAvailableCarsArgs, 'endDate' | 'startDate'>>;
  car?: Resolver<Maybe<ResolversTypes['Car']>, ParentType, ContextType, RequireFields<QueryCarArgs, 'id'>>;
  carAvailabilityCalendar?: Resolver<Array<ResolversTypes['CalendarDay']>, ParentType, ContextType, RequireFields<QueryCarAvailabilityCalendarArgs, 'carId' | 'month' | 'year'>>;
  cars?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, Partial<QueryCarsArgs>>;
  carsByStatus?: Resolver<ResolversTypes['PaginatedCars'], ParentType, ContextType, RequireFields<QueryCarsByStatusArgs, 'status'>>;
  isEmailAvailable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryIsEmailAvailableArgs, 'email'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  myDocuments?: Resolver<Maybe<ResolversTypes['Documents']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUsers'], ParentType, ContextType, Partial<QueryUsersArgs>>;
}>;

export type RefreshPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RefreshPayload'] = ResolversParentTypes['RefreshPayload']> = ResolversObject<{
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type RegisterPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RegisterPayload'] = ResolversParentTypes['RegisterPayload']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type ResendOtpPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ResendOTPPayload'] = ResolversParentTypes['ResendOTPPayload']> = ResolversObject<{
  expiresAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Booking?: BookingResolvers<ContextType>;
  Brand?: BrandResolvers<ContextType>;
  CalendarDay?: CalendarDayResolvers<ContextType>;
  Car?: CarResolvers<ContextType>;
  CarImage?: CarImageResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Documents?: DocumentsResolvers<ContextType>;
  FuelType?: FuelTypeResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  OCRResult?: OcrResultResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedCars?: PaginatedCarsResolvers<ContextType>;
  PaginatedUsers?: PaginatedUsersResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshPayload?: RefreshPayloadResolvers<ContextType>;
  RegisterPayload?: RegisterPayloadResolvers<ContextType>;
  ResendOTPPayload?: ResendOtpPayloadResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  VehicleModel?: VehicleModelResolvers<ContextType>;
  VerifyOTPPayload?: VerifyOtpPayloadResolvers<ContextType>;
}>;

