"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';

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
      // Verify token with backend
      ApiClient.getCurrentUser()
        .then((userData) => {
          // Update user data from backend
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            locale: userData.locale || 'id',
          };
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
        .catch(() => {
          // Token invalid or backend unavailable, keep stored user
          setUser(JSON.parse(storedUser));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No stored credentials - user must login
      setUser(null);
      setLoading(false);
    }
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
      // Call backend API
      const response = await ApiClient.login(email, password);
      
      // Backend login successful
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        avatar: response.user.avatar,
        locale: response.user.locale || 'id',
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setUser(user);
      if (router) router.push(`/dashboard/${user.role.toLowerCase()}`);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API
      await ApiClient.logout().catch(() => {
        // If backend unavailable, just clear local storage
        console.warn('Backend logout failed, clearing local storage');
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
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
