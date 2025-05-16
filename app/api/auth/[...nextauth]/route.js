import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("AUTH: Authorize function called with credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.error("AUTH: Email or password missing");
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        console.log("AUTH: User fetched from DB:", user ? { id: user.id, email: user.email, name: user.name } : null);

        if (!user || !user.password) {
          console.error("AUTH: User not found or password not set in DB");
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("AUTH: Password validation result:", isValid);

        if (!isValid) {
          console.error("AUTH: Password invalid");
          throw new Error('Invalid credentials');
        }
        
        const resultUser = {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        console.log("AUTH: Authorize function returning user:", resultUser);
        return resultUser; // Ensure this object is returned
      }
    })
    // EmailProvider can be removed or kept if you want multiple sign-in options
  ],
  session: {
    strategy: 'jwt', // Recommended for CredentialsProvider
  },
  pages: {
    signIn: '/auth/signin', 
    // error: '/auth/error', // Error page for sign-in errors
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      console.log("AUTH: JWT callback. Initial token:", JSON.stringify(token));
      console.log("AUTH: JWT callback. User object passed:", JSON.stringify(user));
      // console.log("AUTH: JWT callback. Account object:", JSON.stringify(account)); // For OAuth
      // console.log("AUTH: JWT callback. Profile object:", JSON.stringify(profile)); // For OAuth
      // console.log("AUTH: JWT callback. IsNewUser:", isNewUser); // For OAuth

      // The 'user' object is only passed on the first call after sign-in
      if (user?.id) { // Check if user object exists and has an id
        token.id = user.id;
        token.email = user.email; 
        token.name = user.name; 
        console.log("AUTH: JWT callback. Populated token with user data:", JSON.stringify(token));
      }
      console.log("AUTH: JWT callback. Returning token:", JSON.stringify(token));
      return token;
    },
    async session({ session, token }) {
      console.log("AUTH: Session callback. Initial session:", JSON.stringify(session));
      console.log("AUTH: Session callback. Token passed:", JSON.stringify(token));
      
      if (token?.id && session.user) { // Check if token has id and session.user exists
        session.user.id = token.id;
        session.user.name = token.name; 
        session.user.email = token.email; 
        console.log("AUTH: Session callback. Hydrated session.user:", JSON.stringify(session.user));
      } else {
        console.warn("AUTH: Session callback. Token.id or session.user missing. Token:", JSON.stringify(token), "Session:", JSON.stringify(session) );
      }
      console.log("AUTH: Session callback. Returning session:", JSON.stringify(session));
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable NextAuth debug messages in dev
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 