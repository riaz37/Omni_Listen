'use client';

import { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { calendarAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useConfirmDialog } from './ConfirmDialogContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog';
import { useTranslation } from '@/lib/i18n/use-translation';

export function CalendarSection() {
  const { user, refreshUser } = useRequireAuth();
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const [connecting, setConnecting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

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
    if (user?.has_password) {
      setDisconnectError(null);
      setPasswordDialogOpen(true);
    } else {
      confirm({
        title: t('settings.cal.disconnect_dialog_title'),
        message: t('settings.cal.disconnect_dialog_msg'),
        confirmLabel: t('settings.cal.disconnect_dialog_confirm'),
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
    }
  };

  const handleDisconnectWithPassword = async (password: string) => {
    setDisconnecting(true);
    setDisconnectError(null);
    try {
      await calendarAPI.disconnect(password);
      await refreshUser();
      setPasswordDialogOpen(false);
      toast.success('Calendar disconnected');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 403) {
        setDisconnectError(detail ?? 'Wrong password. Please try again.');
      } else {
        setPasswordDialogOpen(false);
        toast.error('Failed to disconnect calendar');
      }
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <SettingsSection
        id="calendar"
        icon={<Calendar className="w-5 h-5" />}
        title={t('settings.cal.title')}
      >
        {user?.calendar_connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-3 rounded-lg text-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-medium">{t('settings.cal.connected')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.cal.connected_desc')}
            </p>
            <Button variant="destructive" onClick={handleDisconnect}>
              {t('settings.cal.disconnect')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg text-sm">
              <X className="w-4 h-4 shrink-0" />
              <span className="font-medium">{t('settings.cal.not_connected')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.cal.not_connected_desc')}
            </p>
            <Button onClick={handleConnect} disabled={connecting} loading={connecting}>
              {t('settings.cal.connect')}
            </Button>
          </div>
        )}
      </SettingsSection>

      <PasswordConfirmDialog
        isOpen={passwordDialogOpen}
        title={t('settings.cal.disconnect_pw_title')}
        description={t('settings.cal.disconnect_pw_desc')}
        confirmLabel={t('settings.cal.disconnect_dialog_confirm')}
        isLoading={disconnecting}
        error={disconnectError}
        onConfirm={handleDisconnectWithPassword}
        onCancel={() => {
          if (!disconnecting) {
            setPasswordDialogOpen(false);
            setDisconnectError(null);
          }
        }}
      />
    </>
  );
}
