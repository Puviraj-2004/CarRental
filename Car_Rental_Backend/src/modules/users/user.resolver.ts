import { VerificationStatus, Role } from '@prisma/client';
import type { FileUpload }          from 'graphql-upload-ts';

import { isAuthenticated } from '../../core/middleware/auth.middleware';
import { isAdmin }         from '../../core/middleware/admin.middleware';
import { GraphQLContext }  from '../../graphql/context';
import {
  userService,
  DocumentsInput,
  OcrDocumentType,
  OcrDocumentSide,
} from './user.service';
import type { Resolvers, QueryUsersArgs } from '../../graphql/__generated__/types';

export const userResolvers: Partial<Resolvers> = {
  User: {
    phoneNumber: (parent) => parent.phoneNumber ?? null,
  },

  Documents: {
    licenseExpiry: (parent) => parent.licenseExpiry ?? null,
    idExpiry:      (parent) => parent.idExpiry      ?? null,
    createdAt:     (parent) => parent.createdAt,
    updatedAt:     (parent) => parent.updatedAt,
  },

  OCRResult: {
    licenseExpiry: (parent) => {
      if (!parent.licenseExpiry) return null;
      if (parent.licenseExpiry instanceof Date) return parent.licenseExpiry;
      try {
        return new Date(parent.licenseExpiry);
      } catch {
        return null;
      }
    },
    idExpiry: (parent) => {
      if (!parent.idExpiry) return null;
      if (parent.idExpiry instanceof Date) return parent.idExpiry;
      try {
        return new Date(parent.idExpiry);
      } catch {
        return null;
      }
    },
  },

  Query: {
    me: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      isAuthenticated(ctx);
      return userService.getCurrentUser(ctx.userId!);
    },

    user: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return userService.getUserById(id);
    },

    users: (_: unknown, { pagination }: QueryUsersArgs, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return userService.getAllUsers(
        pagination != null
          ? {
              page:     pagination.page     ?? undefined,
              pageSize: pagination.pageSize ?? undefined,
              search:   pagination.search   ?? undefined,
            }
          : undefined,
      );
    },

    myDocuments: (_: unknown, __: Record<string, never>, ctx: GraphQLContext) => {
      isAuthenticated(ctx);
      return userService.getMyDocuments(ctx.userId!);
    },

    isEmailAvailable: (_: unknown, { email }: { email: string }) =>
      userService.isEmailAvailable(email),

    hasApprovedDocuments: (
      _: unknown,
      __: Record<string, never>,
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return userService.hasApprovedDocuments(ctx.userId!);
    },
  },

  Mutation: {
    changePassword: (
      _: unknown,
      { currentPassword, newPassword }: {
        currentPassword: string;
        newPassword:     string;
      },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return userService.changePassword(
        ctx.userId!,
        currentPassword,
        newPassword,
      );
    },

    updateUserRole: (
      _: unknown,
      { id, role }: { id: string; role: Role },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return userService.updateUserRole(id, role);
    },

    deleteUser: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      await userService.deleteUser(id);
      return true;
    },

    saveDocuments: (
      _: unknown,
      { input }: { input: { [K in keyof DocumentsInput]: DocumentsInput[K] | null } },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      const normalized: DocumentsInput = {
        licenseFrontFile: input.licenseFrontFile ?? undefined,
        licenseBackFile:  input.licenseBackFile  ?? undefined,
        idCardFrontFile:  input.idCardFrontFile  ?? undefined,
        idCardBackFile:   input.idCardBackFile   ?? undefined,
        addressProofFile: input.addressProofFile ?? undefined,
        licenseNumber:    input.licenseNumber    ?? undefined,
        licenseExpiry:    input.licenseExpiry    ?? undefined,
        age:              input.age              ?? undefined,
        idNumber:         input.idNumber         ?? undefined,
        idExpiry:         input.idExpiry         ?? undefined,
        address:          input.address          ?? undefined,
      };
      return userService.saveDocuments(ctx.userId!, normalized);
    },

    adminVerifyDocuments: (
      _: unknown,
      { userId, status }: { userId: string; status: VerificationStatus },
      ctx: GraphQLContext,
    ) => {
      isAdmin(ctx);
      return userService.adminVerifyDocuments(userId, status);
    },

    reuseDocumentsForBooking: (
      _: unknown,
      { bookingId }: { bookingId: string },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return userService.reuseDocumentsForBooking(ctx.userId!, bookingId);
    },

    saveBookingDocuments: (
      _: unknown,
      { bookingId, input, saveToProfile }: {
        bookingId: string;
        input: { [K in keyof DocumentsInput]: DocumentsInput[K] | null };
        saveToProfile?: boolean | null;
      },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      const normalized: DocumentsInput = {
        licenseFrontFile: input.licenseFrontFile ?? undefined,
        licenseBackFile:  input.licenseBackFile  ?? undefined,
        idCardFrontFile:  input.idCardFrontFile  ?? undefined,
        idCardBackFile:   input.idCardBackFile   ?? undefined,
        addressProofFile: input.addressProofFile ?? undefined,
        licenseNumber:    input.licenseNumber    ?? undefined,
        licenseExpiry:    input.licenseExpiry    ?? undefined,
        age:              input.age              ?? undefined,
        idNumber:         input.idNumber         ?? undefined,
        idExpiry:         input.idExpiry         ?? undefined,
        address:          input.address          ?? undefined,
      };
      return userService.saveBookingDocuments(
        ctx.userId!,
        bookingId,
        normalized,
        saveToProfile ?? undefined,
      );
    },

    processDocumentOCR: (
      _: unknown,
      {
        file,
        documentType,
        side,
      }: {
        file:         Promise<FileUpload>;
        documentType: OcrDocumentType;
        side:         OcrDocumentSide;
      },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return userService.processOCR(file, documentType, side);
    },
  },
};