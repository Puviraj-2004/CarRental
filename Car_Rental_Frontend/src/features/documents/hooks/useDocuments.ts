import { useQuery, useMutation, FetchResult, ApolloError } from '@apollo/client';
import { GET_MY_DOCUMENTS_QUERY, HAS_APPROVED_DOCUMENTS_QUERY } from '../graphql/queries';
import {
  SAVE_DOCUMENTS_MUTATION,
  SAVE_BOOKING_DOCUMENTS_MUTATION,
  REUSE_DOCUMENTS_FOR_BOOKING_MUTATION,
  PROCESS_DOCUMENT_OCR_MUTATION
} from '../graphql/mutations';

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

export interface DocumentReuseStatus {
  hasApprovedDocuments: boolean;
  documents?:           Documents | null;
}

export interface DocumentsInput {
  licenseFrontFile?: File | null;
  licenseBackFile?:  File | null;
  idCardFrontFile?:  File | null;
  idCardBackFile?:   File | null;
  addressProofFile?: File | null;
  licenseNumber?:    string | null;
  licenseExpiry?:    string | null;
  age?:              number | null;
  idNumber?:         string | null;
  idExpiry?:         string | null;
  address?:          string | null;
}

export interface OCRResult {
  licenseNumber?:   string | null;
  licenseExpiry?:   string | null;
  age?:             number | null;
  idNumber?:        string | null;
  idExpiry?:        string | null;
  address?:         string | null;
  fallbackUsed?:    boolean | null;
  isQuotaExceeded?: boolean | null;
}

export interface UseDocumentsReturn {
  myDocuments:           Documents | null;
  loadingMyDocs:         boolean;
  reuseStatus:           DocumentReuseStatus | null;
  loadingReuseStatus:    boolean;
  executeSaveProfile:    (input: DocumentsInput) => Promise<FetchResult<{ saveDocuments: Documents }>>;
  loadingSaveProfile:    boolean;
  executeSaveBooking:    (bookingId: string, input: DocumentsInput, saveToProfile: boolean) => Promise<FetchResult<{ saveBookingDocuments: Documents }>>;
  loadingSaveBooking:    boolean;
  executeReuse:          (bookingId: string) => Promise<FetchResult<{ reuseDocumentsForBooking: Documents }>>;
  loadingReuse:          boolean;
  executeOCR:            (file: File, documentType: 'LICENSE' | 'ID_CARD' | 'ADDRESS_PROOF', side: 'FRONT' | 'BACK') => Promise<FetchResult<{ processDocumentOCR: OCRResult }>>;
  loadingOCR:            boolean;
}

export const useDocuments = (): UseDocumentsReturn => {
  const { data: myDocsData, loading: loadingMyDocs } = useQuery<{ myDocuments: Documents | null }>(
    GET_MY_DOCUMENTS_QUERY
  );

  const { data: reuseData, loading: loadingReuseStatus } = useQuery<{ hasApprovedDocuments: DocumentReuseStatus }>(
    HAS_APPROVED_DOCUMENTS_QUERY
  );

  const [saveDocuments, { loading: loadingSaveProfile }] = useMutation<{ saveDocuments: Documents }, { input: DocumentsInput }>(
    SAVE_DOCUMENTS_MUTATION
  );

  const [saveBookingDocuments, { loading: loadingSaveBooking }] = useMutation<
    { saveBookingDocuments: Documents },
    { bookingId: string; input: DocumentsInput; saveToProfile: boolean }
  >(SAVE_BOOKING_DOCUMENTS_MUTATION);

  const [reuseDocumentsForBooking, { loading: loadingReuse }] = useMutation<
    { reuseDocumentsForBooking: Documents },
    { bookingId: string }
  >(REUSE_DOCUMENTS_FOR_BOOKING_MUTATION);

  const [processDocumentOCR, { loading: loadingOCR }] = useMutation<
    { processDocumentOCR: OCRResult },
    { file: File; documentType: string; side: string }
  >(PROCESS_DOCUMENT_OCR_MUTATION);

  const executeSaveProfile = async (input: DocumentsInput) => {
    return await saveDocuments({ variables: { input } });
  };

  const executeSaveBooking = async (bookingId: string, input: DocumentsInput, saveToProfile: boolean) => {
    return await saveBookingDocuments({
      variables: { bookingId, input, saveToProfile },
    });
  };

  const executeReuse = async (bookingId: string) => {
    return await reuseDocumentsForBooking({
      variables: { bookingId },
    });
  };

  const executeOCR = async (file: File, documentType: 'LICENSE' | 'ID_CARD' | 'ADDRESS_PROOF', side: 'FRONT' | 'BACK') => {
    return await processDocumentOCR({
      variables: { file, documentType, side },
    });
  };

  return {
    myDocuments: myDocsData?.myDocuments || null,
    loadingMyDocs,
    reuseStatus: reuseData?.hasApprovedDocuments || null,
    loadingReuseStatus,
    executeSaveProfile,
    loadingSaveProfile,
    executeSaveBooking,
    loadingSaveBooking,
    executeReuse,
    loadingReuse,
    executeOCR,
    loadingOCR,
  };
};