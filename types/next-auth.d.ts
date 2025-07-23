import { DefaultSession } from "next-auth"
import { Cart } from "@/lib/types/cart"; // Import the Cart type

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      gender?: string
      sellerPoints?: number
      curatorPoints?: number
      isEmailVerified?: boolean
    } & DefaultSession["user"];
    cart: Cart; // Update cart property to use the Cart interface
  }

  interface User {
    role: string
    gender?: string
    sellerPoints?: number
    curatorPoints?: number
    isEmailVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    gender?: string
    sellerPoints?: number
    curatorPoints?: number
    isEmailVerified?: boolean
    cart: Cart; // Add cart property to JWT
  }
}
