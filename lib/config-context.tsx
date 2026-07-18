'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI, type SyncedPreferences } from './api';
import { useAuth } from './auth-context';

export type SummaryStyle = 'concise' | 'detailed' | 'executive';

// 'auto' lets the backend detect the language, 'multi' is Deepgram's
// code-switching mode, other values are language tags like 'ar' or 'en'.
export type MeetingLanguage = 'auto' | 'ar' | 'en' | 'multi';

interface ProcessingConfig {
  role: string;
  output_fields: {
    transcript: boolean;
    summary_english: boolean;
    summary_arabic: boolean;
    action_items: boolean;
    deadlines: boolean;
    calendar_sync: boolean;
    budget_notes: boolean;
    decisions: boolean;
    general_notes: boolean;
  };
  user_input: string;
  custom_field_only: boolean;
  summary_style: SummaryStyle;
  language: MeetingLanguage;
}

interface ConfigContextType {
  config: ProcessingConfig;
  setConfig: (config: ProcessingConfig) => void;
  updateConfig: (updates: Partial<ProcessingConfig>) => void;
}

const DEFAULT_CONFIG: ProcessingConfig = {
  role: 'Custom',
  output_fields: {
    transcript: true,
    summary_english: true,
    summary_arabic: true,
    action_items: true,
    deadlines: true,
    calendar_sync: true,
    budget_notes: true,
    decisions: true,
    general_notes: true,
  },
  user_input: '',
  custom_field_only: false,
  summary_style: 'detailed',
  language: 'auto',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const VALID_LANGUAGES: readonly string[] = ['auto', 'ar', 'en', 'multi'];
const VALID_SUMMARY_STYLES: readonly string[] = ['concise', 'detailed', 'executive'];

// Server prefs are clamped on write, but validate again here so an older or
// foreign value (e.g. a language tag this UI has no option for) can never
// put the selectors in an impossible state.
function sanitizeServerPrefs(prefs: SyncedPreferences): Partial<ProcessingConfig> {
  const updates: Partial<ProcessingConfig> = {};
  if (typeof prefs.role === 'string' && prefs.role) {
    updates.role = prefs.role;
  }
  if (typeof prefs.summary_style === 'string' && VALID_SUMMARY_STYLES.includes(prefs.summary_style)) {
    updates.summary_style = prefs.summary_style as SummaryStyle;
  }
  if (typeof prefs.language === 'string' && VALID_LANGUAGES.includes(prefs.language)) {
    updates.language = prefs.language as MeetingLanguage;
  }
  if (typeof prefs.custom_field_only === 'boolean') {
    updates.custom_field_only = prefs.custom_field_only;
  }
  if (prefs.output_fields && typeof prefs.output_fields === 'object') {
    const fields = { ...DEFAULT_CONFIG.output_fields };
    for (const key of Object.keys(fields) as (keyof ProcessingConfig['output_fields'])[]) {
      const value = prefs.output_fields[key];
      if (typeof value === 'boolean') fields[key] = value;
    }
    updates.output_fields = fields;
  }
  return updates;
}

function cacheConfig(config: ProcessingConfig): void {
  // Don't save user_input to localStorage - it's saved per-user in database
  const { user_input, ...configToSave } = config;
  localStorage.setItem('processing_config', JSON.stringify({ ...configToSave, user_input: '' }));
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<ProcessingConfig>(DEFAULT_CONFIG);
  const { user } = useAuth();
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('processing_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Always reset user_input to empty - it's now loaded from database (user-specific)
        // Merge over defaults so configs saved before new fields existed stay complete.
        setConfigState({ ...DEFAULT_CONFIG, ...parsed, user_input: '' });
      } catch (error) {
      }
    }
  }, []);

  // Account-level preferences win over the local cache so settings follow
  // the user across browsers and devices (localStorage is only a fast,
  // offline-safe starting point until this fetch lands).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    authAPI
      .getPreferences()
      .then(({ preferences }) => {
        if (cancelled || !preferences) return;
        setConfigState((prev) => {
          const merged = { ...prev, ...sanitizeServerPrefs(preferences) };
          cacheConfig(merged);
          return merged;
        });
      })
      .catch(() => {
        // Offline or cold backend - the local cache stands
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, []);

  // Save config to localStorage whenever it changes
  const setConfig = (newConfig: ProcessingConfig) => {
    setConfigState(newConfig);
    cacheConfig(newConfig);

    // Debounced write-through to the account (fire-and-forget): the same
    // settings then appear on the next sign-in from any browser or device.
    if (user?.id) {
      const { user_input, ...prefsToSync } = newConfig;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        authAPI.savePreferences(prefsToSync).catch(() => {
          // Best-effort sync; localStorage already has the change
        });
      }, 1000);
    }
  };

  const updateConfig = (updates: Partial<ProcessingConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
