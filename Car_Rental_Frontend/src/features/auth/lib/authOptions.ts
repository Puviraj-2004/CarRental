import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Refresh token logic – now uses cookie-based refresh.
 * The browser automatically sends the refreshToken cookie.
 * The mutation takes NO arguments and returns only a new accessToken.
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
      credentials: "include",        // ← critical: send cookies
      body: JSON.stringify({
        operationName: "RefreshTokens",
        query: `
          mutation RefreshTokens {
            refreshTokens {
              accessToken
            }
          }
        `,
        // No variables – backend reads cookie automatically
      }),
    });

    const responseData = await res.json();

    if (responseData.errors) {
      throw new Error(responseData.errors[0].message);
    }

    const newAccessToken = responseData.data?.refreshTokens?.accessToken;

    if (!newAccessToken) {
      throw new Error("No access token returned from refresh mutation");
    }

    // Keep existing token data, update only accessToken and expiry
    // Do NOT update refreshToken – it is now managed by HTTP‑only cookie
    return {
      ...token,
      accessToken:        newAccessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      // refreshToken is no longer stored in JWT
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
          const apiUrl =
            process.env.INTERNAL_API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:4000/graphql";

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",        // send cookies (optional here, but safe)
            body: JSON.stringify({
              operationName: "Login",
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    accessToken
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

          if (user && accessToken) {
            return {
              id:          user.id,
              email:       user.email,
              fullName:    user.email, // fallback
              role:        user.role,
              accessToken,
              // refreshToken is NOT returned nor stored
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
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
        token.role               = user.role;
        token.fullName           = user.fullName;
        token.id                 = user.id;
        // Do NOT store refreshToken
      }

      // If access token is still valid, return it
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise, refresh the access token
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken   = token.accessToken;
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