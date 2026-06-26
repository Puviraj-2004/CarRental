import { documentService } from './document.service';
import { OCRService } from './gemini.service'; 
import { GraphQLContext } from '../../graphql/context';
import { AppError, ErrorCode } from '../../core/errors/AppError';
import { isAdmin } from '../../core/middleware/admin.middleware';

const ocrService = new OCRService(); 

const ALLOWED_URL_HOSTS = [
  'res.cloudinary.com',
  'cloudinary.com',
];

function validateDocumentUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_URL_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
      throw new AppError(
        'Document URLs must be hosted on Cloudinary.',
        ErrorCode.BAD_USER_INPUT,
      );
    }
    if (parsed.protocol !== 'https:') {
      throw new AppError(
        'Document URLs must use HTTPS.',
        ErrorCode.BAD_USER_INPUT,
      );
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid document URL.', ErrorCode.BAD_USER_INPUT);
  }
}

async function downloadFileBuffer(url: string): Promise<Buffer> {
  validateDocumentUrl(url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download asset: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Failed to retrieve document asset from storage.`, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

export const documentResolvers: any = {
  // Custom field resolvers to populate userId and bookingId on Documents type [1]
  Documents: {
    userId: async (parent: any, _: any, ctx: GraphQLContext) => {
      const user = await ctx.prisma.user.findFirst({
        where: { documentId: parent.id },
        select: { id: true },
      });
      if (user) return user.id;

      const booking = await ctx.prisma.booking.findFirst({
        where: { documentId: parent.id },
        select: { userId: true },
      });
      return booking?.userId || null;
    },

    bookingId: async (parent: any, _: any, ctx: GraphQLContext) => {
      const booking = await ctx.prisma.booking.findFirst({
        where: { documentId: parent.id },
        select: { id: true },
      });
      return booking?.id || null;
    }
  },

  Query: {
    bookingDocuments: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
        select: { userId: true },
      });
      if (!booking) {
        throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
      }
      if (booking.userId !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new AppError('Access denied. You do not own this booking.', ErrorCode.FORBIDDEN);
      }

      return documentService.getByBookingId(bookingId);
    },

    hasApprovedDocuments: async (_: unknown, __: any, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }
      return documentService.hasApprovedDocuments(ctx.userId);
    },
  },

  Mutation: {
    processDocumentOCR: async (_: unknown, { licenseFrontUrl, idCardFrontUrl, addressProofUrl }: {
      licenseFrontUrl: string;
      idCardFrontUrl:  string;
      addressProofUrl: string;
    }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }

      const [licFrontBuf, idFrontBuf, addressBuf] = await Promise.all([
        downloadFileBuffer(licenseFrontUrl),
        downloadFileBuffer(idCardFrontUrl),
        downloadFileBuffer(addressProofUrl),
      ]);

      const [licFrontData, idFrontData, addressData] = await Promise.all([
        ocrService.extractDocumentData(licFrontBuf, 'license', 'front'),
        ocrService.extractDocumentData(idFrontBuf, 'id', 'front'),
        ocrService.extractDocumentData(addressBuf, 'address'),
      ]);

      return {
        licenseNumber: licFrontData.licenseNumber || '',
        licenseExpiry: licFrontData.expiryDate || '',
        idNumber:      idFrontData.documentId || '',
        idExpiry:      idFrontData.expiryDate || '',
        address:       addressData.address || '',
        birthDate:     licFrontData.birthDate || idFrontData.birthDate || '',
      };
    },

    saveBookingDocuments: async (_: unknown, { bookingId, input, saveToProfile }: { 
      bookingId: string; 
      input: any; 
      saveToProfile: boolean 
    }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }

      const booking = await ctx.prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || (booking.userId !== ctx.userId && ctx.role !== 'ADMIN')) {
        throw new AppError('Unauthorized access to this booking.', ErrorCode.UNAUTHENTICATED);
      }

      return documentService.saveBookingDocuments({
        userId: ctx.userId,
        bookingId,
        input,
        saveToProfile, 
      });
    },

    reuseDocumentsForBooking: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
      }

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
        select: { userId: true },
      });
      if (!booking) {
        throw new AppError('Booking not found.', ErrorCode.NOT_FOUND);
      }
      if (booking.userId !== ctx.userId && ctx.role !== 'ADMIN') {
        throw new AppError('Access denied. You do not own this booking.', ErrorCode.FORBIDDEN);
      }

      return documentService.reuseDocumentsForBooking(ctx.userId, bookingId);
    },

    // Maps directly to client mutation [1]
    adminVerifyDocuments: async (_: unknown, { userId, status }: { userId: string; status: any }, ctx: GraphQLContext) => {
      isAdmin(ctx);
      return documentService.adminVerifyDocuments(userId, status);
    },
  },
};