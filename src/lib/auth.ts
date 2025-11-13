import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Mock database - em produção, use um banco de dados real
const users = [
  {
    id: '1',
    email: 'admin@ness.dev',
    password: '$2a$10$X1.YcZqQ8X1.YcZqQ8X1.euR2w8QG0GqOvQZQ0GqOvQZQ0GqOv', // senha: admin123
    name: 'Administrador',
    role: 'admin',
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = users.find((u) => u.email === credentials.email);

        if (!user) {
          throw new Error('Credenciais inválidas');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Credenciais inválidas');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
