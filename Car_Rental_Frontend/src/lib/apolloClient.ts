import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';
import { getCookie } from 'cookies-next';
import { getSession, signOut } from 'next-auth/react';

let csrfTokenCache: { token: string; expiresAt: number } | null = null;

const getBaseUrlFromGraphqlUrl = (graphqlUrl: string) => {
  // Strip trailing /graphql and trailing slashes
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

  const isUnauthenticatedGraphQL = (graphQLErrors || []).some((e: any) => e?.extensions?.code === 'UNAUTHENTICATED');
  const isUnauthorizedHttp = (networkError as any)?.statusCode === 401;
  if (isUnauthenticatedGraphQL || isUnauthorizedHttp) {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      // If NextAuth session is in a bad state (authenticated but missing/invalid token),
      // redirecting alone can cause loops. Signing out clears the session.
      signOut({ callbackUrl: '/login' });
    }
  }
});

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
  headers: { 
    "Apollo-Require-Preflight": "true" 
  },
});

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
      authorization: token ? `Bearer ${token}` : "",
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      "Apollo-Require-Preflight": "true",
    }
  };
});

const client = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
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