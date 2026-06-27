'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { SetupManagementView } from './SetupManagementView';
import {
  GET_BRANDS_QUERY,
  GET_MODELS_QUERY,
  CREATE_MODEL_MUTATION,
  UPDATE_MODEL_MUTATION,
  DELETE_MODEL_MUTATION,
} from '../graphql/setupQueries';

export const ModelManagementContainer: React.FC = () => {
  const { data: brandsData } = useQuery(GET_BRANDS_QUERY);

  return (
    <SetupManagementView
      title="Manage Models"
      entityType="model"
      getQuery={GET_MODELS_QUERY}
      createMutation={CREATE_MODEL_MUTATION}
      updateMutation={UPDATE_MODEL_MUTATION}
      deleteMutation={DELETE_MODEL_MUTATION}
      brands={brandsData?.brands || []}
    />
  );
};
