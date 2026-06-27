import { gql } from '@apollo/client';

export const GET_BRANDS_QUERY = gql`
  query GetBrands {
    brands {
      id
      name
    }
  }
`;

export const GET_MODELS_QUERY = gql`
  query GetModels {
    models {
      id
      name
      brand {
        id
        name
      }
    }
  }
`;

export const GET_FUEL_TYPES_QUERY = gql`
  query GetFuelTypes {
    fuelTypes {
      id
      name
    }
  }
`;

export const GET_PAYMENT_METHODS_QUERY = gql`
  query GetPaymentMethods {
    paymentMethods {
      id
      name
    }
  }
`;

// Brand Mutations
export const CREATE_BRAND_MUTATION = gql`
  mutation CreateBrand($name: String!) {
    createBrand(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($id: ID!, $name: String!) {
    updateBrand(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_BRAND_MUTATION = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id)
  }
`;

// Model Mutations
export const CREATE_MODEL_MUTATION = gql`
  mutation CreateModel($name: String!, $brandId: ID!) {
    createModel(name: $name, brandId: $brandId) {
      id
      name
      brand {
        id
        name
      }
    }
  }
`;

export const UPDATE_MODEL_MUTATION = gql`
  mutation UpdateModel($id: ID!, $name: String, $brandId: ID) {
    updateModel(id: $id, name: $name, brandId: $brandId) {
      id
      name
      brand {
        id
        name
      }
    }
  }
`;

export const DELETE_MODEL_MUTATION = gql`
  mutation DeleteModel($id: ID!) {
    deleteModel(id: $id)
  }
`;

// FuelType Mutations
export const CREATE_FUEL_TYPE_MUTATION = gql`
  mutation CreateFuelType($name: String!) {
    createFuelType(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_FUEL_TYPE_MUTATION = gql`
  mutation UpdateFuelType($id: ID!, $name: String!) {
    updateFuelType(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_FUEL_TYPE_MUTATION = gql`
  mutation DeleteFuelType($id: ID!) {
    deleteFuelType(id: $id)
  }
`;

// PaymentMethod Mutations
export const CREATE_PAYMENT_METHOD_MUTATION = gql`
  mutation CreatePaymentMethod($name: String!) {
    createPaymentMethod(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_PAYMENT_METHOD_MUTATION = gql`
  mutation UpdatePaymentMethod($id: ID!, $name: String!) {
    updatePaymentMethod(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_PAYMENT_METHOD_MUTATION = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id)
  }
`;
