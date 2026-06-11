import { useMutation, FetchResult, useApolloClient } from '@apollo/client';
import {
  ADD_CAR_MUTATION,
  UPDATE_CAR_MUTATION,
  DELETE_CAR_MUTATION,
  UPLOAD_CAR_IMAGES_MUTATION,
  DELETE_CAR_IMAGE_MUTATION,
  SET_PRIMARY_IMAGE_MUTATION
} from '../graphql/mutations';
import { GET_CLOUDINARY_SIGNATURE } from '../graphql/queries';
import { Car } from './useCar';
import { validateFileSize } from '@/lib/fileValidation';

// Structure matching our backend schema expectation
export interface ImageInput {
  url: string;
  publicId: string;
}

export interface AddCarInput {
  modelId:      string;
  plateNumber:  string;
  fuelTypeId?:  string | null;
  basePrice:    number;
  status?:      'AVAILABLE' | 'RESERVED' | 'RENTED' | 'UNAVAILABLE' | null;
  primaryImage?: File | null; // Standard browser File type for simple UI forms
}

export interface UpdateCarInput {
  plateNumber?:  string | null;
  fuelTypeId?:   string | null;
  basePrice?:    number | null;
  primaryImage?: File | null; // Standard browser File type for simple UI forms
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
  const client = useApolloClient(); // Access the Apollo Client instance dynamically

  const [addCar, { loading: loadingAdd }] = useMutation<{ addCar: Car }, { input: any }>(
    ADD_CAR_MUTATION
  );

  const [updateCar, { loading: loadingUpdate }] = useMutation<{ updateCar: Car }, { id: string; input: any }>(
    UPDATE_CAR_MUTATION
  );

  const [deleteCar, { loading: loadingDelete }] = useMutation<{ deleteCar: boolean }, { id: string }>(
    DELETE_CAR_MUTATION
  );

  const [uploadCarImages, { loading: loadingUpload }] = useMutation<
    { uploadCarImages: Car },
    { carId: string; images: ImageInput[]; setPrimary?: boolean } // <-- Expects ImageInput array now
  >(UPLOAD_CAR_IMAGES_MUTATION);

  const [deleteCarImage, { loading: loadingDeleteImg }] = useMutation<{ deleteCarImage: boolean }, { imageId: string }>(
    DELETE_CAR_IMAGE_MUTATION
  );

  const [setPrimaryImage, { loading: loadingPrimary }] = useMutation<{ setPrimaryImage: Car }, { carId: string; imageId: string }>(
    SET_PRIMARY_IMAGE_MUTATION
  );

  // ── Secure Client Side Upload Orchestrator ───────────────────────────────
  const uploadToCloudinary = async (file: File, folder: string): Promise<ImageInput> => {

    validateFileSize(file.size, file.name, 'car_image');
    // 1. Ask backend for cryptographic upload signature
    const { data } = await client.query({
      query: GET_CLOUDINARY_SIGNATURE,
      variables: { folder },
      fetchPolicy: 'no-cache',
    });

    const { signature, timestamp, apiKey, cloudName } = data.cloudinarySignature;

    // 2. Format request payload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Post binary file directly to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image directly to Cloudinary storage.');
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  };

  // ── Execute Actions with Enforced Cloudinary Interception ────────────────

  const executeAdd = async (input: AddCarInput) => {
    let primaryImageMeta: ImageInput | null = null;

    if (input.primaryImage) {
      // Catch and upload to Cloudinary prior to saving record
      primaryImageMeta = await uploadToCloudinary(input.primaryImage, 'cars');
    }

    return await addCar({
      variables: {
        input: {
          modelId:      input.modelId,
          plateNumber:  input.plateNumber,
          fuelTypeId:   input.fuelTypeId,
          basePrice:    input.basePrice,
          status:       input.status,
          primaryImage: primaryImageMeta, // Passes metadata { url, publicId } to backend [1]
        }
      }
    });
  };

  const executeUpdate = async (id: string, input: UpdateCarInput) => {
    let primaryImageMeta: ImageInput | null = null;

    if (input.primaryImage) {
      primaryImageMeta = await uploadToCloudinary(input.primaryImage, 'cars');
    }

    return await updateCar({
      variables: {
        id,
        input: {
          plateNumber:  input.plateNumber,
          fuelTypeId:   input.fuelTypeId,
          basePrice:    input.basePrice,
          primaryImage: primaryImageMeta,
        }
      }
    });
  };

  const executeDelete = async (id: string) => {
    return await deleteCar({ variables: { id } });
  };

  const executeUploadImages = async (carId: string, images: File[], setPrimary?: boolean) => {
    // Highly efficient parallel uploads leveraging Cloudinary direct network architecture
    const uploadPromises = images.map(file => uploadToCloudinary(file, 'cars'));
    const imageMetaArray = await Promise.all(uploadPromises);

    return await uploadCarImages({
      variables: { 
        carId, 
        images: imageMetaArray, // Passes full metadata array to backend
        setPrimary 
      },
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