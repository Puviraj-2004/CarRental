'use client';

import React from 'react';
import { SetupManagementView } from './SetupManagementView';
import {
  GET_FUEL_TYPES_QUERY,
  CREATE_FUEL_TYPE_MUTATION,
  UPDATE_FUEL_TYPE_MUTATION,
  DELETE_FUEL_TYPE_MUTATION,
} from '../graphql/setupQueries';

export const FuelTypeManagementContainer: React.FC = () => {
  return (
    <SetupManagementView
      title="Manage Fuel Types"
      entityType="fuelType"
      getQuery={GET_FUEL_TYPES_QUERY}
      createMutation={CREATE_FUEL_TYPE_MUTATION}
      updateMutation={UPDATE_FUEL_TYPE_MUTATION}
      deleteMutation={DELETE_FUEL_TYPE_MUTATION}
    />
  );
};
