import { VerificationStatus, Role } from '@prisma/client';
import type { FileUpload } from 'graphql-upload-ts';

import { isAuthenticated } from '../../core/middleware/auth.middleware';
import { isAdmin } from '../../core/middleware/admin.middleware';
import { GraphQLContext } from '../../graphql/context';
import { userService, DocumentsInput, OcrDocumentType, OcrDocumentSide } from './user.service';
import type { Resolvers, QueryUsersArgs } from '../../graphql/__generated__/types';

export const userResolvers: Partial<Resolvers> = {
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
  },

  Mutation: {
    // ── Account ──────────────────────────────────────────────────────────────

    changePassword: (
      _: unknown,
      { currentPassword, newPassword }: { currentPassword: string; newPassword: string },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      return userService.changePassword(ctx.userId!, currentPassword, newPassword);
    },

    // ── Admin: user management ────────────────────────────────────────────────

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

    // ── Documents ─────────────────────────────────────────────────────────────

    saveDocuments: (
      _: unknown,
      { input }: { input: { [K in keyof DocumentsInput]: DocumentsInput[K] | null } },
      ctx: GraphQLContext,
    ) => {
      isAuthenticated(ctx);
      // Convert InputMaybe (null | undefined) to undefined for service layer
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

    // ── OCR ───────────────────────────────────────────────────────────────────

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