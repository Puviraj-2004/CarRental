import { gql } from '@apollo/client';

export const ADD_CAR_MUTATION = gql`
  mutation AddCar($input: AddCarInput!) {
    addCar(input: $input) {
      id
      plateNumber
      basePrice
      status
      primaryImageUrl
      model {
        id
        name
        brand {
          id
          name
        }
      }
      fuelType {
        id
        name
      }
    }
  }
`;

export const UPDATE_CAR_MUTATION = gql`
  mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id
      plateNumber
      basePrice
      status
      primaryImageUrl
      model {
        id
        name
        brand {
          id
          name
        }
      }
      fuelType {
        id
        name
      }
    }
  }
`;

export const DELETE_CAR_MUTATION = gql`
  mutation DeleteCar($id: ID!) {
    deleteCar(id: $id)
  }
`;

export const UPLOAD_CAR_IMAGES_MUTATION = gql`
  mutation UploadCarImages($carId: ID!, $images: [ImageInput!]!, $setPrimary: Boolean) { # <-- Updated: [Upload!]! to [ImageInput!]!
    uploadCarImages(carId: $carId, images: $images, setPrimary: $setPrimary) {
      id
      images {
        id
        url
      }
    }
  }
`;

export const DELETE_CAR_IMAGE_MUTATION = gql`
  mutation DeleteCarImage($imageId: ID!) {
    deleteCarImage(imageId: $imageId)
  }
`;

export const SET_PRIMARY_IMAGE_MUTATION = gql`
  mutation SetPrimaryImage($carId: ID!, $imageId: ID!) {
    setPrimaryImage(carId: $carId, imageId: $imageId) {
      id
      primaryImageUrl
    }
  }
`;