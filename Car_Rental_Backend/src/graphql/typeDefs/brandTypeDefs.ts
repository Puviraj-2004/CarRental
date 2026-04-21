import { gql } from 'graphql-tag';

export const brandTypeDefs = gql`
  # --- Types ---
  type Brand {
    id: ID!
    name: String!
    logoUrl: String
    models: [VehicleModel!]
    cars: [Car!]
  }

  # --- Queries ---
  extend type Query {
    brands: [Brand!]!
  }

  # --- Mutations ---
  extend type Mutation {
    createBrand(name: String!, logoUrl: String, logoPublicId: String): Brand!
    updateBrand(id: ID!, name: String!, logoUrl: String, logoPublicId: String ): Brand!
    deleteBrand(id: ID!): Boolean!
  }
`;