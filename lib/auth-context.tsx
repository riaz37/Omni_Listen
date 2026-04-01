'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from './api';

interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
  calendar_connected: boolean;
  email_verified: boolean;
  active_role?: string | null;
  last_custom_query?: string | null;
  role_preferences?: string | null; // JSON string
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (tokens: { access_token: string; refresh_token: string; user: User }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string; user: User }) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setUser(tokens.user);
    setIsLoggingOut(false);

    // Try to send token to extension (auto-connect)
    try {
      const { sendTokenToExtension } = await import('./extension');
      sendTokenToExtension(tokens.access_token, tokens.user.id);
    } catch (e) {
      // Extension communication is optional, ignore errors
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);

    // Notify extension to clear auth
    try {
      const { notifyExtensionLogout } = await import('./extension');
      notifyExtensionLogout();
    } catch (e) {
      // Extension communication is optional, ignore errors
    }

    // Navigate first to avoid protected route redirects (like /dashboard -> /signin)
    router.push('/');

    // Clear state after a brief delay to allow navigation to start
    setTimeout(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('processingJobId');
      setUser(null);
      setIsLoggingOut(false);
    }, 1000);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
