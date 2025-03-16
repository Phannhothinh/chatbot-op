import NextAuth from 'next-auth/next';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/db';

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // For demo purposes, you can use a hardcoded user
        // In a real app, you would look up the user in your database
        if (credentials?.username === 'demo' && credentials?.password === 'password') {
          return {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
          };
        }
        
        return null;
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        // Use type assertion to add id to session.user
        (session.user as { id?: string }).id = token.id;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
