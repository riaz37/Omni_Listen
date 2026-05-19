'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('NEXT_LOCALE')
    const lang = saved || (navigator.language.startsWith('ar') ? 'ar' : 'en')
    router.replace(`/${lang}`)
  }, [router])

  return null
}
