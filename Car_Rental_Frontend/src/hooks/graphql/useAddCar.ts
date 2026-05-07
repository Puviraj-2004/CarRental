import { useQuery, useMutation } from '@apollo/client';
import {
  GET_BRANDS_QUERY,
  GET_MODELS_BY_BRAND_QUERY,
  GET_CARS_QUERY,
} from '@/lib/graphql/queries';
import {
  CREATE_CAR_MUTATION,
  ADD_CAR_IMAGE_MUTATION,
  DELETE_CAR_MUTATION,
} from '@/lib/graphql/mutations';
import {
  FUEL_TYPE_VALUES,
  TRANSMISSION_VALUES,
  CRIT_AIR_VALUES,
  CAR_STATUS_VALUES,
  LICENSE_CATEGORY_VALUES,
} from '@/lib/constants/enums';

// Static enum values — no network request, no introspection dependency.
// These match schema.prisma and carTypeDefs.ts exactly.
export const CAR_ENUMS = {
  fuelTypes: FUEL_TYPE_VALUES,
  transmissions: TRANSMISSION_VALUES,
  critAirCategories: CRIT_AIR_VALUES,
  carStatuses: CAR_STATUS_VALUES,
  licenseCategories: LICENSE_CATEGORY_VALUES,
} as const;

export const useAddCar = (brandId: string) => {
  const { data: brandData } = useQuery(GET_BRANDS_QUERY);
  const { data: modelData } = useQuery(GET_MODELS_BY_BRAND_QUERY, {
    variables: { brandId },
    skip: !brandId,
  });

  const [createCar] = useMutation(CREATE_CAR_MUTATION, {
    refetchQueries: [{ query: GET_CARS_QUERY }],
  });
  const [uploadImage] = useMutation(ADD_CAR_IMAGE_MUTATION);
  const [deleteCar] = useMutation(DELETE_CAR_MUTATION);

  return {
    // enumData is replaced by CAR_ENUMS — import directly where needed,
    // or consume via this hook for colocation with brand/model data
    enums: CAR_ENUMS,
    brandData,
    modelData,
    createCar,
    uploadImage,
    deleteCar,
  };
};