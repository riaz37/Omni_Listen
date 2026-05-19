'use client';

import { useEffect } from 'react';

export default function LocaleAttributes({ locale, dir }: { locale: string; dir: 'ltr' | 'rtl' }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.className = 'h-full';
  }, [locale, dir]);

  return null;
}
