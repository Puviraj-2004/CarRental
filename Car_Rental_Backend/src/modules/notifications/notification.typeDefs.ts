import { gql } from 'graphql-tag';

export const notificationTypeDefs = gql`
  extend type Mutation {
    _notificationPlaceholder: Boolean
  }
`;
