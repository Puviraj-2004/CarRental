import { useMutation, ApolloError } from '@apollo/client';
import { VERIFY_OTP_MUTATION } from '../graphql/mutations';

export interface VerifyOtpData {
  verifyOTP: {
    success: boolean;
    message: string;
  };
}

export interface VerifyOtpVariables {
  email: string;
  otp:   string;
}

export interface UseVerifyOtpReturn {
  executeVerify: (email: string, otp: string) => void;
  loading:       boolean;
}

export const useVerifyOtp = (
  onCompleted: (data: VerifyOtpData) => void,
  onError:     (err: ApolloError) => void,
): UseVerifyOtpReturn => {
  const [verifyOtp, { loading }] = useMutation<VerifyOtpData, VerifyOtpVariables>(
    VERIFY_OTP_MUTATION,
    {
      onCompleted,
      onError,
    },
  );

  const executeVerify = (email: string, otp: string): void => {
    verifyOtp({ variables: { email, otp } });
  };

  return {
    executeVerify,
    loading,
  };
};