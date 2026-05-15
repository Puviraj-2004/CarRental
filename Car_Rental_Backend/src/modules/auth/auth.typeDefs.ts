import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const authTypeDefs = gql(
  readFileSync(join(__dirname, 'auth.graphql'), 'utf8'),
);
