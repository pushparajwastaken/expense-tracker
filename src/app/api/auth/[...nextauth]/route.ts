import NextAuth from "next-auth";
import { pool } from "../../../../lib/db";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Pool } from "pg";
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLECLIENT_ID ?? "",
      clientSecret: process.env.GOOGLECLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const existingUser = await pool.query(
        `
            SELECT id FROM users WHERE email=$1`,
        [user.email],
      );
      if (existingUser.rows.length === 0) {
        await pool.query(
          `
            INSERT INTO users (
          id,
          name,
          email,
          budget
        )
        VALUES ($1,$2,$3,$4)
        `,
          [crypto.randomUUID(), user.name, user.email, 0],
        );
      }
      return true;
    },
    async jwt({ token }) {
      const pool = new Pool({
        connectionString: process.env.DB_CONNECTION_URI,
      });
      const result = await pool.query(
        `
    SELECT id
    FROM users
    WHERE email = $1
    `,
        [token.email],
      );

      if (result.rows.length > 0) {
        token.userId = result.rows[0].id;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      return session;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
