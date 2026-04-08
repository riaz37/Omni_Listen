'use client';

import { Webhook, Plus, Loader2, Bell, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebhookData {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface AvailableEvent {
  value: string;
  label: string;
}

interface WebhooksSectionProps {
  webhooks: WebhookData[];
  webhooksLoading: boolean;
  showWebhookModal: boolean;
  webhookCreating: boolean;
  newWebhookUrl: string;
  newWebhookName: string;
  selectedEvents: string[];
  testStatus: Record<number, 'testing' | 'success' | 'error'>;
  availableEvents: AvailableEvent[];
  setShowWebhookModal: (show: boolean) => void;
  setNewWebhookUrl: (url: string) => void;
  setNewWebhookName: (name: string) => void;
  handleCreateWebhook: () => void;
  handleDeleteWebhook: (id: number) => void;
  handleToggleWebhook: (id: number, currentState: boolean) => void;
  handleTestWebhook: (id: number) => void;
  toggleEvent: (event: string) => void;
}

export function WebhooksSection({
  webhooks,
  webhooksLoading,
  showWebhookModal,
  webhookCreating,
  newWebhookUrl,
  newWebhookName,
  selectedEvents,
  testStatus,
  availableEvents,
  setShowWebhookModal,
  setNewWebhookUrl,
  setNewWebhookName,
  handleCreateWebhook,
  handleDeleteWebhook,
  handleToggleWebhook,
  handleTestWebhook,
  toggleEvent,
}: WebhooksSectionProps) {
  return (
    <>
      <div className="bg-card rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Webhooks
          </h2>
          <Button onClick={() => setShowWebhookModal(true)} iconLeft={<Plus className="w-4 h-4" />} size="sm">
            Add Webhook
          </Button>
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
                  {availableEvents.map(evt => (
                    <button key={evt.value} type="button" onClick={() => toggleEvent(evt.value)} className={`px-2 py-1 text-xs rounded-full border ${selectedEvents.includes(evt.value) ? 'bg-primary/10 border-primary/30 text-text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                      {evt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md">Cancel</button>
              <Button
                onClick={handleCreateWebhook}
                disabled={!newWebhookUrl.trim() || webhookCreating}
                loading={webhookCreating}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
