import { gql } from 'graphql-tag';

export const adminTypeDefs = gql`
  extend type Query {
    _adminPlaceholder: Boolean
  }
  extend type Mutation {
    _adminMutationPlaceholder: Boolean
  }
`;
