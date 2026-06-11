export { useRegister } from './hooks/useRegister';
export type { RegisterInput, RegisterData, UseRegisterReturn } from './hooks/useRegister';

export { useVerifyOtp } from './hooks/useVerifyOtp';
export type { VerifyOtpData, VerifyOtpVariables, UseVerifyOtpReturn } from './hooks/useVerifyOtp';

export { useResendOtp } from './hooks/useResendOtp';
export type { ResendOtpData, ResendOtpVariables, UseResendOtpReturn } from './hooks/useResendOtp';

export { authOptions } from './lib/authOptions';

// Export UI Containers for routing mounting
export { LoginContainer } from './components/LoginContainer';
export { RegisterContainer } from './components/RegisterContainer';
export { VerifyOtpContainer } from './components/VerifyOtpContainer';