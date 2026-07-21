'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authAPI } from './api';
import { useLocalePath } from './i18n/use-locale-path';

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
  has_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isRevalidated: boolean;
  login: (tokens: { access_token: string; refresh_token: string; user: User }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevalidated, setIsRevalidated] = useState(false);
  const router = useRouter();
  const lp = useLocalePath();
  const queryClient = useQueryClient();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Show cached user immediately to prevent flash of loading state.
      // Cookie auth means we can't check localStorage for a token — always
      // call /api/auth/me and let the HttpOnly cookie decide.
      const cached = localStorage.getItem('cached_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
          setLoading(false);
        } catch {
          localStorage.removeItem('cached_user');
        }
      }

      // Revalidate in background — cookie is sent automatically (withCredentials).
      try {
        const userData = await authAPI.getCurrentUser();
        localStorage.setItem('cached_user', JSON.stringify(userData));
        setUser(userData);
      } catch (error: any) {
        // 401 = no valid cookie → clear display cache and treat as logged out.
        // 403 = valid cookie but email unverified → keep user in state so OAuth
        // callbacks (e.g. Google Calendar) can still complete.
        if (error?.response?.status === 401) {
          localStorage.removeItem('cached_user');
          setUser(null);
        }
      } finally {
        setLoading(false);
        setIsRevalidated(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string; user: User }) => {
    // Tokens are in HttpOnly cookies set by the backend — not stored in localStorage.
    // Only the display cache and React state are written here.
    localStorage.setItem('cached_user', JSON.stringify(tokens.user));
    sessionStorage.removeItem('omni-presets-cache');
    // Some queries (e.g. daily summaries) are cached with staleTime: Infinity —
    // clear the whole client so the previous account's data can't leak in.
    queryClient.clear();
    setUser(tokens.user);
    setIsRevalidated(true);
    setLoading(false);
    setIsLoggingOut(false);

    // Auto-connect extension at login time with a token pair minted just for it.
    // Never share the web session's refresh token: refresh tokens are single-use,
    // so two clients rotating the same chain log each other out.
    try {
      const { checkExtensionInstalled, sendTokenToExtension } = await import('./extension');
      const { installed } = await checkExtensionInstalled();
      if (installed) {
        const { authAPI } = await import('./api');
        const extTokens = await authAPI.mintExtensionToken();
        sendTokenToExtension(extTokens.access_token, tokens.user.id, extTokens.refresh_token);
      }
    } catch {
      // Extension communication is optional.
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      const { notifyExtensionLogout } = await import('./extension');
      notifyExtensionLogout();
    } catch {
      // Extension communication is optional.
    }

    // Clear server-side HttpOnly cookies.
    try {
      await authAPI.logout();
    } catch {
      // Best-effort — proceed with local cleanup even if the endpoint fails.
    }

    // Navigate first to avoid protected route redirects (like /listen -> /signin).
    router.push(lp('/'));

    setTimeout(() => {
      localStorage.removeItem('cached_user');
      sessionStorage.removeItem('processingJobId');
      queryClient.clear();
      setUser(null);
      setIsRevalidated(false);
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
    <AuthContext.Provider value={{ user, loading, isRevalidated, login, logout, refreshUser, isLoggingOut }}>
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
