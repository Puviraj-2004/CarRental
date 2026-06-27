'use client';

import React from 'react';
import { SetupManagementView } from './SetupManagementView';
import {
  GET_PAYMENT_METHODS_QUERY,
  CREATE_PAYMENT_METHOD_MUTATION,
  UPDATE_PAYMENT_METHOD_MUTATION,
  DELETE_PAYMENT_METHOD_MUTATION,
} from '../graphql/setupQueries';

export const PaymentMethodManagementContainer: React.FC = () => {
  return (
    <SetupManagementView
      title="Manage Payment Methods"
      entityType="paymentMethod"
      getQuery={GET_PAYMENT_METHODS_QUERY}
      createMutation={CREATE_PAYMENT_METHOD_MUTATION}
      updateMutation={UPDATE_PAYMENT_METHOD_MUTATION}
      deleteMutation={DELETE_PAYMENT_METHOD_MUTATION}
    />
  );
};
