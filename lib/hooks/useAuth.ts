'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'seller' | 'curator' | 'admin';
  gender: 'male' | 'female' | '';
  sellerPoints?: number;
  curatorPoints?: number;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const session = await response.json();
        if (session.user) {
          setAuthState({
            user: session.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const requireAuth = (requiredRoles?: string[]) => {
    if (authState.isLoading) return;
    
    if (!authState.isAuthenticated) {
      router.push('/masuk');
      return;
    }

    if (requiredRoles && authState.user) {
      if (!requiredRoles.includes(authState.user.role)) {
        // Redirect based on user role
        switch (authState.user.role) {
          case 'seller':
            router.push('/seller');
            break;
          case 'curator':
            router.push('/curator');
            break;
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/dashboard');
        }
        return;
      }
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    ...authState,
    requireAuth,
    logout,
    refresh: checkAuth,
  };
}
