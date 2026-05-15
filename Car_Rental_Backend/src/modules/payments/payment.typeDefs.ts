import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
  extend type Query {
    _paymentPlaceholder: Boolean
  }
  extend type Mutation {
    _paymentMutationPlaceholder: Boolean
  }
`;
