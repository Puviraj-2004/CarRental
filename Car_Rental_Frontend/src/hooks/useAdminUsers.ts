'use client';

import { useCallback, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query GetUsers($pagination: PaginationInput) {
    users(pagination: $pagination) {
      items {
        id
        fullName
        email
        emailVerified
        phoneNumber
        role
        documents {
          id
          status
        }
        bookings {
          id
          status
        }
      }
      pageInfo {
        totalCount
        totalPages
        currentPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($id: ID!, $role: Role!) {
    updateUserRole(id: $id, role: $role) {
      id
      role
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export interface AdminUser {
  id: string;
  fullName: string | null;
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
  role: 'USER' | 'ADMIN';
  documents: { id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED' } | null;
  bookings: Array<{ id: string; status: string }>;
}

export const useAdminUsers = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const { data, loading, error, refetch } = useQuery(GET_USERS_QUERY, {
    variables: {
      pagination: {
        page,
        pageSize: 10,
        search: searchQuery || undefined,
      },
    },
    fetchPolicy: 'network-only',
  });

  const [updateUserRoleMutation, { loading: updatingRole }] = useMutation(
    UPDATE_USER_ROLE_MUTATION,
    { onCompleted: () => refetch() },
  );
  const [deleteUserMutation, { loading: deleting }] = useMutation(
    DELETE_USER_MUTATION,
    { onCompleted: () => refetch() },
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const allUsers: AdminUser[] = data?.users?.items ?? [];
  const users = allUsers.filter((user) => roleFilter === 'ALL' || user.role === roleFilter);

  return {
    users,
    pageInfo: data?.users?.pageInfo,
    page,
    setPage,
    searchQuery,
    setSearchQuery: handleSearchChange,
    roleFilter,
    setRoleFilter,
    loading: loading || updatingRole || deleting,
    error,
    updateUserRole: (id: string, role: 'USER' | 'ADMIN') =>
      updateUserRoleMutation({ variables: { id, role } }),
    deleteUser: (id: string) => deleteUserMutation({ variables: { id } }),
  };
};
