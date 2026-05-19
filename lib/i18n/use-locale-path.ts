'use client'

import { useTranslation } from './use-translation'

export function useLocalePath() {
  const { locale } = useTranslation()
  return (path: string) => `/${locale}${path}`
}
