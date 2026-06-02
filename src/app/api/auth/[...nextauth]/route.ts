import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLECLIENT_ID ?? "",
      clientSecret: process.env.GOOGLECLIENT_SECRET ?? "",
    }),
  ],
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
