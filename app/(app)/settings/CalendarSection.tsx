'use client';

import { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { calendarAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useConfirmDialog } from './ConfirmDialogContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export function CalendarSection() {
  const { user, refreshUser } = useRequireAuth();
  const { confirm } = useConfirmDialog();
  const [connecting, setConnecting] = useState(false);

  // Refresh user on mount to get latest calendar_connected state
  useEffect(() => {
    refreshUser();
  }, []);

  // Handle OAuth callback (when Google redirects back to /settings directly)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Mark that the OAuth was initiated from settings so the signin callback
      // redirects back here instead of /listen after a successful connection.
      sessionStorage.setItem('calendarReturnTo', '/settings');
      const data = await calendarAPI.getAuthUrl();
      window.location.href = data.authorization_url;
    } catch {
      toast.error('Failed to connect calendar');
      setConnecting(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    try {
      await calendarAPI.handleCallback(code, state);
      await refreshUser();
      window.history.replaceState({}, document.title, '/settings');
      toast.success('Calendar connected successfully!');
    } catch {
      toast.error('Failed to connect calendar');
    }
  };

  const handleDisconnect = () => {
    confirm({
      title: 'Disconnect calendar',
      message: 'Are you sure you want to disconnect your calendar?',
      confirmLabel: 'Disconnect',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await calendarAPI.disconnect();
          await refreshUser();
          toast.success('Calendar disconnected');
        } catch {
          toast.error('Failed to disconnect calendar');
        }
      },
    });
  };

  return (
    <SettingsSection
      id="calendar"
      icon={<Calendar className="w-5 h-5" />}
      title="Google Calendar Integration"
    >
      {user?.calendar_connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-3 rounded-lg text-sm">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-medium">Calendar Connected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Conversation events will be automatically synced to your Google Calendar
            when you enable &quot;Calendar Sync&quot; in the output fields.
          </p>
          <Button variant="destructive" onClick={handleDisconnect}>
            Disconnect Calendar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg text-sm">
            <X className="w-4 h-4 shrink-0" />
            <span className="font-medium">Calendar Not Connected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Google Calendar to automatically create events from conversation
            action items when you enable &quot;Calendar Sync&quot; in the output fields.
          </p>
          <Button onClick={handleConnect} disabled={connecting} loading={connecting}>
            Connect Google Calendar
          </Button>
        </div>
      )}
    </SettingsSection>
  );
}
