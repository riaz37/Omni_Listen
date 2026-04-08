'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from 'sonner';
import { calendarAPI, authAPI, webhooksAPI, apiKeysAPI } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Loader2 } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import PageEntrance from '@/components/ui/page-entrance';
import { ProfileSection } from './ProfileSection';
import { CalendarSection } from './CalendarSection';
import { ExtensionSection } from './ExtensionSection';
import { DesktopAppSection } from './DesktopAppSection';
import { WebhooksSection } from './WebhooksSection';
import { ApiKeysSection } from './ApiKeysSection';

interface ApiKeyData {
  id: number;
  name: string | null;
  key_prefix: string;
  created_at: string;
}

interface WebhookData {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  { value: 'task.created', label: 'Task Created' },
  { value: 'event.updated', label: 'Event Updated' },
  { value: 'event.completed', label: 'Event Completed' },
  { value: 'event.deleted', label: 'Event Deleted' },
  { value: 'note.created', label: 'Note Created' },
  { value: 'meeting.processed', label: 'Meeting Processed' },
];

export default function SettingsPage() {
  const { user, loading, refreshUser } = useRequireAuth();

  const [connectingCalendar, setConnectingCalendar] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [extensionSyncing, setExtensionSyncing] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<'unknown' | 'synced' | 'error'>('unknown');
  const [extensionMessage, setExtensionMessage] = useState('');

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookCreating, setWebhookCreating] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<Record<number, 'testing' | 'success' | 'error'>>({});

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [apiKeyCreating, setApiKeyCreating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{title: string; message: string; onConfirm: () => void; confirmLabel?: string; variant?: 'danger' | 'warning'} | null>(null);

  // Load webhooks on mount
  useEffect(() => {
    loadWebhooks();
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const data = await apiKeysAPI.list();
      const keyList = Array.isArray(data) ? data : (data.keys || []);
      setApiKeys(keyList);
    } catch (error) {
    } finally {
      setApiKeysLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) return;

    setApiKeyCreating(true);
    try {
      const data = await apiKeysAPI.create(newApiKeyName);
      setNewKeySecret(data.key);
      await loadApiKeys();
      setNewApiKeyName('');
    } catch (error) {
    } finally {
      setApiKeyCreating(false);
    }
  };

  const handleRevokeApiKey = (id: number) => {
    setConfirmDialog({
      title: 'Revoke API key',
      message: 'Are you sure you want to revoke this API key? This cannot be undone.',
      confirmLabel: 'Revoke',
      onConfirm: async () => {
        try {
          await apiKeysAPI.revoke(id);
          await loadApiKeys();
        } catch (error) {
        }
      },
    });
  };

  const closeApiKeyModal = () => {
    setShowApiKeyModal(false);
    setNewApiKeyName('');
    setNewKeySecret(null);
  };

  const loadWebhooks = async () => {
    try {
      const data = await webhooksAPI.list();
      const webhookList = Array.isArray(data) ? data : (data.webhooks || []);
      setWebhooks(webhookList);
    } catch (error) {
    } finally {
      setWebhooksLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      handleCalendarCallback(code, state);
    }
  }, []);

  const handleConnectCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const data = await calendarAPI.getAuthUrl();
      window.location.href = data.authorization_url;
    } catch (error) {
      toast.error('Failed to connect calendar');
      setConnectingCalendar(false);
    }
  };

  const handleCalendarCallback = async (code: string, state: string) => {
    try {
      await calendarAPI.handleCallback(code, state);
      await refreshUser();
      window.history.replaceState({}, document.title, '/settings');
      toast.success('Calendar connected successfully!');
    } catch (error) {
      toast.error('Failed to connect calendar');
    }
  };

  const handleDisconnectCalendar = () => {
    setConfirmDialog({
      title: 'Disconnect calendar',
      message: 'Are you sure you want to disconnect your calendar?',
      confirmLabel: 'Disconnect',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await calendarAPI.disconnect();
          await refreshUser();
          toast.success('Calendar disconnected');
        } catch (error) {
          toast.error('Failed to disconnect calendar');
        }
      },
    });
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await authAPI.updateProfile(newName);
      await refreshUser();
      setEditingName(false);
      setNewName('');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const handleSyncExtension = async () => {
    setExtensionSyncing(true);
    setExtensionMessage('');
    setExtensionStatus('unknown');

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setExtensionStatus('error');
        setExtensionMessage('No auth token found. Please log in again.');
        setExtensionSyncing(false);
        return;
      }

      const { sendTokenToExtension } = await import('@/lib/extension');
      const autoConnected = await sendTokenToExtension(token, user?.id);

      if (autoConnected) {
        await navigator.clipboard.writeText(token);
        setExtensionStatus('synced');
        setExtensionMessage('Connected automatically! Token copied to clipboard.');
        setExtensionSyncing(false);
        return;
      }

      await navigator.clipboard.writeText(token);
      setExtensionStatus('synced');
      setExtensionMessage('Token copied! Paste it in the extension popup.');
      setExtensionSyncing(false);
    } catch (error) {
      setExtensionStatus('error');
      setExtensionMessage('Failed to connect. Try manual copy.');
      setExtensionSyncing(false);
    }
  };

  // Webhook handlers
  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    setWebhookCreating(true);
    try {
      const webhook = await webhooksAPI.create({
        url: newWebhookUrl,
        name: newWebhookName || undefined,
        events: selectedEvents.length > 0 ? selectedEvents : ['*'],
      });
      setWebhooks([...webhooks, webhook]);
      setShowWebhookModal(false);
      setNewWebhookUrl('');
      setNewWebhookName('');
      setSelectedEvents([]);
    } catch (error) {
      toast.error('Failed to create webhook');
    } finally {
      setWebhookCreating(false);
    }
  };

  const handleDeleteWebhook = (id: number) => {
    setConfirmDialog({
      title: 'Delete webhook',
      message: 'Are you sure you want to delete this webhook?',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await webhooksAPI.delete(id);
          setWebhooks(webhooks.filter(w => w.id !== id));
        } catch (error) {
        }
      },
    });
  };

  const handleToggleWebhook = async (id: number, currentState: boolean) => {
    try {
      const updated = await webhooksAPI.toggle(id, !currentState);
      setWebhooks(webhooks.map(w => w.id === id ? updated : w));
    } catch (error) {
    }
  };

  const handleTestWebhook = async (id: number) => {
    setTestStatus({ ...testStatus, [id]: 'testing' });
    try {
      await webhooksAPI.test(id);
      setTestStatus({ ...testStatus, [id]: 'success' });
    } catch {
      setTestStatus({ ...testStatus, [id]: 'error' });
    }
    setTimeout(() => {
      setTestStatus(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 3000);
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter(e => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  return (
    <Skeleton name="settings-form" loading={loading} fallback={
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-9 w-32 bg-muted rounded-lg animate-pulse mb-8" />
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-background">

      <PageEntrance name="settings" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          <ProfileSection
            user={user}
            editingName={editingName}
            newName={newName}
            setNewName={setNewName}
            setEditingName={setEditingName}
            handleUpdateName={handleUpdateName}
          />

          <CalendarSection
            user={user}
            connectingCalendar={connectingCalendar}
            handleConnectCalendar={handleConnectCalendar}
            handleDisconnectCalendar={handleDisconnectCalendar}
          />

          <ExtensionSection
            extensionSyncing={extensionSyncing}
            extensionStatus={extensionStatus}
            extensionMessage={extensionMessage}
            handleSyncExtension={handleSyncExtension}
          />

          <DesktopAppSection />

          <WebhooksSection
            webhooks={webhooks}
            webhooksLoading={webhooksLoading}
            showWebhookModal={showWebhookModal}
            webhookCreating={webhookCreating}
            newWebhookUrl={newWebhookUrl}
            newWebhookName={newWebhookName}
            selectedEvents={selectedEvents}
            testStatus={testStatus}
            availableEvents={AVAILABLE_EVENTS}
            setShowWebhookModal={setShowWebhookModal}
            setNewWebhookUrl={setNewWebhookUrl}
            setNewWebhookName={setNewWebhookName}
            handleCreateWebhook={handleCreateWebhook}
            handleDeleteWebhook={handleDeleteWebhook}
            handleToggleWebhook={handleToggleWebhook}
            handleTestWebhook={handleTestWebhook}
            toggleEvent={toggleEvent}
          />

          <ApiKeysSection
            apiKeys={apiKeys}
            apiKeysLoading={apiKeysLoading}
            showApiKeyModal={showApiKeyModal}
            apiKeyCreating={apiKeyCreating}
            newApiKeyName={newApiKeyName}
            newKeySecret={newKeySecret}
            setShowApiKeyModal={setShowApiKeyModal}
            setNewApiKeyName={setNewApiKeyName}
            handleCreateApiKey={handleCreateApiKey}
            handleRevokeApiKey={handleRevokeApiKey}
            closeApiKeyModal={closeApiKeyModal}
          />
        </div>
      </PageEntrance>
        {confirmDialog && (
          <ConfirmDialog
            isOpen={!!confirmDialog}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            variant={confirmDialog.variant}
            onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>
    </Skeleton>
  );
}
