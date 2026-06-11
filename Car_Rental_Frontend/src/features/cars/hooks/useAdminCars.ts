import { useMutation, FetchResult } from '@apollo/client';
import {
  ADD_CAR_MUTATION,
  UPDATE_CAR_MUTATION,
  DELETE_CAR_MUTATION,
  UPLOAD_CAR_IMAGES_MUTATION,
  DELETE_CAR_IMAGE_MUTATION,
  SET_PRIMARY_IMAGE_MUTATION
} from '../graphql/mutations';
import { Car } from './useCar';

export interface AddCarInput {
  modelId:      string;
  plateNumber:  string;
  fuelTypeId?:  string | null;
  basePrice:    number;
  status?:      'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE' | null;
  primaryImage?: File | null;
}

export interface UpdateCarInput {
  plateNumber?:  string | null;
  fuelTypeId?:   string | null;
  basePrice?:    number | null;
  primaryImage?: File | null;
}

export interface UseAdminCarsReturn {
  executeAdd:          (input: AddCarInput) => Promise<FetchResult<{ addCar: Car }>>;
  loadingAdd:          boolean;
  executeUpdate:       (id: string, input: UpdateCarInput) => Promise<FetchResult<{ updateCar: Car }>>;
  loadingUpdate:       boolean;
  executeDelete:       (id: string) => Promise<FetchResult<{ deleteCar: boolean }>>;
  loadingDelete:       boolean;
  executeUploadImages: (carId: string, images: File[], setPrimary?: boolean) => Promise<FetchResult<{ uploadCarImages: Car }>>;
  loadingUpload:       boolean;
  executeDeleteImage:  (imageId: string) => Promise<FetchResult<{ deleteCarImage: boolean }>>;
  loadingDeleteImg:    boolean;
  executeSetPrimary:   (carId: string, imageId: string) => Promise<FetchResult<{ setPrimaryImage: Car }>>;
  loadingPrimary:      boolean;
}

export const useAdminCars = (): UseAdminCarsReturn => {
  const [addCar, { loading: loadingAdd }] = useMutation<{ addCar: Car }, { input: AddCarInput }>(
    ADD_CAR_MUTATION
  );

  const [updateCar, { loading: loadingUpdate }] = useMutation<{ updateCar: Car }, { id: string; input: UpdateCarInput }>(
    UPDATE_CAR_MUTATION
  );

  const [deleteCar, { loading: loadingDelete }] = useMutation<{ deleteCar: boolean }, { id: string }>(
    DELETE_CAR_MUTATION
  );

  const [uploadCarImages, { loading: loadingUpload }] = useMutation<
    { uploadCarImages: Car },
    { carId: string; images: File[]; setPrimary?: boolean }
  >(UPLOAD_CAR_IMAGES_MUTATION);

  const [deleteCarImage, { loading: loadingDeleteImg }] = useMutation<{ deleteCarImage: boolean }, { imageId: string }>(
    DELETE_CAR_IMAGE_MUTATION
  );

  const [setPrimaryImage, { loading: loadingPrimary }] = useMutation<{ setPrimaryImage: Car }, { carId: string; imageId: string }>(
    SET_PRIMARY_IMAGE_MUTATION
  );

  const executeAdd = async (input: AddCarInput) => {
    return await addCar({ variables: { input } });
  };

  const executeUpdate = async (id: string, input: UpdateCarInput) => {
    return await updateCar({ variables: { id, input } });
  };

  const executeDelete = async (id: string) => {
    return await deleteCar({ variables: { id } });
  };

  const executeUploadImages = async (carId: string, images: File[], setPrimary?: boolean) => {
    return await uploadCarImages({
      variables: { carId, images, setPrimary },
    });
  };

  const executeDeleteImage = async (imageId: string) => {
    return await deleteCarImage({ variables: { imageId } });
  };

  const executeSetPrimary = async (carId: string, imageId: string) => {
    return await setPrimaryImage({ variables: { carId, imageId } });
  };

  return {
    executeAdd,
    loadingAdd,
    executeUpdate,
    loadingUpdate,
    executeDelete,
    loadingDelete,
    executeUploadImages,
    loadingUpload,
    executeDeleteImage,
    loadingDeleteImg,
    executeSetPrimary,
    loadingPrimary,
  };
};