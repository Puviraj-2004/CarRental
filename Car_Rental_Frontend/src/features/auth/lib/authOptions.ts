import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { getApiUrl } from "@/lib/apolloClient"; // <-- Imported centralized helper [1.1.8]

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 10 * 1000;

/**
 * Executes direct-to-backend token rotation using the encrypted JWT storage token.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const apiUrl = getApiUrl(); // <-- Updated: Clean, single-source extraction [1.1.8]

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "RefreshTokens",
        query: `
          mutation RefreshTokens($refreshToken: String!) {
            refreshTokens(refreshToken: $refreshToken) {
              accessToken
              refreshToken 
            }
          }
        `,
        variables: {
          refreshToken: token.refreshToken, 
        },
      }),
    });

    const responseData = await res.json();

    if (responseData.errors) {
      throw new Error(responseData.errors[0].message);
    }

    const newAccessToken = responseData.data?.refreshTokens?.accessToken;
    const newRefreshToken = responseData.data?.refreshTokens?.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error("Missing tokens in backend refresh payload");
    }

    return {
      ...token,
      accessToken:        newAccessToken,
      refreshToken:       newRefreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_TTL_MS,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", 
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const apiUrl = getApiUrl(); // <-- Updated: Clean, single-source extraction [1.1.8]

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operationName: "Login",
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    accessToken
                    refreshToken 
                    user { id email role }
                  }
                }
              `,
              variables: {
                input: {
                  email: credentials?.email,
                  password: credentials?.password,
                },
              },
            }),
          });

          const responseData = await res.json();

          if (responseData.errors) {
            console.error("Backend Auth Error:", responseData.errors[0].message);
            throw new Error(responseData.errors[0].message);
          }

          const user = responseData.data?.login?.user;
          const accessToken = responseData.data?.login?.accessToken;
          const refreshToken = responseData.data?.login?.refreshToken;

          if (user && accessToken && refreshToken) {
            return {
              id:          user.id,
              email:       user.email,
              fullName:    user.email,
              role:        user.role,
              phoneNumber: user.phoneNumber || "",
              accessToken,
              refreshToken, 
            };
          }

          return null;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Authorize function error:", message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken        = user.accessToken;
        token.refreshToken       = user.refreshToken; 
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_TTL_MS;
        token.role               = user.role;
        token.fullName           = user.fullName;
        token.id                 = user.id;
      }

      // Refresh slightly before expiry to avoid clock skew/network latency logouts.
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken   = token.accessToken;
        session.refreshToken  = token.refreshToken; 
        session.user.role     = token.role;
        session.user.fullName = token.fullName;
        session.user.id       = token.id;
        session.error         = token.error;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};