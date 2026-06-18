import { useQuery, useMutation, FetchResult, useApolloClient } from '@apollo/client';
import {  GET_CLOUDINARY_SIGNATURE } from '@/features/cars/graphql/queries';
import { validateFileMime, validateFileExtension, validateFileSize } from '@/lib/fileValidation';
import { gql } from '@apollo/client';
import { PROCESS_DOCUMENT_OCR_MUTATION, SAVE_BOOKING_DOCUMENTS_MUTATION } from '../graphql/mutations';
import { GET_MY_DOCUMENTS_QUERY } from '../graphql/queries';

export interface Documents {
  id:              string;
  userId?:         string | null;
  bookingId?:      string | null;
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
  myDocuments:           Documents | null;
  loadingMyDocs:         boolean;
  // Updated: Explicitly accepts the saveToProfile parameter [1]
  executeSaveBooking:    (bookingId: string, input: FinalDocumentsInput, saveToProfile: boolean) => Promise<FetchResult<{ saveBookingDocuments: Documents }>>;
  loadingSaveBooking:    boolean;
  executeOCR:            (files: UploadFilesInput) => Promise<{ urls: any, ocr: OCRResult }>;
  loadingOCR:            boolean;
}

export const useDocuments = (): UseDocumentsReturn => {
  const client = useApolloClient();

  const { data: myDocsData, loading: loadingMyDocs } = useQuery<{ myDocuments: Documents | null }>(
    GET_MY_DOCUMENTS_QUERY
  );

  const [saveBookingDocuments, { loading: loadingSaveBooking }] = useMutation<
    { saveBookingDocuments: Documents },
    { bookingId: string; input: any; saveToProfile: boolean }
  >(SAVE_BOOKING_DOCUMENTS_MUTATION);

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
    validateFileSize(file.size, file.name, 'verification_document'); [2]

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

  // Updated: Explicitly accepts the third "saveToProfile" parameter and passes it [1]
  const executeSaveBooking = async (bookingId: string, input: FinalDocumentsInput, saveToProfile: boolean) => {
    return await saveBookingDocuments({
      variables: { bookingId, input, saveToProfile },
    });
  };

  return {
    myDocuments: myDocsData?.myDocuments || null,
    loadingMyDocs,
    executeSaveBooking,
    loadingSaveBooking,
    executeOCR,
    loadingOCR,
  };
};