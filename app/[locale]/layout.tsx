import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ConfigProvider } from '@/lib/config-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from '@/components/ui/sonner';
import { GlobalStateProvider } from '@/lib/global-state-context';
import FloatingStatusIndicator from '@/components/FloatingStatusIndicator';
import VersionSkewWatcher from '@/components/VersionSkewWatcher';
import { ReactQueryProvider } from '../providers';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import LocaleAttributes from '@/components/LocaleAttributes';

export const metadata: Metadata = {
  title: 'Omni Listen',
  description: 'Your AI assistant that listens, understands, and organizes everything you say',
  icons: {
    icon: [
      { url: '/logo-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/logo.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Omni Listen',
  },
  verification: {
    google: 'ELu4vvz6OIwe74QsMWAiiawf-WoRC_xW3dfifdG5NGw',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#11DF78',
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dictionary = await getDictionary(locale as Locale);

  return (
    <>
      <LocaleAttributes locale={locale} dir={dir} />
      <ReactQueryProvider>
        <ThemeProvider>
          <I18nProvider locale={locale as Locale} dictionary={dictionary}>
            <AuthProvider>
              <ConfigProvider>
                <GlobalStateProvider>
                  {children}
                  <FloatingStatusIndicator />
                  <VersionSkewWatcher />
                  <Toaster />
                </GlobalStateProvider>
              </ConfigProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </>
  );
}
