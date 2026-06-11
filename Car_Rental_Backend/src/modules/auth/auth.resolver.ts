import { authService } from './auth.service';
import type { Resolvers } from '../../graphql/__generated__/types';
import type { GraphQLContext } from '../../graphql/context';
import { AppError, ErrorCode } from '../../core/errors/AppError';
import { env } from '../../config/env';

const cookieOptions = {
  httpOnly: true,
  secure:   env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  path:     '/',
};

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
    
    login: async (_, { input }, ctx: GraphQLContext) => {
      const { accessToken, refreshToken, user } = await authService.login(input.email, input.password);
      ctx.res.cookie('refreshToken', refreshToken, cookieOptions);
      return { accessToken, user };
    },

    refreshTokens: async (_, __, ctx: GraphQLContext) => {
      const refreshToken = ctx.req.cookies.refreshToken;
      if (!refreshToken) {
        throw new AppError('No refresh token provided', ErrorCode.UNAUTHENTICATED);
      }
      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);
      ctx.res.cookie('refreshToken', newRefreshToken, cookieOptions);
      return { accessToken };
    },

    logout: async (_, __, ctx: GraphQLContext) => {
      const refreshToken = ctx.req.cookies.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      ctx.res.clearCookie('refreshToken', { path: '/' });
      return true;
    },
  },
};