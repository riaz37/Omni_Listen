'use client'

import { useCallback } from 'react'
import { useTranslation } from './use-translation'

export function useLocalePath() {
  const { locale } = useTranslation()
  // Stable identity per locale — components use this in useEffect deps, and a
  // fresh function every render forces those effects to re-run (the notifications
  // WebSocket was reconnecting once per second because of this).
  return useCallback((path: string) => `/${locale}${path}`, [locale])
}
