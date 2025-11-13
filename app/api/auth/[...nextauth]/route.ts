// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma";



export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
    providers: [
        
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Add your own logic here to validate credentials
                // This is just an example - replace with your database logic
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // Example: Check against your database
                // const user = await db.user.findUnique({ where: { email: credentials.email } });
                // const isValid = await bcrypt.compare(credentials.password, user.password);

                // For demo purposes only - REPLACE THIS
                if (credentials.email === "user@example.com" && credentials.password === "password") {
                    return {
                        id: "1",
                        email: credentials.email,
                        name: "Test User",
                    };
                }

                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error page redirects to login
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };