'use client';

import { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Bell, Globe } from 'lucide-react';
import { webhooksAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ConfirmDialog';

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
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

    const executeDelete = async (id: number) => {
        try {
            await webhooksAPI.delete(id);
            setWebhooks(webhooks.filter(w => w.id !== id));
            toast.success('Webhook deleted');
        } catch (error) {
            toast.error('Failed to delete webhook');
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
                    <Button
                        onClick={() => setShowModal(true)}
                        size="sm"
                        iconLeft={<Plus className="w-4 h-4" />}
                    >
                        Add Webhook
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
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
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleTest(webhook.id)}
                                            disabled={testStatus[webhook.id] === 'testing'}
                                            title="Test webhook"
                                        >
                                            {testStatus[webhook.id] === 'testing' ? (
                                                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                                            ) : testStatus[webhook.id] === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            ) : testStatus[webhook.id] === 'error' ? (
                                                <XCircle className="w-4 h-4 text-destructive" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggle(webhook.id, webhook.is_active)}
                                            className={webhook.is_active ? 'text-yellow-600' : 'text-primary'}
                                        >
                                            {webhook.is_active ? 'Pause' : 'Enable'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteConfirm(webhook.id)}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Webhook Modal */}
            <MotionDialog open={showModal} onOpenChange={(open) => { if (!open) setShowModal(false); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>Set up a webhook to receive real-time event notifications</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-1">
                        <div className="space-y-2">
                            <Label htmlFor="webhook-name" className="flex items-center gap-1.5">
                                <Webhook className="w-3.5 h-3.5 text-muted-foreground" />
                                Name
                                <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="webhook-name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="My Webhook"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="webhook-url" className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="webhook-url"
                                type="url"
                                value={newUrl}
                                onChange={e => setNewUrl(e.target.value)}
                                placeholder="https://example.com/webhook"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Events</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_EVENTS.map(evt => (
                                    <button
                                        key={evt.value}
                                        type="button"
                                        onClick={() => toggleEvent(evt.value)}
                                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedEvents.includes(evt.value)
                                                ? 'bg-primary/10 border-primary/30 text-text-primary'
                                                : 'bg-muted border-border text-muted-foreground hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        {evt.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Leave empty to subscribe to all events</p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newUrl.trim() || creating}
                            loading={creating}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </MotionDialog>

            {/* Delete Confirmation */}
            {deleteConfirm !== null && (
                <ConfirmDialog
                    isOpen
                    title="Delete Webhook"
                    message="Are you sure you want to delete this webhook? This action cannot be undone."
                    confirmLabel="Delete"
                    variant="danger"
                    onConfirm={() => {
                        executeDelete(deleteConfirm);
                        setDeleteConfirm(null);
                    }}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </>
    );
}
