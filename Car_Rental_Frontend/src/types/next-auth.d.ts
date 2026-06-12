import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id:           string;
    fullName:     string;
    email:        string;
    role:         string;
    phoneNumber?: string;
    avatarUrl?:   string;
    accessToken?: string;
    refreshToken?: string; // <-- Added: Registers refresh token during login callback [1]
  }

  interface Session extends DefaultSession {
    accessToken?:  string;
    refreshToken?: string; // <-- Added: Registers refresh token on the root of session [1]
    error?:        string;
    user: {
      id?:       string;
      role?:     string;
      fullName?: string;
      name?:     string | null;
      email?:    string | null;
      image?:    string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?:        string;
    refreshToken?:       string; // Already present
    accessTokenExpires?: number; // Already present
    role?:               string;
    fullName?:           string;
    id?:                 string;
    error?:              string;
  }
}