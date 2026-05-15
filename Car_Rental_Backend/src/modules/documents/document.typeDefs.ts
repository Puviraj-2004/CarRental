import { gql } from 'graphql-tag';

export const documentTypeDefs = gql`
  extend type Query {
    _documentPlaceholder: Boolean
  }
  extend type Mutation {
    _documentMutationPlaceholder: Boolean
  }
`;
