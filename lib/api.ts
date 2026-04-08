/**
 * API client for backend communication
 */
import axios from 'axios';
import { getUserTimezone } from './timezone';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout (increased from 60s to handle large audio files)
});

// Request interceptor to add auth token and user timezone
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add user's current timezone to all requests
      // This auto-updates when user travels to a different timezone
      try {
        const userTimezone = getUserTimezone();
        config.headers['X-User-Timezone'] = userTimezone;
      } catch (error) {
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refresh promise to prevent concurrent refresh requests
let refreshTokenPromise: Promise<string> | null = null;

// Response interceptor to handle token refresh with rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refreshToken) {
          // If a refresh is already in progress, wait for it
          if (!refreshTokenPromise) {
            refreshTokenPromise = (async () => {
              try {
                const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                  refresh_token: refreshToken,
                });

                const { access_token, refresh_token: new_refresh_token } = response.data;

                // Store both new tokens (implements refresh token rotation)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('access_token', access_token);
                  if (new_refresh_token) {
                    localStorage.setItem('refresh_token', new_refresh_token);
                  }
                }
                return access_token;
              } catch (err) {
                throw err;
              } finally {
                // Clear the promise after completion
                refreshTokenPromise = null;
              }
            })();
          } else {
          }

          // Wait for the refresh to complete
          const access_token = await refreshTokenPromise;

          // Retry the original request with new token
          // Create a new config object to avoid mutation issues
          const newConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${access_token}`,
            },
          };

          return api(newConfig);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/signin';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
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
    const response = await api.post('/api/auth/login', { email, password });
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
};

// Conversations API
export const conversationsAPI = {
  uploadAudio: async (file: File, config: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('config', JSON.stringify(config));

    const response = await api.post('/api/process-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
  getAuthUrl: async () => {
    const response = await api.get('/api/calendar/auth-url');
    return response.data;
  },

  handleCallback: async (code: string, state: string) => {
    const response = await api.post('/api/calendar/callback', { code, state });
    return response.data;
  },

  disconnect: async () => {
    const response = await api.post('/api/calendar/disconnect');
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

  revoke: async (id: number) => {
    const response = await api.delete(`/api/keys/${id}`);
    return response.data;
  },
};
