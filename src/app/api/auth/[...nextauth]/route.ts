import dbConnect from "@/lib/dbConnect";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile ",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await dbConnect();
      let existingUser = await UserModel.findOne({ email: user.email });
      if (!existingUser) {
        existingUser = await UserModel.create({
          email: user.email,
          username: user.name,
          isOnBoarded: false,
          budget: 0,
          createdAt: new Date(),
        });
      }
      user._id = existingUser._id.toString();
      user.isOnBoarded = existingUser.isOnBoarded;
      user.budget = existingUser.budget;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.email = user.email;
        token.isOnBoarded = user.isOnBoarded;
        token.budget = user.budget;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.isOnBoarded = token.isOnBoarded;
        session.user.budget = token.budget;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
