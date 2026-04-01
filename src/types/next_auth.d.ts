import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    isOnBoarded: boolean;
    username?: string;
    email: string;
    telegramId?: string;
    budget?: number;
  }
  interface Session {
    user: {
      _id: string;
      isOnBoarded: boolean;
      username?: string;
      email: string;
      telegramId?: string;
      budget?: number;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    isOnBoarded: boolean;
    username?: string;
    email: string;
    telegramId?: string;
    budget?: number;
  }
}
