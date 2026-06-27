'use client';

import React from 'react';
import { SetupManagementView } from './SetupManagementView';
import {
  GET_BRANDS_QUERY,
  CREATE_BRAND_MUTATION,
  UPDATE_BRAND_MUTATION,
  DELETE_BRAND_MUTATION,
} from '../graphql/setupQueries';

export const BrandManagementContainer: React.FC = () => {
  return (
    <SetupManagementView
      title="Manage Brands"
      entityType="brand"
      getQuery={GET_BRANDS_QUERY}
      createMutation={CREATE_BRAND_MUTATION}
      updateMutation={UPDATE_BRAND_MUTATION}
      deleteMutation={DELETE_BRAND_MUTATION}
    />
  );
};
