import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { Cart } from "./types/cart"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (!user[0]) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user[0].password
        )

        if (!isPasswordValid) {
          return null
        }

        // Cek approval kurator - gunakan return null dengan message
        if (
          user[0].role === 'curator' &&
          user[0].isCuratorApproved !== true
        ) {
          // NextAuth akan menangkap ini sebagai CredentialsSignin error
          // Tapi kita bisa cek di database lagi dari frontend
          return null
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          gender: user[0].gender || undefined,
          sellerPoints: user[0].sellerPoints ?? undefined,
          curatorPoints: user[0].curatorPoints ?? undefined,
          isEmailVerified: user[0].isEmailVerified ?? undefined,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.gender = user.gender;
        token.sellerPoints = user.sellerPoints;
        token.curatorPoints = user.curatorPoints;
        token.isEmailVerified = user.isEmailVerified;
        token.cart = { items: [], voucher: null };
      }
 
      if (trigger === "update" && session?.cart) {
        token.cart = session.cart;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.gender = token.gender as string;
        session.user.sellerPoints = token.sellerPoints as number;
        session.user.curatorPoints = token.curatorPoints as number;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        session.cart = token.cart as Cart;
      }
      return session;
    }
  },
  pages: {
    signIn: "/masuk",
  },
})