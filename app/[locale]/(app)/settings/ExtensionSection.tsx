'use client';

import { useState, useEffect } from 'react';
import { Chrome, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTranslation } from '@/lib/i18n/use-translation';
import { checkExtensionInstalled, sendTokenToExtension } from '@/lib/extension';

const EDGE_STORE_URL =
  'https://microsoftedge.microsoft.com/addons/detail/esapailisten/edipmfpeajaajboenhdlcebebgapimgl?hl=en-US';

type ConnectionState = 'loading' | 'connected' | 'not-connected';

export function ExtensionSection() {
  const { user } = useRequireAuth();
  const { t } = useTranslation();
  const [connectionState, setConnectionState] = useState<ConnectionState>('loading');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    checkExtensionInstalled().then((status) => {
      if (!cancelled) {
        setConnectionState(status.connected ? 'connected' : 'not-connected');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token') ?? undefined;

      if (token) {
        const sent = await sendTokenToExtension(token, user?.id, refreshToken);
        if (sent) {
          setConnectionState('connected');
          setConnecting(false);
          return;
        }
      }

      // No token or send failed — open Edge Store so user can install/connect
      window.open(EDGE_STORE_URL, '_blank', 'noopener,noreferrer');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <SettingsSection
      id="extension"
      icon={<Chrome className="w-5 h-5" />}
      title={t('settings.ext.title')}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('settings.ext.description')}
        </p>

        {/* Connection status badge */}
        <div className="flex items-center gap-2 text-sm">
          {connectionState === 'loading' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Checking extension…</span>
            </>
          )}
          {connectionState === 'connected' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                Extension connected
              </span>
            </>
          )}
          {connectionState === 'not-connected' && (
            <>
              <Circle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Extension not connected</span>
            </>
          )}
        </div>

        <Button
          onClick={handleConnect}
          disabled={connecting || connectionState === 'loading'}
          loading={connecting}
          iconLeft={<Chrome className="w-4 h-4" />}
        >
          {t('settings.ext.connect_btn')}
        </Button>
      </div>
    </SettingsSection>
  );
}
