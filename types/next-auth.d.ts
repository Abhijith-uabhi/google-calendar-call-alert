// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Add `id` to session.user
   * You can add additional properties here (role, etc.)
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  /**
   * Add `id` to User (used in some places)
   */
  interface User extends DefaultUser {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Add fields to the JWT payload type
   */
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    email?: string;

  }
}
