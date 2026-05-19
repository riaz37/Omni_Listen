export const locales = ['en', 'ar'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'
export const dir = (locale: Locale) => locale === 'ar' ? 'rtl' : 'ltr'
