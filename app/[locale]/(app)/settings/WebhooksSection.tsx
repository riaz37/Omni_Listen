'use client';

import { useState, useEffect } from 'react';
import {
  Webhook, Plus, Loader2, Bell, CheckCircle2, XCircle,
  RefreshCw, Trash2, ChevronDown, Info, Copy, Check,
  ArrowRight, Zap, FileText, MessageSquare, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { webhooksAPI } from '@/lib/api';
import { SettingsSection } from './SettingsSection';
import { useConfirmDialog } from './ConfirmDialogContext';
import { AVAILABLE_EVENTS, type WebhookData } from './types';
import { useTranslation } from '@/lib/i18n/use-translation';

export function WebhooksSection() {
  const { confirm } = useConfirmDialog();
  const { t } = useTranslation();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<Record<number, 'testing' | 'success' | 'error'>>({});
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const data = await webhooksAPI.list();
      const list = Array.isArray(data) ? data : (data.webhooks || []);
      setWebhooks(list);
    } catch {
      // silent
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
      setWebhooks(prev => [...prev, webhook]);
      closeModal();
    } catch {
      toast.error('Failed to create webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: number) => {
    confirm({
      title: 'Delete webhook',
      message: 'Are you sure you want to delete this webhook?',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await webhooksAPI.delete(id);
          setWebhooks(prev => prev.filter(w => w.id !== id));
        } catch {
          // silent
        }
      },
    });
  };

  const handleToggle = async (id: number, currentState: boolean) => {
    try {
      const updated = await webhooksAPI.toggle(id, !currentState);
      setWebhooks(prev => prev.map(w => w.id === id ? updated : w));
    } catch {
      // silent
    }
  };

  const handleTest = async (id: number) => {
    setTestStatus(prev => ({ ...prev, [id]: 'testing' }));
    try {
      await webhooksAPI.test(id);
      setTestStatus(prev => ({ ...prev, [id]: 'success' }));
    } catch {
      setTestStatus(prev => ({ ...prev, [id]: 'error' }));
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
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewUrl('');
    setNewName('');
    setSelectedEvents([]);
  };

  return (
    <>
      <SettingsSection
        id="webhooks"
        icon={<Webhook className="w-5 h-5" />}
        title={t('settings.webhooks.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setDocsOpen(true)}>
              <BookOpen className="w-3.5 h-3.5" />
              {t('settings.webhooks.docs')}
            </Button>
            <Button onClick={() => setModalOpen(true)} iconLeft={<Plus className="w-4 h-4" />} size="sm">
              {t('settings.webhooks.add')}
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t('settings.webhooks.empty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{webhook.name || t('settings.webhooks.unnamed')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        webhook.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {webhook.is_active ? t('settings.webhooks.status_active') : t('settings.webhooks.status_paused')}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-mono">{webhook.url}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {webhook.events.map(evt => (
                        <span key={evt} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs border border-primary/20 font-medium">
                          {evt === '*' ? t('settings.webhooks.all_events') : evt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ms-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTest(webhook.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {testStatus[webhook.id] === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        testStatus[webhook.id] === 'success' ? <CheckCircle2 className="w-4 h-4 text-primary" /> :
                        testStatus[webhook.id] === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> :
                        <RefreshCw className="w-4 h-4" />}
                    </Button>
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={() => handleToggle(webhook.id, webhook.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Integration Guide — side sheet */}
      <WebhookGuideSheet open={docsOpen} onOpenChange={setDocsOpen} />

      {/* Create Webhook Dialog */}
      <MotionDialog open={modalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.webhooks.create_title')}</DialogTitle>
            <DialogDescription>{t('settings.webhooks.create_desc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-name">{t('settings.webhooks.label_name')}</Label>
              <Input
                id="webhook-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t('settings.webhooks.placeholder_name')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="webhook-url">{t('settings.webhooks.label_url')}</Label>
              <Input
                id="webhook-url"
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label>{t('settings.webhooks.label_events')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_EVENTS.map(evt => (
                  <button
                    key={evt.value}
                    type="button"
                    onClick={() => toggleEvent(evt.value)}
                    className={`px-2.5 py-1 text-xs rounded-full border font-medium transition-colors ${
                      selectedEvents.includes(evt.value)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted border-border text-muted-foreground hover:border-foreground/20'
                    }`}
                  >
                    {evt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>{t('common.cancel')}</Button>
            <Button
              onClick={handleCreate}
              disabled={!newUrl.trim() || creating}
              loading={creating}
            >
              {t('settings.webhooks.create_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </MotionDialog>
    </>
  );
}

/* ─── Webhook Integration Guide (Sheet) ────────────────────��────────────── */

const SETUP_STEPS = [
  { titleKey: 'settings.webhooks.step1_title', descKey: 'settings.webhooks.step1_desc' },
  { titleKey: 'settings.webhooks.step2_title', descKey: 'settings.webhooks.step2_desc' },
  { titleKey: 'settings.webhooks.step3_title', descKey: 'settings.webhooks.step3_desc' },
  { titleKey: 'settings.webhooks.step4_title', descKey: 'settings.webhooks.step4_desc' },
];

interface EventDef {
  name: string;
  descKey: string;
  fields: string[];
  example: string;
}

const EVENT_TABS = [
  {
    id: 'meetings',
    labelKey: 'settings.webhooks.tab_meetings',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    events: [
      {
        name: 'meeting.processed',
        descKey: 'settings.webhooks.event_meeting_processed',
        fields: ['job_id', 'title', 'transcript', 'summary', 'events_count', 'notes_count', 'processing_time_seconds', 'audio_duration_seconds'],
        example: JSON.stringify({
          event_type: 'meeting.processed',
          data: {
            job_id: 'user1_20260407_recording.webm',
            title: 'Design Review',
            transcript: '[00:00 - 00:30] Speaker A: ...',
            summary: { english: '...', arabic: '...' },
            events_count: 3,
            notes_count: 2,
            processing_time_seconds: 11,
          },
        }, null, 2),
      },
    ] satisfies EventDef[],
  },
  {
    id: 'tasks',
    labelKey: 'settings.webhooks.tab_tasks',
    icon: <Zap className="w-3.5 h-3.5" />,
    events: [
      {
        name: 'task.created',
        descKey: 'settings.webhooks.event_task_created',
        fields: ['event_id', 'title', 'description', 'date', 'urgency', 'completed', 'synced'],
        example: JSON.stringify({
          event_type: 'task.created',
          data: {
            event_id: 53,
            title: 'Review budget proposal',
            description: 'Review and approve Q2 budget',
            date: '2026-04-09',
            urgency: 'no',
            completed: false,
            synced: false,
          },
        }, null, 2),
      },
      {
        name: 'event.completed',
        descKey: 'settings.webhooks.event_event_completed',
        fields: ['event_id', 'completed', 'title', 'description', 'category', 'urgency'],
        example: JSON.stringify({
          event_type: 'event.completed',
          data: { event_id: 5, completed: true, title: 'Send budget update', category: 'GENERAL', urgency: 'no' },
        }, null, 2),
      },
      {
        name: 'event.updated',
        descKey: 'settings.webhooks.event_event_updated',
        fields: ['event_id', 'title', 'description', 'date', 'category', 'urgency'],
        example: JSON.stringify({
          event_type: 'event.updated',
          data: { event_id: 5, title: 'Send budget update', date: '2026-04-10', category: 'GENERAL', urgency: 'yes' },
        }, null, 2),
      },
      {
        name: 'event.deleted',
        descKey: 'settings.webhooks.event_event_deleted',
        fields: ['event_id', 'title', 'date', 'assignee', 'description', 'urgency'],
        example: JSON.stringify({
          event_type: 'event.deleted',
          data: { event_id: 12, title: 'Send Budget Update', date: '2026-02-06', assignee: 'Sarah', urgency: 'no' },
        }, null, 2),
      },
    ] satisfies EventDef[],
  },
  {
    id: 'notes',
    labelKey: 'settings.webhooks.tab_notes',
    icon: <FileText className="w-3.5 h-3.5" />,
    events: [
      {
        name: 'note.created',
        descKey: 'settings.webhooks.event_note_created',
        fields: ['note_id', 'meeting_id', 'category', 'title', 'description', 'manual'],
        example: JSON.stringify({
          event_type: 'note.created',
          data: {
            note_id: 62,
            meeting_id: 'user1_20260407_recording.webm',
            category: 'GENERAL',
            title: 'Design decisions',
            description: 'Agreed on component library',
            manual: true,
          },
        }, null, 2),
      },
      {
        name: 'note.deleted',
        descKey: 'settings.webhooks.event_note_deleted',
        fields: ['note_id', 'category', 'title', 'description', 'urgency'],
        example: JSON.stringify({
          event_type: 'note.deleted',
          data: { note_id: 16, category: 'DECISION', title: 'Parallel Task Execution', description: 'Team decided to run tasks in parallel', urgency: 'no' },
        }, null, 2),
      },
    ] satisfies EventDef[],
  },
];

function WebhookGuideSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);

  const copyToClipboard = (text: string, eventName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEvent(eventName);
    setTimeout(() => setCopiedEvent(null), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            {t('settings.webhooks.guide_title')}
          </SheetTitle>
          <SheetDescription>
            {t('settings.webhooks.guide_desc')}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Payload format — top callout */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-lg p-3">
            <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0 rtl:rotate-180" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('settings.webhooks.payload_note_pre')} <span className="font-medium text-foreground">POST JSON</span> {t('settings.webhooks.payload_note_post')}{' '}
              <code className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">event_id</code>{' '}
              <code className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">event_type</code>{' '}
              <code className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">created_at</code>{' '}
              <code className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">data</code>.{' '}
              {t('settings.webhooks.payload_respond')} <span className="font-medium text-foreground">2xx {t('settings.webhooks.payload_within')}</span>.
            </p>
          </div>

          {/* Visual stepper */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.webhooks.setup_title')}</h3>
            <div className="space-y-2">
              {SETUP_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(step.titleKey)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(step.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Tabbed event reference */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('settings.webhooks.event_ref_title')}</h3>

            <Tabs defaultValue="meetings">
              <TabsList className="w-full">
                {EVENT_TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 flex-1">
                    {tab.icon}
                    <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                    <span className="sm:hidden">{t(tab.labelKey).split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {EVENT_TABS.map(tab => (
                <TabsContent key={tab.id} value={tab.id} className="mt-3 space-y-3">
                  {tab.events.map(event => (
                    <EventCard
                      key={event.name}
                      event={event}
                      copiedEvent={copiedEvent}
                      onCopy={copyToClipboard}
                    />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Event Card (improved layout) ──────────────────────────────────────── */

function EventCard({
  event,
  copiedEvent,
  onCopy,
}: {
  event: EventDef;
  copiedEvent: string | null;
  onCopy: (text: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header — name on top, description below */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-start px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <code className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono font-medium">
            {event.name}
          </code>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${expanded ? 'rotate-180' : ''}`} />
        </div>
        <p className="text-sm text-muted-foreground">{t(event.descKey)}</p>

        {/* Always-visible field pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {event.fields.map(field => (
            <span key={field} className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono text-muted-foreground">
              {field}
            </span>
          ))}
        </div>
      </button>

      {/* Expanded: code block */}
      {expanded && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">{t('settings.webhooks.example_payload')}</span>
            <button
              onClick={() => onCopy(event.example, event.name)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
            >
              {copiedEvent === event.name
                ? <><Check className="w-3 h-3 text-primary" /> {t('settings.webhooks.copied')}</>
                : <><Copy className="w-3 h-3" /> {t('settings.webhooks.copy')}</>}
            </button>
          </div>
          <div className="bg-[#0a0a0a] dark:bg-muted/30 overflow-x-auto">
            <pre className="p-4 text-xs font-mono text-[#a1a1aa] dark:text-muted-foreground leading-relaxed">
              {event.example}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
