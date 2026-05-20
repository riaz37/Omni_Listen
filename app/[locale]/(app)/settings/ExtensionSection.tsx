'use client';

import { useState } from 'react';
import { Chrome, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useTranslation } from '@/lib/i18n/use-translation';

export function ExtensionSection() {
  const { user } = useRequireAuth();
  const { t } = useTranslation();
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<'unknown' | 'synced' | 'error'>('unknown');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    setStatus('unknown');

    try {
      const token = sessionStorage.getItem('access_token');

      if (!token) {
        setStatus('error');
        setMessage('No auth token found. Please log in again.');
        setSyncing(false);
        return;
      }

      const { sendTokenToExtension } = await import('@/lib/extension');
      const autoConnected = await sendTokenToExtension(token, user?.id);

      if (autoConnected) {
        await navigator.clipboard.writeText(token);
        setStatus('synced');
        setMessage('Connected automatically! Token copied to clipboard.');
        setSyncing(false);
        return;
      }

      await navigator.clipboard.writeText(token);
      setStatus('synced');
      setMessage('Token copied! Paste it in the extension popup.');
      setSyncing(false);
    } catch {
      setStatus('error');
      setMessage('Failed to connect. Try manual copy.');
      setSyncing(false);
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

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-2 text-sm">{t('settings.ext.how_to_connect')}</h3>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
            <li>
              <a
                href="https://microsoftedge.microsoft.com/addons/detail/esapailisten/edipmfpeajaajboenhdlcebebgapimgl?hl=en-US"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('settings.ext.step1')}
              </a>
            </li>
            <li>{t('settings.ext.step2')}</li>
            <li>{t('settings.ext.step3')}</li>
          </ol>
        </div>

        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            status === 'synced' ? 'text-primary bg-primary/5' :
            status === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
            'text-muted-foreground bg-muted'
          }`}>
            {status === 'synced' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {status === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="font-medium">{message}</span>
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={syncing}
          loading={syncing}
          iconLeft={<Chrome className="w-4 h-4" />}
        >
          {t('settings.ext.connect_btn')}
        </Button>
      </div>
    </SettingsSection>
  );
}
