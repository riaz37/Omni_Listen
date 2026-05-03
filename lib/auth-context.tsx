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
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          console.error('Auth check failed:', error);
          // Only clear the token on 401 (invalid/expired). A 403 means the
          // token is valid but the user lacks a specific permission (e.g. email
          // not yet verified) — keep the token so in-flight requests (like the
          // Google Calendar OAuth callback) can still authenticate.
          if (error?.response?.status === 401) {
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string; user: User }) => {
    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
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

    // Navigate first to avoid protected route redirects (like /listen -> /signin)
    router.push('/');

    // Clear state after a brief delay to allow navigation to start
    setTimeout(() => {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('processingJobId');
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
