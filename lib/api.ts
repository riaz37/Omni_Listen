/**
 * API client for backend communication
 */
import axios from 'axios';
import { getUserTimezone } from './timezone';
import { uploadWithStallRetry } from './upload-stall';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Account-level processing defaults synced via /api/user/preferences.
// Matches the client's processing_config minus user_input.
export interface SyncedPreferences {
  role?: string;
  output_fields?: Record<string, boolean>;
  custom_field_only?: boolean;
  summary_style?: string;
  language?: string;
}

function getSignInUrl(): string {
  const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('NEXT_LOCALE'))
    || (typeof navigator !== 'undefined' && navigator.language.startsWith('ar') ? 'ar' : 'en');
  return `/${lang}/signin`;
}

// Routes that require a session. Only these may hard-redirect to /signin when
// the session is dead — public pages (landing, marketing, auth flows) must
// render for anonymous visitors even though AuthProvider's /me probe 401s there.
const PROTECTED_ROUTES = /^\/(en|ar)\/(listen|history|analytics|calendar|events|notes|queries|tasks|settings|conversation|autonomous|mini)(\/|$)/;

export function shouldRedirectToSignIn(pathname: string): boolean {
  return PROTECTED_ROUTES.test(pathname);
}

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // send cookies on every cross-origin request
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s default for all standard requests
});

// Request interceptor — only attaches the timezone header.
// Auth is now handled by HttpOnly cookies sent automatically by the browser.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const userTimezone = getUserTimezone();
        config.headers['X-User-Timezone'] = userTimezone;
      } catch {
        // getUserTimezone failed — no header attached, backend uses UTC
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Token refresh promise — prevents concurrent refresh requests.
let refreshTokenPromise: Promise<void> | null = null;

// Response interceptor to handle token refresh via HttpOnly cookie rotation.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = (async () => {
            try {
              // Web: refresh_token cookie sent automatically (withCredentials).
              // Empty body — the cookie carries the token. Generous timeout:
              // a cold-started backend can take ~60s to answer, and giving up
              // early must not be mistaken for an invalid session.
              await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true, timeout: 90000 });
            } finally {
              refreshTokenPromise = null;
            }
          })();
        }

        await refreshTokenPromise;
        // Retry with fresh cookie (browser sends it automatically).
        return api(originalRequest);
      } catch (refreshError: any) {
        // Only a definitive rejection from the refresh endpoint means the
        // session is dead. Network errors, timeouts, and 5xx are transient —
        // clearing the (still valid) cookies on those turns a backend blip
        // into a forced re-login.
        const refreshStatus = refreshError?.response?.status;
        const sessionDead = refreshStatus === 401 || refreshStatus === 403 || refreshStatus === 422;

        if (sessionDead && typeof window !== 'undefined') {
          localStorage.removeItem('cached_user');
          // Hard-redirect only from protected app routes. Public pages (landing,
          // marketing, signin/signup) must stay put: redirecting from /signin
          // causes an infinite reload loop, and redirecting from the landing
          // page means no logged-out visitor can ever see it.
          if (shouldRedirectToSignIn(window.location.pathname)) {
            try {
              await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
            } catch {
              // Best-effort cookie clear
            }
            window.location.href = getSignInUrl();
          }
        }
        // Session dead → propagate the original 401 so callers treat it as
        // signed-out. Transient refresh failure → propagate the refresh error
        // (network/5xx) so callers do NOT mistake it for an auth rejection.
        return Promise.reject(sessionDead ? error : refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Authentication API
export const authAPI = {
  googleAuth: async (token: string) => {
    const response = await api.post('/api/auth/google', { token });
    return response.data;
  },

  register: async (email: string, password: string, name?: string) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getGitHubAuthUrl: async () => {
    const response = await api.get('/api/auth/github/url');
    return response.data;
  },

  getGoogleAuthUrl: async () => {
    const response = await api.get('/api/auth/google/url');
    return response.data;
  },

  githubAuth: async (code: string) => {
    const response = await api.post('/api/auth/github', { code });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  // Dedicated token pair for the browser extension — its own rotation chain,
  // independent of the web session's cookie tokens.
  mintExtensionToken: async (): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await api.post('/api/auth/extension-token', {});
    return response.data;
  },

  updateProfile: async (name: string) => {
    const response = await api.patch('/api/auth/profile', { name });
    return response.data;
  },

  setActiveRole: async (role_name: string | null) => {
    const response = await api.post('/api/auth/active-role', { role_name });
    return response.data;
  },

  saveLastQuery: async (query: string, role_name?: string | null) => {
    const response = await api.post('/api/user/last-query', { query, role_name });
    return response.data;
  },

  getPreferences: async (): Promise<{ preferences: SyncedPreferences | null }> => {
    const response = await api.get('/api/user/preferences');
    return response.data;
  },

  savePreferences: async (preferences: SyncedPreferences): Promise<{ success: boolean }> => {
    const response = await api.put('/api/user/preferences', preferences);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, new_password: string) => {
    const response = await api.post('/api/auth/reset-password', { token, new_password });
    return response.data;
  },

  // Aliases for consistency
  emailRegister: async (email: string, password: string, name?: string) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  },

  emailLogin: async (email: string, password: string) => {
    // Login must outlive a slow/cold backend: with the default 15s timeout a
    // server-side-successful login can look like a failure to the client
    // (and the user gets blamed for a wrong password).
    const response = await api.post('/api/auth/login', { email, password }, { timeout: 60000 });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};

// Conversations API
export const conversationsAPI = {
  uploadAudio: async (file: File, config: any, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    // No flat timeout: a large file on a slow uplink legitimately takes more
    // than any fixed cap (a 30 MB recording at ~60 KB/s needs ~9 min). The
    // stall guard aborts only when zero bytes move for a full minute, and
    // retries once if the transfer drops mid-body.
    return uploadWithStallRetry(async (signal, onUploadProgress) => {
      const response = await api.post('/api/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 0, // disable the 15s instance default; the stall guard governs
        signal,
        onUploadProgress,
      });
      return response.data;
    }, { onProgress });
  },

  getJobStatus: async (jobId: string) => {
    try {
      const response = await api.get(`/api/job/${jobId}/status`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return { status: 'failed', error: 'Job not found (404)' };
      }
      throw error;
    }
  },

  getJobResult: async (jobId: string) => {
    const response = await api.get(`/api/job/${jobId}/result`);
    return response.data;
  },

  getConversations: async (limit = 50, offset = 0) => {
    const response = await api.get('/api/meetings', { params: { limit, offset } });
    return response.data;
  },

  retryExtraction: async (jobId: string) => {
    const response = await api.post(`/api/meetings/${jobId}/retry-extraction`);
    return response.data as { job_id: string; status: string };
  },

  getAllConversations: async () => {
    const response = await api.get('/api/meetings', { params: { limit: 1000, offset: 0 } });
    return response.data.meetings || response.data;
  },

  getConversationDetails: async (jobId: string) => {
    const response = await api.get(`/api/meetings/${jobId}`);
    return response.data;
  },

  deleteConversation: async (jobId: string) => {
    const response = await api.delete(`/api/meetings/${jobId}`);
    return response.data;
  },

  syncToCalendar: async (jobId: string) => {
    const response = await api.post(`/api/meetings/${jobId}/sync-calendar`);
    return response.data;
  },

  createNote: async (jobId: string, noteData: { title: string; description: string; category: string }) => {
    const response = await api.post(`/api/meetings/${jobId}/notes`, noteData);
    return response.data;
  },

  toggleTaskCompletion: async (eventId: number, completed: boolean) => {
    const response = await api.patch(`/api/events/${eventId}/toggle-complete`, { completed });
    return response.data;
  },

  deleteEvent: async (eventId: number) => {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  },

  deleteNote: async (noteId: number) => {
    const response = await api.delete(`/api/notes/${noteId}`);
    return response.data;
  },

  updateNote: async (noteId: number, updates: {
    title?: string;
    description?: string;
    category?: string;
  }) => {
    const response = await api.patch(`/api/notes/${noteId}`, updates);
    return response.data;
  },

  // BFF: single request returning limited events, notes, and conversations for the dashboard
  getDashboard: async (): Promise<{ events: any[]; notes: any[]; conversations: any[] }> => {
    const response = await api.get('/api/dashboard');
    return response.data;
  },

  // Direct queries for events/notes (works even if meeting is deleted)
  getAllEvents: async () => {
    const response = await api.get('/api/all-events');
    return response.data;
  },

  getAllNotes: async () => {
    const response = await api.get('/api/all-notes');
    return response.data;
  },

  createTask: async (taskData: { title: string; description?: string; date?: string; urgency?: string }) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  updateEventAssignee: async (eventId: number, assignee: string) => {
    const response = await api.patch(`/api/events/${eventId}/assignee`, { assignee });
    return response.data;
  },

  updateEvent: async (eventId: number, updates: {
    title?: string;
    date?: string;
    description?: string;
    location?: string;
    assignee?: string;
  }) => {
    const response = await api.patch(`/api/events/${eventId}`, updates);
    return response.data;
  },

  // Bulk delete operations
  bulkDeleteEvents: async (ids: number[]) => {
    const response = await api.post('/api/events/bulk-delete', { ids });
    return response.data;
  },

  deleteAllEvents: async () => {
    const response = await api.delete('/api/events/delete-all');
    return response.data;
  },

  bulkDeleteNotes: async (ids: number[]) => {
    const response = await api.post('/api/notes/bulk-delete', { ids });
    return response.data;
  },

  deleteAllNotes: async () => {
    const response = await api.delete('/api/notes/delete-all');
    return response.data;
  },

  bulkDeleteConversations: async (ids: number[]) => {
    const response = await api.post('/api/meetings/bulk-delete', { ids });
    return response.data;
  },

  deleteAllConversations: async () => {
    const response = await api.delete('/api/meetings/delete-all');
    return response.data;
  },

  queryConversation: async (jobId: string, query: string) => {
    const response = await api.post(`/api/query/meeting/${jobId}`, { query });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const response = await api.get('/api/analytics');
    return response.data;
  },
};

// Presets API
export const presetsAPI = {
  getPresets: async () => {
    const response = await api.get('/api/presets');
    return response.data;
  },

  createPreset: async (data: { name: string; config: any; is_default?: boolean }) => {
    const response = await api.post('/api/presets', data);
    return response.data;
  },

  updatePreset: async (id: number, data: { name?: string; config?: any; is_default?: boolean }) => {
    const response = await api.put(`/api/presets/${id}`, data);
    return response.data;
  },

  deletePreset: async (id: number) => {
    const response = await api.delete(`/api/presets/${id}`);
    return response.data;
  },

  setDefaultPreset: async (id: number) => {
    const response = await api.put(`/api/presets/${id}/set-default`);
    return response.data;
  },
};

// Calendar API
export const calendarAPI = {
  getAuthUrl: async (redirectUri?: string) => {
    const finalRedirectUri = redirectUri ?? (typeof window !== 'undefined'
      ? `${window.location.origin}/en/signin`
      : undefined);
    const response = await api.get('/api/calendar/auth-url', {
      params: finalRedirectUri ? { redirect_uri: finalRedirectUri } : undefined,
    });
    return response.data;
  },

  handleCallback: async (code: string, state: string, redirectUri?: string) => {
    const finalRedirectUri = redirectUri ?? (typeof window !== 'undefined'
      ? `${window.location.origin}/en/signin`
      : undefined);
    const response = await api.post('/api/calendar/callback', {
      code, state, ...(finalRedirectUri ? { redirect_uri: finalRedirectUri } : {}),
    });
    return response.data;
  },

  disconnect: async (password?: string) => {
    const response = await api.post('/api/calendar/disconnect',
      password ? { current_password: password } : {}
    );
    return response.data;
  },
};

// Summary API
export const summaryAPI = {
  getDailySummary: async (date: string) => {
    const response = await api.get(`/api/summary/daily/${date}`);
    return response.data;
  },
  generateDailySummary: async (date: string) => {
    const response = await api.post(`/api/summary/daily/${date}`);
    return response.data;
  }
};

// Briefing API (Morning Briefing)
export const briefingAPI = {
  getTodaysBriefing: async () => {
    const response = await api.get('/api/briefing/today');
    return response.data;
  },
  generateBriefing: async () => {
    const response = await api.post('/api/briefing/generate');
    return response.data;
  }
};

// Webhooks API
export const webhooksAPI = {
  list: async () => {
    const response = await api.get('/api/webhooks');
    return response.data;
  },

  create: async (data: { url: string; events: string[]; name?: string }) => {
    const response = await api.post('/api/webhooks', data);
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get(`/api/webhooks/${id}`);
    return response.data;
  },

  update: async (id: number, data: { url?: string; events?: string[]; name?: string; is_active?: boolean }) => {
    const response = await api.put(`/api/webhooks/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/webhooks/${id}`);
    return response.data;
  },

  rotateSecret: async (id: number) => {
    const response = await api.post(`/api/webhooks/${id}/rotate-secret`);
    return response.data;
  },

  test: async (id: number) => {
    const response = await api.post(`/api/webhooks/${id}/test`);
    return response.data;
  },

  getLogs: async (id: number, limit = 20) => {
    const response = await api.get(`/api/webhooks/${id}/logs`, { params: { limit } });
    return response.data;
  },

  toggle: async (id: number, isActive: boolean) => {
    const response = await api.put(`/api/webhooks/${id}`, { is_active: isActive });
    return response.data;
  },
};

// API Keys API
export const apiKeysAPI = {
  list: async () => {
    const response = await api.get('/api/keys');
    return response.data;
  },

  create: async (name?: string) => {
    const response = await api.post('/api/keys', { name });
    return response.data;
  },

  revoke: async (id: number, password?: string) => {
    const response = await api.delete(`/api/keys/${id}`, {
      data: password ? { current_password: password } : undefined,
    });
    return response.data;
  },
};
