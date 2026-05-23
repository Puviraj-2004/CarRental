import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql(
  readFileSync(join(__dirname, 'payment.graphql'), 'utf8'),
);