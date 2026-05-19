'use client';

import { useState } from 'react';
import { Chrome, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export function ExtensionSection() {
  const { user } = useRequireAuth();
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
      title="Meeting Recorder Extension"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Install our Edge extension to record Zoom, Google Meet, and Microsoft Teams
          meetings directly from your browser. The recordings will be automatically
          transcribed using your preset settings.
        </p>

        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-2 text-sm">How to connect:</h3>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
            <li>
              <a
                href="https://microsoftedge.microsoft.com/addons/detail/esapailisten/edipmfpeajaajboenhdlcebebgapimgl?hl=en-US"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Install the ESAP Meeting Recorder from Edge Webstore
              </a>
            </li>
            <li>Click &quot;Copy Auth Token&quot; below</li>
            <li>Open the extension and paste the token in settings</li>
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
          Connect Extension
        </Button>
      </div>
    </SettingsSection>
  );
}
