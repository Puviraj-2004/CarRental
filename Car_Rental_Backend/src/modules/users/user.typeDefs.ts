import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const userTypeDefs = gql(
  readFileSync(join(__dirname, 'user.graphql'), 'utf8'),
);