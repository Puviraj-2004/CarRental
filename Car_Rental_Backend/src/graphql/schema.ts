import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { DateTimeResolver } from 'graphql-scalars';
import type { Resolvers } from './__generated__/types';

import { userResolvers } from '../modules/users/user.resolver';
import { authResolvers } from '../modules/auth/auth.resolver';
import { carResolvers }  from '../modules/cars/car.resolver';
import { bookingResolvers } from '../modules/bookings/booking.resolver';

function loadSDL(relativePath: string) {
  const content = readFileSync(join(__dirname, relativePath), 'utf8');
  return gql(content);
}

const baseTypeDefs   = loadSDL('../graphql/base.graphql');
const authTypeDefs   = loadSDL('../modules/auth/auth.graphql');
const userTypeDefs   = loadSDL('../modules/users/user.graphql');
const carTypeDefs    = loadSDL('../modules/cars/car.graphql');
const bookingTypeDefs = loadSDL('../modules/bookings/booking.graphql');

const resolverModules: Resolvers[] = [
  { DateTime: DateTimeResolver } as unknown as Resolvers,
  authResolvers as unknown as Resolvers,
  userResolvers as unknown as Resolvers,
  carResolvers  as unknown as Resolvers,
  bookingResolvers  as unknown as Resolvers,
];

export const typeDefs  = mergeTypeDefs([baseTypeDefs, authTypeDefs, userTypeDefs, carTypeDefs, bookingTypeDefs]);
export const resolvers = mergeResolvers(resolverModules);