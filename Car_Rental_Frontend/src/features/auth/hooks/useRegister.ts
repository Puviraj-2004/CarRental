import { useMutation, FetchResult } from '@apollo/client';
import { REGISTER_MUTATION } from '../graphql/mutations';

export interface RegisterInput {
  email:       string;
  password:    string;
  phoneNumber?: string;
}

export interface RegisterData {
  register: {
    message: string;
    email:   string;
  };
}

export interface UseRegisterReturn {
  executeRegister: (input: RegisterInput) => Promise<FetchResult<RegisterData>>;
  loading:         boolean;
}

export const useRegister = (): UseRegisterReturn => {
  const [register, { loading }] = useMutation<RegisterData, { input: RegisterInput }>(REGISTER_MUTATION);

  const executeRegister = async (input: RegisterInput): Promise<FetchResult<RegisterData>> => {
    return await register({
      variables: {
        input: {
          email:       input.email,
          password:    input.password,
          phoneNumber: input.phoneNumber,
        },
      },
    });
  };

  return {
    executeRegister,
    loading,
  };
};