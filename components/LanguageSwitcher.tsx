'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { useTranslation } from '@/lib/i18n/use-translation'

function buildLocalePath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split('/')
  segments[1] = targetLocale
  return segments.join('/') || `/${targetLocale}`
}

function setCookieLocale(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export default function LanguageSwitcher() {
  const { locale } = useTranslation()
  const pathname = usePathname()

  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5" role="group" aria-label="Language switcher">
      {locales.map((l) => (
        <Link
          key={l}
          href={buildLocalePath(pathname, l)}
          onClick={() => setCookieLocale(l)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            locale === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-current={locale === l ? 'page' : undefined}
          aria-label={l === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          {l === 'en' ? 'EN' : 'ع'}
        </Link>
      ))}
    </div>
  )
}
