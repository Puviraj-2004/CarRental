import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql(
  readFileSync(join(__dirname, 'booking.graphql'), 'utf8'),
);