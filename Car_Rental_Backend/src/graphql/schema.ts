import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { DateTimeResolver } from 'graphql-scalars';
import type { Resolvers } from './__generated__/types';

import { userResolvers } from '../modules/users/user.resolver';
import { authResolvers } from '../modules/auth/auth.resolver';
import { carResolvers }  from '../modules/cars/car.resolver';

/**
 * Load a .graphql SDL file relative to this file's directory.
 * Using readFileSync + gql keeps the file content cached by Node's
 * require cache and avoids re-parsing on every request.
 */
function loadSDL(relativePath: string) {
  const content = readFileSync(join(__dirname, relativePath), 'utf8');
  return gql(content);
}

/**
 * Each module owns its own .graphql file alongside its resolver.
 * Add new modules here as they are built — one loadSDL line each.
 *
 * Codegen (codegen.ts) reads the same .graphql files via a glob so the
 * generated types always stay in sync with what is served at runtime.
 */
const baseTypeDefs   = loadSDL('../graphql/base.graphql');
const authTypeDefs   = loadSDL('../modules/auth/auth.graphql');
const userTypeDefs   = loadSDL('../modules/users/user.graphql');
const carTypeDefs    = loadSDL('../modules/cars/car.graphql');

/**
 * After running `npm run codegen`, import the generated Resolvers type:
 *
 *   import type { Resolvers } from './__generated__/types';
 *
 * and replace `IResolvers` with `Resolvers` in the array below for
 * end-to-end typed resolvers.
 */
const resolverModules: Resolvers[] = [
  { DateTime: DateTimeResolver } as unknown as Resolvers,
  authResolvers as unknown as Resolvers,
  userResolvers as unknown as Resolvers,
  carResolvers  as unknown as Resolvers,
];

export const typeDefs  = mergeTypeDefs([baseTypeDefs, authTypeDefs, userTypeDefs, carTypeDefs]);
export const resolvers = mergeResolvers(resolverModules);