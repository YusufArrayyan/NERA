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
      setUser(JSON.parse(storedUser));
    } else {
      // MOCK MODE: Auto-login as demo student for preview
      const mockUser: User = {
        id: 'demo-student-001',
        name: 'Alya Juwita Putri',
        email: 'alya@nera.demo',
        role: 'STUDENT',
        locale: 'id',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('accessToken', 'demo-token');
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
      // Try backend API first
      const response = await ApiClient.login(email, password).catch(() => null);
      
      if (response && response.user) {
        // Real backend login successful
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
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        setUser(user);
        if (router) router.push(`/dashboard/${user.role.toLowerCase()}`);
        return;
      }
      
      // Fallback: DEMO MODE - Support multiple demo accounts
      let mockUser: User;
      
      if (email.includes('teacher') || email.includes('guru')) {
        mockUser = {
          id: 'demo-teacher-001',
          name: 'Pak Budi Santoso',
          email: email,
          role: 'TEACHER',
          locale: 'id',
        };
      } else if (email.includes('admin')) {
        mockUser = {
          id: 'demo-admin-001',
          name: 'Admin NERA',
          email: email,
          role: 'ADMIN',
          locale: 'id',
        };
      } else if (email.includes('counselor')) {
        mockUser = {
          id: 'demo-counselor-001',
          name: 'Bu Ratna',
          email: email,
          role: 'COUNSELOR',
          locale: 'id',
        };
      } else if (email.includes('parent') || email.includes('orangtua')) {
        mockUser = {
          id: 'demo-parent-001',
          name: 'Bapak/Ibu Alya',
          email: email,
          role: 'PARENT',
          locale: 'id',
        };
      } else {
        // Default to student
        mockUser = {
          id: 'demo-student-001',
          name: 'Alya Juwita Putri',
          email: email,
          role: 'STUDENT',
          locale: 'id',
        };
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', 'demo-token');
        localStorage.setItem('refreshToken', 'demo-refresh-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
      }
      
      setUser(mockUser);
      if (router) router.push(`/dashboard/${mockUser.role.toLowerCase()}`);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // MOCK MODE: Skip backend, just clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    setUser(null);
    if (router) router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
