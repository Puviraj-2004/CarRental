import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const carTypeDefs = gql(
  readFileSync(join(__dirname, 'car.graphql'), 'utf8'),
);
