import { gql } from 'graphql-tag';

export const modelTypeDefs = gql`
  # --- Types ---
  type VehicleModel {
    id: ID!
    name: String!
    brandId: String!
    brand: Brand!
    cars: [Car!]
  }

  # --- Queries ---
  extend type Query {
    models(brandId: ID): [VehicleModel!]!
    model(id: ID!): VehicleModel
  }

  # --- Mutations ---
  extend type Mutation {
    createModel(name: String!, brandId: ID!): VehicleModel!
    updateModel(id: ID!, name: String!, brandId: ID): VehicleModel!
    deleteModel(id: ID!): Boolean!
  }
`;