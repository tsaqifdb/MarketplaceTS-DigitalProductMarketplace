"use client";

import React, { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'seller' | 'curator' | 'admin';
  gender?: 'male' | 'female';
  sellerPoints?: number;
  curatorPoints?: number;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user ? {
    id: session.user.id!,
    email: session.user.email!,
    name: session.user.name!,
    role: session.user.role as 'client' | 'seller' | 'curator' | 'admin',
    gender: session.user.gender as 'male' | 'female' | undefined,
    sellerPoints: session.user.sellerPoints,
    curatorPoints: session.user.curatorPoints,
    isEmailVerified: session.user.isEmailVerified,
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
