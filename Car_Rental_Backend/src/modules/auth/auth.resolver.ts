import { authService } from './auth.service';
import type { Resolvers } from '../../graphql/__generated__/types';

export const authResolvers: Partial<Resolvers> = {
  Mutation: {
    register: (_, { input }) => authService.register(input.email, input.password, input.phoneNumber ?? undefined),
    
    verifyOTP: (_, { email, otp }) => authService.verifyOTP(email, otp),
    
    resendOTP: async (_, { email }) => {
      const result = await authService.resendOTP(email);
      const expiresAt = typeof result.expiresAt === 'string' 
        ? new Date(result.expiresAt) 
        : result.expiresAt;
      return { ...result, expiresAt };
    },
    
    login: async (_, { input }) => {
      // Direct return of payload to NextAuth [1.1.2]
      const { accessToken, refreshToken, user } = await authService.login(input.email, input.password);
      return { accessToken, refreshToken, user };
    },

    refreshTokens: async (_, { refreshToken }) => {
      // Reads token from GraphQL variable, rotates it, and returns the new pair [1.1.2]
      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);
      return { accessToken, refreshToken: newRefreshToken };
    },

    logout: async (_, { refreshToken }) => {
      // Revokes the specific token from Redis & PostgreSQL fallback [1]
      await authService.logout(refreshToken);
      return true;
    },
  },
};