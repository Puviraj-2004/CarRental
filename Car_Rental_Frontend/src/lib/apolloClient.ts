import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { createUploadLink } from 'apollo-upload-client';
import { getCookie } from 'cookies-next';
import { getSession, signOut } from 'next-auth/react';

// ─── CSRF token cache ─────────────────────────────────────────────────────────

let csrfTokenCache: { token: string; expiresAt: number } | null = null;

const getBaseUrlFromGraphqlUrl = (graphqlUrl: string) => {
  return graphqlUrl.replace(/\/?graphql\/?$/i, '').replace(/\/+$/, '');
};

const fetchCsrfToken = async () => {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (csrfTokenCache && csrfTokenCache.expiresAt > now) {
    return csrfTokenCache.token;
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
  const baseUrl = getBaseUrlFromGraphqlUrl(graphqlUrl);

  try {
    const res = await fetch(`${baseUrl}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;
    const data = await res.json();
    const token = data?.csrfToken;
    const expiresInMs = Number(data?.expiresIn || 0);

    if (typeof token === 'string' && token.length >= 32) {
      csrfTokenCache = {
        token,
        expiresAt: now + (expiresInMs > 0 ? expiresInMs : 60 * 60 * 1000),
      };
      return token;
    }

    return null;
  } catch {
    return null;
  }
};

// ─── Error codes that must NEVER be retried ───────────────────────────────────
// Retrying these would cause duplicate mutations, infinite auth loops,
// or misleading UX. These are final answers from the backend.
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

// ─── Retry link — exponential backoff ────────────────────────────────────────
//
// Only retries on:
//   - Transient network failures (no response at all)
//   - Server overload responses: 503 Service Unavailable, 429 Too Many Requests
//
// Never retries on:
//   - GraphQL business errors (ALREADY_EXISTS, BAD_USER_INPUT, etc.)
//   - Auth errors (UNAUTHENTICATED, FORBIDDEN)
//   - 4xx client errors (bad request, not found)
//
// Backoff: 300ms → 900ms → 2700ms (capped at 10s)
// Max attempts: 3 (1 initial + 2 retries)
const retryLink = new RetryLink({
  attempts: {
    max: 3,
    retryIf: (error, operation) => {
      // Never retry mutations that touch sensitive operations —
      // a double-submit on createBooking or createPayment is worse than a failure
      const sensitiveOps = new Set([
        'createPayment',
        'createBooking',
        'register',
      ]);
      if (sensitiveOps.has(operation.operationName)) return false;

      // Don't retry if the backend returned a business-level GraphQL error
      const graphqlErrors: any[] = (error as any)?.result?.errors || [];
      if (graphqlErrors.length > 0) {
        const hasNonRetryableCode = graphqlErrors.some((e: any) =>
          NON_RETRYABLE_CODES.has(e?.extensions?.code)
        );
        if (hasNonRetryableCode) return false;
      }

      // Retry on pure network failure (no HTTP response received)
      if (!error?.statusCode) return true;

      // Retry on server overload only
      const retryableStatuses = new Set([503, 429]);
      return retryableStatuses.has(error.statusCode);
    },
  },
  delay: {
    // Exponential backoff: attempt 1 = 300ms, 2 = 900ms, 3 = 2700ms
    // Jitter is applied by RetryLink internally when jitter: true
    initial: 300,
    max: 10000,
    jitter: true,
  },
});

// ─── Error link ───────────────────────────────────────────────────────────────

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
    (e: any) => e?.extensions?.code === 'UNAUTHENTICATED'
  );
  const isUnauthorizedHttp = (networkError as any)?.statusCode === 401;

  if (isUnauthenticatedGraphQL || isUnauthorizedHttp) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      signOut({ callbackUrl: '/login' });
    }
  }
});

// ─── Auth link ────────────────────────────────────────────────────────────────

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    const session: any = await getSession();
    token = session?.accessToken;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Apollo Auth - Error getting session:', error);
    }
  }

  if (!token) {
    token = getCookie('token');
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

// ─── Upload link ──────────────────────────────────────────────────────────────

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

// ─── Client ───────────────────────────────────────────────────────────────────
//
// Link order matters:
//   retryLink  → decides whether to re-run the request on failure
//   errorLink  → handles auth redirects and dev logging after all retries exhausted
//   authLink   → attaches token + CSRF header before each attempt (including retries)
//   uploadLink → executes the actual HTTP request
//
// retryLink must be first so it wraps the entire chain including auth refresh.
// authLink must be after retryLink so a fresh CSRF token is fetched on each retry.

const client = new ApolloClient({
  link: from([retryLink, errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          cars: {
            merge(existing, incoming) {
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