'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { calendarAPI, authAPI, webhooksAPI, apiKeysAPI } from '@/lib/api';
import { Calendar, Loader2, Check, X, Edit2, Chrome, AlertCircle, CheckCircle2, Webhook, Key, Plus, Trash2, RefreshCw, XCircle, Bell, Monitor, Download } from 'lucide-react';

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
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
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

  // API Keys State - Restoring incrementally
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [apiKeyCreating, setApiKeyCreating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);

  // Load webhooks on mount
  useEffect(() => {
    loadWebhooks();
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const data = await apiKeysAPI.list();
      // Handle both formats (array or object with keys property)
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
      setNewKeySecret(data.key); // Current secret to show once
      await loadApiKeys();
      setNewApiKeyName('');
      // Don't close modal yet, we need to show the secret!
    } catch (error) {
    } finally {
      setApiKeyCreating(false);
    }
  };

  const handleRevokeApiKey = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;

    try {
      await apiKeysAPI.revoke(id);
      await loadApiKeys();
    } catch (error) {
    }
  };

  const closeApiKeyModal = () => {
    setShowApiKeyModal(false);
    setNewApiKeyName('');
    setNewKeySecret(null);
  };


  const loadWebhooks = async () => {
    try {
      const data = await webhooksAPI.list();
      // Backend returns a list directly, or an object with webhooks property depending on the version
      const webhookList = Array.isArray(data) ? data : (data.webhooks || []);
      setWebhooks(webhookList);
    } catch (error) {
    } finally {
      setWebhooksLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Handle calendar OAuth callback
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
      alert('Failed to connect calendar');
      setConnectingCalendar(false);
    }
  };

  const handleCalendarCallback = async (code: string, state: string) => {
    try {
      await calendarAPI.handleCallback(code, state);
      await refreshUser();
      // Clean up URL
      window.history.replaceState({}, document.title, '/settings');
      alert('Calendar connected successfully!');
    } catch (error) {
      alert('Failed to connect calendar');
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect your calendar?')) return;

    try {
      await calendarAPI.disconnect();
      await refreshUser();
      alert('Calendar disconnected');
    } catch (error) {
      alert('Failed to disconnect calendar');
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }

    try {
      await authAPI.updateProfile(newName);
      await refreshUser();
      setEditingName(false);
      setNewName('');
    } catch (error) {
      alert('Failed to update name');
    }
  };

  const handleSyncExtension = async () => {
    setExtensionSyncing(true);
    setExtensionMessage('');
    setExtensionStatus('unknown');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        setExtensionStatus('error');
        setExtensionMessage('No auth token found. Please log in again.');
        setExtensionSyncing(false);
        return;
      }

      // Try auto-connection first
      // Dynamic import to avoid SSR issues if any, though regular import is fine here since it's a client component
      const { sendTokenToExtension } = await import('@/lib/extension');
      const autoConnected = await sendTokenToExtension(token, user?.id);

      if (autoConnected) {
        await navigator.clipboard.writeText(token);
        setExtensionStatus('synced');
        setExtensionMessage('Connected automatically! Token copied to clipboard.');
        setExtensionSyncing(false);
        return;
      }

      // Fallback: Copy token to clipboard
      await navigator.clipboard.writeText(token);
      setExtensionStatus('synced'); // We show green but with a different message
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
      alert('Failed to create webhook');
    } finally {
      setWebhookCreating(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await webhooksAPI.delete(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (error) {
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1">
                {editingName ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md"
                      placeholder="Enter new name"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateName}
                        className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-hover text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewName('');
                        }}
                        className="px-3 py-1 border border-border text-foreground rounded-md hover:bg-muted text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-foreground">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingName(true);
                        setNewName(user?.name || '');
                      }}
                      className="px-3 py-1.5 bg-muted hover:bg-muted rounded-md flex items-center gap-2 text-sm text-foreground transition-colors"
                      title="Edit name"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Calendar */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Google Calendar Integration
            </h2>

            {user?.calendar_connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-3 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Calendar Connected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Meeting events will be automatically synced to your Google Calendar when you enable "Calendar Sync" in the output fields.
                </p>
                <button
                  onClick={handleDisconnectCalendar}
                  className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Disconnect Calendar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg">
                  <X className="w-5 h-5" />
                  <span className="font-medium">Calendar Not Connected</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Calendar to automatically create events from meeting
                  action items when you enable "Calendar Sync" in the output fields.
                </p>
                <button
                  onClick={handleConnectCalendar}
                  disabled={connectingCalendar}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                >
                  {connectingCalendar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Connect Google Calendar'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Chrome Extension */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Chrome className="w-5 h-5" />
              Meeting Recorder Extension
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Install our Edge extension to record Zoom, Google Meet, and Microsoft Teams
                meetings directly from your browser. The recordings will be automatically
                transcribed using your preset settings.
              </p>

              <div className="bg-muted border border-border rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">How to connect:</h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                  <li>
                    <a
                      href="https://microsoftedge.microsoft.com/addons/detail/esapailisten/edipmfpeajaajboenhdlcebebgapimgl?hl=en-US"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary hover:underline"
                    >
                      Install the ESAP Meeting Recorder from Edge Webstore
                    </a>
                  </li>
                  <li>Click "Copy Auth Token" below</li>
                  <li>Open the extension and paste the token in settings</li>
                </ol>
              </div>

              {extensionMessage && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${extensionStatus === 'synced' ? 'text-primary bg-primary/5' :
                  extensionStatus === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
                    'text-muted-foreground bg-muted'
                  }`}>
                  {extensionStatus === 'synced' ? <CheckCircle2 className="w-5 h-5" /> :
                    extensionStatus === 'error' ? <AlertCircle className="w-5 h-5" /> : null}
                  <span className="font-medium">{extensionMessage}</span>
                </div>
              )}

              <button
                onClick={handleSyncExtension}
                disabled={extensionSyncing}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {extensionSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-4 h-4" />
                    Connect Extension
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop App */}
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Desktop Application
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get the full experience with our dedicated desktop application. Record meetings,
                access your dashboard, and more without opening a browser.
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://drive.google.com/file/d/1V_z19U0EcrcjAvs89mjHNadClQaG8xvo/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors flex items-center gap-2 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download for Windows
                </a>
                <span className="text-xs text-muted-foreground">
                  Version 1.0.0 • Windows 10/11
                </span>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhooks
              </h2>
              <button onClick={() => setShowWebhookModal(true)} className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-hover text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Webhook
              </button>
            </div>
            {webhooksLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No webhooks configured</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="p-4 rounded-lg bg-muted border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{webhook.name || 'Unnamed'}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${webhook.is_active ? 'bg-primary/10 text-text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {webhook.is_active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{webhook.url}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {webhook.events.map(evt => (
                            <span key={evt} className="px-1.5 py-0.5 bg-primary/5 text-text-primary rounded text-[10px] border border-primary/10 font-medium">
                              {evt === '*' ? 'All Events' : evt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleTestWebhook(webhook.id)} className="p-2 text-muted-foreground hover:text-primary">
                          {testStatus[webhook.id] === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            testStatus[webhook.id] === 'success' ? <CheckCircle2 className="w-4 h-4 text-primary" /> :
                              testStatus[webhook.id] === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> : <RefreshCw className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleToggleWebhook(webhook.id, webhook.is_active)} className={`px-2 py-1 text-xs rounded ${webhook.is_active ? 'text-yellow-600' : 'text-primary'}`}>
                          {webhook.is_active ? 'Pause' : 'Enable'}
                        </button>
                        <button onClick={() => handleDeleteWebhook(webhook.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API Keys
              </h2>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary-hover flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Key
              </button>
            </div>

            {apiKeysLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 bg-muted rounded-lg border border-dashed border-border">
                <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No API keys found.</p>
                <p className="text-sm text-muted-foreground">Create a key to access the API programmatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className="p-4 border rounded-lg hover:shadow-sm transition-all flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{key.name || 'Unnamed Key'}</div>
                      <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block w-fit text-muted-foreground font-mono">
                        {key.key_prefix}...
                      </code>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      <button onClick={() => handleRevokeApiKey(key.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded hover:scale-105 transition-transform" title="Revoke Key">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                {newKeySecret ? 'API Key Created' : 'Create API Key'}
              </h3>
              <button onClick={closeApiKeyModal} className="text-muted-foreground hover:text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {newKeySecret ? (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-success">Key generated successfully!</h4>
                      <p className="text-sm text-text-primary mt-1">
                        Copy this key now. You won't be able to see it again!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md border font-mono text-sm break-all flex items-center justify-between gap-2">
                  <span>{newKeySecret}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newKeySecret);
                    }}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-card rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={closeApiKeyModal} className="px-4 py-2 bg-foreground text-white rounded-md hover:bg-foreground/90">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newApiKeyName}
                    onChange={e => setNewApiKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. My Script"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={closeApiKeyModal} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
                  <button
                    onClick={handleCreateApiKey}
                    disabled={!newApiKeyName.trim() || apiKeyCreating}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
                  >
                    {apiKeyCreating && <Loader2 className="w-4 h-4 animate-spin" />} Create Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
            <h3 className="text-xl font-bold mb-4">Create Webhook</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name (optional)</label>
                <input type="text" value={newWebhookName} onChange={e => setNewWebhookName(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md" placeholder="My Webhook" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL *</label>
                <input type="url" value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md" placeholder="https://example.com/webhook" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Events</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_EVENTS.map(evt => (
                    <button key={evt.value} type="button" onClick={() => toggleEvent(evt.value)} className={`px-2 py-1 text-xs rounded-full border ${selectedEvents.includes(evt.value) ? 'bg-primary/10 border-primary/30 text-text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                      {evt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
              <button onClick={handleCreateWebhook} disabled={!newWebhookUrl.trim() || webhookCreating} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
                {webhookCreating && <Loader2 className="w-4 h-4 animate-spin" />} Create
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
