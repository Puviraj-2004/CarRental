import { useQuery, useMutation, FetchResult, useApolloClient } from '@apollo/client';
import { GET_CLOUDINARY_SIGNATURE } from '@/features/cars/graphql/queries';
import { validateFileMime, validateFileExtension, validateFileSize } from '@/lib/fileValidation';
import { PROCESS_DOCUMENT_OCR_MUTATION, SAVE_BOOKING_DOCUMENTS_MUTATION, REUSE_DOCUMENTS_FOR_BOOKING_MUTATION } from '../graphql/mutations';
import { HAS_APPROVED_DOCUMENTS_QUERY } from '../graphql/queries';

export interface Documents {
  id:              string;
  licenseFrontUrl?:string | null;
  licenseBackUrl?: string | null;
  idCardFrontUrl?: string | null;
  idCardBackUrl?:  string | null;
  addressProofUrl?:string | null;
  licenseNumber?:  string | null;
  licenseExpiry?:  string | null;
  age?:            number | null;
  idNumber?:       string | null;
  idExpiry?:       string | null;
  address?:        string | null;
  status:          'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt:       string;
  updatedAt:       string;
}

export interface DocumentReuseStatus {
  hasApprovedDocuments: boolean;
  documents:            Documents | null;
}

export interface OCRResult {
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  idNumber?:      string | null;
  idExpiry?:      string | null;
  address?:       string | null;
  birthDate?:     string | null;
}

export interface UploadFilesInput {
  licenseFront: File;
  licenseBack: File;
  idCardFront: File;
  idCardBack: File;
  addressProof: File;
}

export interface FinalDocumentsInput {
  licenseFrontUrl: string;
  licenseBackUrl:  string;
  idCardFrontUrl:  string;
  idCardBackUrl:   string;
  addressProofUrl: string;
  licenseNumber:   string;
  licenseExpiry:   string;
  idNumber:        string;
  idExpiry:        string;
  address:         string;
  birthDate:       string;
}

export interface UseDocumentsReturn {
  hasApprovedDocumentsData: DocumentReuseStatus | null;
  loadingApprovedDocs:      boolean;
  executeSaveBooking:       (bookingId: string, input: FinalDocumentsInput, saveToProfile: boolean) => Promise<FetchResult<{ saveBookingDocuments: Documents }>>;
  loadingSaveBooking:       boolean;
  executeReuse:             (bookingId: string) => Promise<FetchResult<{ reuseDocumentsForBooking: Documents }>>;
  loadingReuse:             boolean;
  executeOCR:               (files: UploadFilesInput) => Promise<{ urls: any, ocr: OCRResult }>;
  loadingOCR:               boolean;
}

export const useDocuments = (): UseDocumentsReturn => {
  const client = useApolloClient();

  const { data: approvedData, loading: loadingApprovedDocs } = useQuery<{ hasApprovedDocuments: DocumentReuseStatus }>(
    HAS_APPROVED_DOCUMENTS_QUERY
  );

  const [saveBookingDocuments, { loading: loadingSaveBooking }] = useMutation<
    { saveBookingDocuments: Documents },
    { bookingId: string; input: any; saveToProfile: boolean }
  >(SAVE_BOOKING_DOCUMENTS_MUTATION);

  const [reuseDocumentsForBooking, { loading: loadingReuse }] = useMutation<
    { reuseDocumentsForBooking: Documents },
    { bookingId: string }
  >(REUSE_DOCUMENTS_FOR_BOOKING_MUTATION);

  const [processDocumentOCR, { loading: loadingOCR }] = useMutation<
    { processDocumentOCR: OCRResult },
    {
      licenseFrontUrl: string;
      licenseBackUrl:  string;
      idCardFrontUrl:  string;
      idCardBackUrl:   string;
      addressProofUrl: string;
    }
  >(PROCESS_DOCUMENT_OCR_MUTATION);

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    validateFileExtension(file.name, 'verification_document');
    validateFileMime(file.type, 'verification_document');
    validateFileSize(file.size, file.name, 'verification_document');

    const { data } = await client.query({
      query: GET_CLOUDINARY_SIGNATURE,
      variables: { folder },
      fetchPolicy: 'no-cache',
    });

    const { signature, timestamp, apiKey, cloudName } = data.cloudinarySignature;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file "${file.name}" directly to Cloudinary.`);
    }

    const result = await response.json();
    return result.secure_url;
  };

  const executeOCR = async (files: UploadFilesInput) => {
    const [
      licenseFrontUrl,
      licenseBackUrl,
      idCardFrontUrl,
      idCardBackUrl,
      addressProofUrl
    ] = await Promise.all([
      uploadToCloudinary(files.licenseFront, 'documents'),
      uploadToCloudinary(files.licenseBack, 'documents'),
      uploadToCloudinary(files.idCardFront, 'documents'),
      uploadToCloudinary(files.idCardBack, 'documents'),
      uploadToCloudinary(files.addressProof, 'documents'),
    ]);

    const res = await processDocumentOCR({
      variables: {
        licenseFrontUrl,
        licenseBackUrl,
        idCardFrontUrl,
        idCardBackUrl,
        addressProofUrl
      }
    });

    return {
      urls: { licenseFrontUrl, licenseBackUrl, idCardFrontUrl, idCardBackUrl, addressProofUrl },
      ocr: res.data?.processDocumentOCR || {}
    };
  };

  const executeSaveBooking = async (bookingId: string, input: FinalDocumentsInput, saveToProfile: boolean) => {
    return await saveBookingDocuments({
      variables: { bookingId, input, saveToProfile },
    });
  };

  const executeReuse = async (bookingId: string) => {
    return await reuseDocumentsForBooking({
      variables: { bookingId },
    });
  };

  return {
    hasApprovedDocumentsData: approvedData?.hasApprovedDocuments || null,
    loadingApprovedDocs,
    executeSaveBooking,
    loadingSaveBooking,
    executeReuse,
    loadingReuse,
    executeOCR,
    loadingOCR,
  };
};