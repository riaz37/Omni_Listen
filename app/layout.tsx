import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ConfigProvider } from '@/lib/config-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/components/Toast';
import { GlobalStateProvider } from '@/lib/global-state-context';
import FloatingStatusIndicator from '@/components/FloatingStatusIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ESAPListen - AI Meeting Analysis',
  description: 'Transform meetings into actionable insights',
  icons: {
    icon: '/esapai_logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ESAPListen',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,  // Allow zoom for accessibility
  themeColor: '#11DF78',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full`} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <ConfigProvider>
                <GlobalStateProvider>
                  {children}
                  <FloatingStatusIndicator />
                </GlobalStateProvider>
              </ConfigProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
