import { documentService } from './document.service';
import { OCRService } from './gemini.service'; 
import { GraphQLContext } from '../../graphql/context';
import { AppError, ErrorCode } from '../../core/errors/AppError';

const ocrService = new OCRService(); 

async function downloadFileBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download asset: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    throw new AppError(`Failed to retrieve document asset from storage: ${url}`, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

export const documentResolvers: any = {
  Query: {
    bookingDocuments: async (_: unknown, { bookingId }: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) {
        throw new AppError('Authentication required.', ErrorCode.UNAUTHENTICATED);
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
    }) => {
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
      return documentService.reuseDocumentsForBooking(ctx.userId, bookingId);
    },
  },
};