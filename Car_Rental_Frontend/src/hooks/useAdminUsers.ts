import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS_QUERY } from '@/lib/graphql/queries';
import { DELETE_USER_MUTATION, UPDATE_USER_ROLE_MUTATION } from '@/lib/graphql/mutations';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersFilter {
  search: string;
  role: string;
}

const DEFAULT_PAGE_SIZE = 20;

export const useAdminUsers = () => {
  const [filters, setFilters] = useState<AdminUsersFilter>({
    search: '',
    role: ''
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Main Data Query with pagination + server-side search
  const { loading, error, data, refetch } = useQuery(GET_USERS_QUERY, {
    variables: {
      pagination: {
        page,
        pageSize,
        search: filters.search || undefined,
      },
    },
    fetchPolicy: 'cache-and-network'
  });

  // Mutations
  const [deleteUser, { loading: isDeleting }] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => refetch(),
  });

  const [updateUserRole, { loading: isUpdatingRole }] = useMutation(UPDATE_USER_ROLE_MUTATION, {
    onCompleted: () => refetch(),
  });

  const resetFilters = () => {
    setFilters({ search: '', role: '' });
    setPage(1);
  };

  const handleSearchChange = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPage(1);
  }, []);

  const paginatedResult = data?.users;
  const allUsers = paginatedResult?.items || [];

  // Client-side role filter (lightweight, no need for server roundtrip)
  const filteredUsers = allUsers.filter((user: User) => {
    const matchesRole = !filters.role || user.role === filters.role;
    return matchesRole;
  });

  return {
    users: filteredUsers,
    allUsers,
    pageInfo: paginatedResult?.pageInfo,
    page,
    pageSize,
    setPage,
    setPageSize,
    filters,
    setFilters,
    resetFilters,
    setSearchQuery: handleSearchChange,
    deleteUser,
    updateUserRole,
    loading: loading || isDeleting || isUpdatingRole,
    error,
    refetch
  };
};
