'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, Loader2, Trash2, CheckCircle2, XCircle, RefreshCw, Bell } from 'lucide-react';
import { webhooksAPI } from '@/lib/api';
import { toast } from 'sonner';

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
    { value: 'note.updated', label: 'Note Updated' },
    { value: 'note.deleted', label: 'Note Deleted' },
    { value: 'meeting.processed', label: 'Conversation Processed' },
    { value: 'daily_summary.generated', label: 'Daily Summary Generated' },
    { value: 'briefing.available', label: 'Briefing Available' },
];

export default function WebhooksCard() {

    const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newName, setNewName] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [testStatus, setTestStatus] = useState<Record<number, 'testing' | 'success' | 'error'>>({});

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            const data = await webhooksAPI.list();
            setWebhooks(data.webhooks || []);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newUrl.trim()) return;
        setCreating(true);
        try {
            const webhook = await webhooksAPI.create({
                url: newUrl,
                name: newName || undefined,
                events: selectedEvents.length > 0 ? selectedEvents : ['*'],
            });
            setWebhooks([...webhooks, webhook]);
            setShowModal(false);
            setNewUrl('');
            setNewName('');
            setSelectedEvents([]);
        } catch (error) {
            toast.error('Failed to create webhook');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this webhook?')) return;
        try {
            await webhooksAPI.delete(id);
            setWebhooks(webhooks.filter(w => w.id !== id));
        } catch (error) {
        }
    };

    const handleToggle = async (id: number, currentState: boolean) => {
        try {
            const updated = await webhooksAPI.toggle(id, !currentState);
            setWebhooks(webhooks.map(w => w.id === id ? updated : w));
        } catch (error) {
        }
    };

    const handleTest = async (id: number) => {
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
        <>
            <div className="bg-card rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Webhook className="w-5 h-5" />
                        Webhooks
                    </h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover text-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Webhook
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : webhooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p>No webhooks configured</p>
                        <p className="text-sm">Create one to receive real-time notifications</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {webhooks.map(webhook => (
                            <div key={webhook.id} className="p-4 rounded-lg bg-muted border border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{webhook.name || 'Unnamed Webhook'}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${webhook.is_active ? 'bg-primary/10 text-text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                {webhook.is_active ? 'Active' : 'Paused'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">{webhook.url}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Events: {webhook.events.includes('*') ? 'All' : webhook.events.join(', ')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTest(webhook.id)}
                                            disabled={testStatus[webhook.id] === 'testing'}
                                            className="p-2 text-muted-foreground hover:text-primary rounded"
                                            title="Test webhook"
                                        >
                                            {testStatus[webhook.id] === 'testing' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : testStatus[webhook.id] === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            ) : testStatus[webhook.id] === 'error' ? (
                                                <XCircle className="w-4 h-4 text-destructive" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleToggle(webhook.id, webhook.is_active)}
                                            className={`px-2 py-1 text-xs rounded ${webhook.is_active ? 'text-yellow-600 hover:bg-yellow-50' : 'text-primary hover:bg-primary/5'}`}
                                        >
                                            {webhook.is_active ? 'Pause' : 'Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(webhook.id)}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
                    <div className="bg-card rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
                        <h3 className="text-xl font-bold mb-4">Create Webhook</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Name (optional)</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-md"
                                    placeholder="My Webhook"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">URL *</label>
                                <input
                                    type="url"
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-md"
                                    placeholder="https://example.com/webhook"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Events</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_EVENTS.map(evt => (
                                        <button
                                            key={evt.value}
                                            type="button"
                                            onClick={() => toggleEvent(evt.value)}
                                            className={`px-2 py-1 text-xs rounded-full border ${selectedEvents.includes(evt.value)
                                                    ? 'bg-primary/10 border-primary/30 text-text-primary'
                                                    : 'bg-muted border-border text-muted-foreground'
                                                }`}
                                        >
                                            {evt.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Leave empty to subscribe to all events</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newUrl.trim() || creating}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
                            >
                                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
