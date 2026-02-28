import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "./validations/auth";
import type { UserRole, UserLevel } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      nickname: string;
      profileImage: string | null;
      role: UserRole;
      level: UserLevel;
    };
  }

  interface JWT {
    id: string;
    nickname: string;
    role: UserRole;
    level: UserLevel;
    profileImage: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (user.isBlocked) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // 커스텀 필드는 JWT callback에서 DB 조회로 추가
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // 로그인 직후 or 세션 갱신 시 DB에서 정보 가져오기
      if (user || trigger === "update") {
        const userId = (user?.id ?? token.id) as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            nickname: true,
            level: true,
            role: true,
            profileImage: true,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.nickname = dbUser.nickname;
          token.level = dbUser.level as UserLevel;
          token.role = dbUser.role as UserRole;
          token.profileImage = dbUser.profileImage;
        }
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as typeof token & {
        id: string;
        nickname: string;
        role: UserRole;
        level: UserLevel;
        profileImage: string | null;
      };
      session.user.id = t.id;
      session.user.nickname = t.nickname;
      session.user.role = t.role;
      session.user.level = t.level;
      session.user.profileImage = t.profileImage;
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
