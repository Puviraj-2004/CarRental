declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client/core';
  
  interface UploadLinkOptions {
    uri?: string;
    useGETForQueries?: boolean;
    isExtractableFile?: (value: unknown) => boolean; // Typed as unknown
    FormData?: unknown;
    formDataAppendFile?: (form: FormData, i: number, file: unknown) => void;
    fetch?: unknown;
    fetchOptions?: unknown;
    credentials?: RequestCredentials;
    headers?: unknown;
    includeExtensions?: boolean;
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
  export function isExtractableFile(value: unknown): boolean; // Added declaration export
}