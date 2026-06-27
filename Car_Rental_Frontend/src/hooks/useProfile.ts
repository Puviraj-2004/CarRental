'use client';

import { gql, useMutation, useQuery } from '@apollo/client';

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      fullName
      email
      emailVerified
      phoneNumber
      role
      documents {
        id
        status
        licenseNumber
        licenseExpiry
        idNumber
        idExpiry
        address
      }
    }
  }
`;

export const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
      id
      fullName
      email
      phoneNumber
      role
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export interface ProfileData {
  id: string;
  fullName: string | null;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  role: 'USER' | 'ADMIN';
  documents: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    licenseNumber: string | null;
    licenseExpiry: string | null;
    idNumber: string | null;
    idExpiry: string | null;
    address: string | null;
  } | null;
}

export const useProfile = () => {
  const { data, loading, error, refetch } = useQuery<{ me: ProfileData | null }>(
    GET_ME_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  const [updateProfileMutation, { loading: updating }] = useMutation(
    UPDATE_MY_PROFILE_MUTATION,
    { onCompleted: () => refetch() },
  );

  const [changePasswordMutation, { loading: changingPassword }] = useMutation(
    CHANGE_PASSWORD_MUTATION,
  );

  return {
    profile: data?.me ?? null,
    loading,
    error,
    updating,
    changingPassword,
    updateProfile: (input: { phoneNumber: string }) =>
      updateProfileMutation({ variables: { input } }),
    changePassword: (currentPassword: string, newPassword: string) =>
      changePasswordMutation({ variables: { currentPassword, newPassword } }),
    refetch,
  };
};
