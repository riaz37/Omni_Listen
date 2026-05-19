'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from './config'
import type { Dictionary } from './get-dictionary'

interface I18nContextValue {
  locale: Locale
  dictionary: Dictionary
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextValue | null>(null)

function resolvePath(obj: Record<string, unknown>, path: string): string {
  // Try direct key first (handles flat keys like 'nav.features' stored with dots)
  if (typeof obj[path] === 'string') return obj[path] as string
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : path
}

interface I18nProviderProps {
  locale: Locale
  dictionary: Dictionary
  children: ReactNode
}

export function I18nProvider({ locale, dictionary, children }: I18nProviderProps) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  function t(key: string): string {
    const [namespace, ...rest] = key.split('.')
    const ns = (dictionary as Record<string, unknown>)[namespace]
    if (ns == null || typeof ns !== 'object') return key
    return resolvePath(ns as Record<string, unknown>, rest.join('.'))
  }

  return (
    <I18nContext.Provider value={{ locale, dictionary, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
