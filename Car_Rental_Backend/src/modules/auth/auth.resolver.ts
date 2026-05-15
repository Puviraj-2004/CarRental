import { authService } from './auth.service';
import type { Resolvers } from '../../graphql/__generated__/types';

export const authResolvers: Partial<Resolvers> = {
  Mutation: {
    register: (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => authService.register(input.email, input.password),

    verifyOTP: (
      _: unknown,
      { email, otp }: { email: string; otp: string },
    ) => authService.verifyOTP(email, otp),

    resendOTP: (
      _: unknown,
      { email }: { email: string },
    ) => authService.resendOTP(email),

    login: (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => authService.login(input.email, input.password),

    refreshTokens: (
      _: unknown,
      { refreshToken }: { refreshToken: string },
    ) => authService.refreshTokens(refreshToken),

    logout: (
      _: unknown,
      { refreshToken }: { refreshToken: string },
    ) => authService.logout(refreshToken),
  },
};
