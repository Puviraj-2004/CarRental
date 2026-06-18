import { ApolloClient, InMemoryCache, from, ServerError, ServerParseError } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client'; 
import { getCookie } from 'cookies-next';
import { getSession, signOut } from 'next-auth/react';

let csrfTokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Centrally resolves the correct API URL dynamically based on the execution context [1.1.8].
 * Server-side calls use INTERNAL_API_URL (for internal Docker routing) [1.1.8].
 * Client-side calls use NEXT_PUBLIC_API_URL, falling back to 127.0.0.1 for local safety [1.1.8, 1].
 */
export const getApiUrl = (): string => {
  if (typeof window === 'undefined' && process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/graphql';
};

const getBaseUrlFromGraphqlUrl = (graphqlUrl: string): string => {
  return graphqlUrl.replace(/\/?graphql\/?$/i, '').replace(/\/+$/, '');
};

const fetchCsrfToken = async (): Promise<string | null> => {
    return null;
};

const NON_RETRYABLE_CODES = new Set([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'BAD_USER_INPUT',
  'ALREADY_EXISTS',
  'NOT_FOUND',
  'CSRF_TOKEN_MISSING',
  'INVALID_CSRF_TOKEN',
  'CSRF_VIOLATION',
]);

interface GraphQLErrorPayload {
  result?: {
    errors?: Array<{
      extensions?: {
        code?: string;
      };
    }>;
  };
  statusCode?: number;
}

const retryLink = new RetryLink({
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      const sensitiveOps = new Set([
        'createPayment',
        'createBooking',
        'register',
      ]);
      if (sensitiveOps.has(operation.operationName)) return false;

      const serverError = error as unknown as GraphQLErrorPayload;
      const graphqlErrors = serverError?.result?.errors || [];
      if (graphqlErrors.length > 0) {
        const hasNonRetryableCode = graphqlErrors.some((e) => {
          const code = e?.extensions?.code;
          return code && NON_RETRYABLE_CODES.has(code);
        });
        if (hasNonRetryableCode) return false;
      }

      if (!serverError?.statusCode) return true;

      const retryableStatuses = new Set([503, 429]);
      return retryableStatuses.has(serverError.statusCode);
    },
  },
  delay: {
    initial: 300,
    max: 10000,
    jitter: true,
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (process.env.NODE_ENV === 'development') {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, path }) => {
        console.error('❌ GraphQL Error:', message, 'at', path);
      });
    }
    if (networkError) {
      console.error('❌ Network Error:', networkError);
    }
  }

  const isUnauthenticatedGraphQL = (graphQLErrors || []).some(
    (e) => e?.extensions?.code === 'UNAUTHENTICATED'
  );

  const parsedNetworkError = networkError as ServerError | ServerParseError | undefined;
  const isUnauthorizedHttp = parsedNetworkError && 'statusCode' in parsedNetworkError && parsedNetworkError.statusCode === 401;

  if (isUnauthenticatedGraphQL || isUnauthorizedHttp) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      void getSession().then((session) => {
        // Only sign out when refresh has definitively failed.
        if (!session || session.error === 'RefreshAccessTokenError') {
          signOut({ callbackUrl: '/login' });
        }
      });
    }
  }
});

const authLink = setContext(async (_, { headers }) => {
  let token: string | null = null;
  try {
    const session = await getSession();
    token = session?.accessToken || null;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === 'development') {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Apollo Auth - Error getting session:', message);
    }
  }

  if (!token) {
    const cookieToken = getCookie('token');
    token = typeof cookieToken === 'string' ? cookieToken : null;
  }

  if (process.env.NODE_ENV === 'development' && !token) {
    console.warn('⚠️ Apollo Auth - No access token found. Requests may fail with 401/UNAUTHENTICATED.');
  }

  const csrfToken = await fetchCsrfToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      'Apollo-Require-Preflight': 'true',
    },
  };
});

const customIsExtractableFile = (value: unknown): value is File | Blob => {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (value !== null &&
      typeof value === 'object' &&
      'size' in value &&
      'type' in value &&
      typeof (value as any).arrayBuffer === 'function')
  );
};

const uploadLink = createUploadLink({
  uri: getApiUrl(), // <-- Updated: Consumes the centralized helper [1.1.8]
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
  credentials: 'include',
  isExtractableFile: customIsExtractableFile,
});

const client = new ApolloClient({
  link: from([retryLink, errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cars: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

export default client;