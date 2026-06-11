import { useMutation, ApolloError } from '@apollo/client';
import { RESEND_OTP_MUTATION } from '../graphql/mutations';

export interface ResendOtpData {
  resendOTP: {
    success:    boolean;
    message:    string;
    expiresAt?: string | null;
  };
}

export interface ResendOtpVariables {
  email: string;
}

export interface UseResendOtpReturn {
  executeResend: (email: string) => void;
  loading:       boolean;
}

export const useResendOtp = (
  onCompleted?: (data: ResendOtpData) => void,
  onError?:     (err: ApolloError) => void,
): UseResendOtpReturn => {
  const [resendOtp, { loading }] = useMutation<ResendOtpData, ResendOtpVariables>(
    RESEND_OTP_MUTATION,
    {
      onCompleted,
      onError,
    },
  );

  const executeResend = (email: string): void => {
    resendOtp({ variables: { email } });
  };

  return {
    executeResend,
    loading,
  };
};