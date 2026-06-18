import { readFileSync } from 'fs';
import { join } from 'path';
import { gql } from 'graphql-tag';

export const documentTypeDefs = gql(
  readFileSync(join(__dirname, 'document.graphql'), 'utf8'),
);
