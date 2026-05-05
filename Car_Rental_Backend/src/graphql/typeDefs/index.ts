import { mergeTypeDefs } from '@graphql-tools/merge';
import { userTypeDefs } from './userTypeDefs';
import { carTypeDefs } from './carTypeDefs';
import { bookingTypeDefs } from './bookingTypeDefs';
import { paymentTypeDefs } from './paymentTypeDefs';
import { platformTypeDefs } from './platformTypeDefs';
import { paginationTypeDefs } from './paginationTypeDefs';
import { brandTypeDefs } from './brandTypeDefs';
import { modelTypeDefs } from './modelTypeDefs';

const typeDefs = mergeTypeDefs([
  paginationTypeDefs,
  userTypeDefs,
  brandTypeDefs,
  modelTypeDefs,
  carTypeDefs,
  bookingTypeDefs,
  paymentTypeDefs,
  platformTypeDefs,
]);

export default typeDefs;