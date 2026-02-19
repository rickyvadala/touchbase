import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import type { NextAuthConfig } from 'next-auth';

export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session({ session, token }) {
      // Attach the user's id (from the JWT sub claim) to the session object
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
