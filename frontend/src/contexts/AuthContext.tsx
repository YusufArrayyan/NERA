"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

type UserRole = 'STUDENT' | 'TEACHER' | 'COUNSELOR' | 'PARENT' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  locale: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Only use router/pathname on client side
  let router = null;
  let pathname = null;
  
  try {
    router = useRouter();
    pathname = usePathname();
  } catch (e) {
    // Router not available during build/SSR
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    if (typeof window === 'undefined') return; // Skip on server
    
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Role-based routing protection - only client side
  useEffect(() => {
    if (!isClient || loading || !router || !pathname) return;
    
    const isDashboardPath = pathname.startsWith('/dashboard');
    
    if (!user && isDashboardPath) {
      router.push('/auth/login');
    } else if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      // Redirect to correct dashboard based on role
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } else if (user && isDashboardPath) {
      // Ensure they don't access other roles' dashboards
      const rolePath = `/dashboard/${user.role.toLowerCase()}`;
      if (!pathname.startsWith(rolePath) && pathname !== '/dashboard') {
        router.push(rolePath);
      }
    }
  }, [user, loading, pathname, router, isClient]);

  const login = async (email: string, password: string) => {
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setUser(data.user);
      if (router) router.push(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      setUser(null);
      if (router) router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
