import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Executes direct-to-backend token rotation using the encrypted JWT storage token.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const apiUrl =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000/graphql";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "RefreshTokens",
        query: `
          mutation RefreshTokens($refreshToken: String!) {
            refreshTokens(refreshToken: $refreshToken) {
              accessToken
              refreshToken # <-- Requests both rotated tokens [1.1.2]
            }
          }
        `,
        variables: {
          refreshToken: token.refreshToken, // Pass token from NextAuth state [1.1.2]
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

    // Encrypt and return the brand-new rotated tokens back to NextAuth [1.1.2]
    return {
      ...token,
      accessToken:        newAccessToken,
      refreshToken:       newRefreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15-minute validity window
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", // Triggers client-side login redirect
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
          const apiUrl =
            process.env.INTERNAL_API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:4000/graphql";

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operationName: "Login",
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    accessToken
                    refreshToken # <-- Now queried and returned securely [1.1.2]
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
              accessToken,
              refreshToken, // <-- Forwarded to jwt callback [1.1.2]
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
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.role               = user.role;
        token.fullName           = user.fullName;
        token.id                 = user.id;
      }

      // If access token is still valid, return it
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise, rotate the tokens
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken   = token.accessToken;
        session.refreshToken  = token.refreshToken; // <-- Expose on session so clients can access it for logouts [1]
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