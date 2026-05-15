import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql`
  extend type Query {
    _bookingPlaceholder: Boolean
  }
  extend type Mutation {
    _bookingMutationPlaceholder: Boolean
  }
`;
