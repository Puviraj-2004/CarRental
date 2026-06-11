// 'use client';

// import { useQuery, useMutation } from '@apollo/client';
// import { GET_ME_QUERY } from '@/lib/graphql/queries';
// import { UPDATE_USER_MUTATION } from '@/lib/graphql/mutations';
// import { useSession } from 'next-auth/react';

// export interface ProfileData {
//   id: string;
//   fullName: string | null;
//   email: string;
//   phoneNumber: string | null;
//   dateOfBirth: string | null;
//   fullAddress: string | null;
//   role: string;
// }

// export interface UpdateProfileInput {
//   fullName?: string;
//   phoneNumber?: string;
//   dateOfBirth?: string;
//   fullAddress?: string;
// }

// export const useProfile = () => {
//   const { data: session } = useSession();

//   const { data, loading, error, refetch } = useQuery(GET_ME_QUERY, {
//     skip: !session?.accessToken,
//     fetchPolicy: 'cache-and-network',
//   });

//   const [updateUserMutation, { loading: updating }] = useMutation(UPDATE_USER_MUTATION, {
//     refetchQueries: [{ query: GET_ME_QUERY }],
//   });

//   const profile: ProfileData | null = data?.me || null;

//   const updateProfile = async (input: UpdateProfileInput) => {
//     const result = await updateUserMutation({ variables: { input } });
//     return result.data?.updateUser;
//   };

//   return {
//     profile,
//     loading,
//     error,
//     updating,
//     updateProfile,
//     refetch,
//   };
// };
