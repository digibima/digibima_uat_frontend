import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "TokenLogin",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        // console.log("🛂 authorize called with:", credentials);

        if (!credentials?.token) throw new Error("Missing token");

        // Only return ID and token
        return {
          id: "user1", 
          token: credentials.token,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt", // store session in a signed JWT
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.token = user.token; // ✅ Token stored in JWT only
      }
      return token;
    },

    async session({ session, token }) {
      // Do NOT expose token to client
      // You can optionally return a limited user object
      session.user = {
        name: "Authenticated User", // static or dynamic if you have
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET || "secret",
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);