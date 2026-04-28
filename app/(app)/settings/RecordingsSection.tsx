'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Download, RotateCcw, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SettingsSection } from './SettingsSection';
import { useConfirmDialog } from './ConfirmDialogContext';
import type { RecordingEntry, RecordingStatus } from './types';
import * as vault from '@/lib/recording-vault';
import { downloadBlob } from '@/lib/download-blob';
import { useGlobalState } from '@/lib/global-state-context';

const STATUS_STYLES: Record<RecordingStatus, string> = {
    processed: 'bg-primary/10 text-primary',
    failed: 'bg-red-500/10 text-red-500',
    stopped: 'bg-amber-500/10 text-amber-500',
    recording: 'bg-blue-500/10 text-blue-500',
};

const STATUS_LABELS: Record<RecordingStatus, string> = {
    processed: 'Processed',
    failed: 'Failed',
    stopped: 'Saved',
    recording: 'In Progress',
};

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

interface RecordingRowProps {
    recording: RecordingEntry;
    onDownload: (r: RecordingEntry) => void;
    onRetry: (r: RecordingEntry) => void;
    onDelete: (r: RecordingEntry) => void;
}

function RecordingRow({ recording: r, onDownload, onRetry, onDelete }: RecordingRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3 min-w-0">
                <Mic className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.fileName}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                        {formatDuration(r.duration)}&nbsp;&middot;&nbsp;{formatDate(r.startedAt)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <span
                    className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        STATUS_STYLES[r.status],
                    )}
                >
                    {STATUS_LABELS[r.status]}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Download"
                    onClick={() => onDownload(r)}
                >
                    <Download className="w-4 h-4" />
                </Button>
                {(r.status === 'failed' || r.status === 'stopped') && (
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Retry processing"
                        onClick={() => onRetry(r)}
                    >
                        <RotateCcw className="w-4 h-4 text-primary" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    title="Delete"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => onDelete(r)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export function RecordingsSection() {
    const router = useRouter();
    const { confirm } = useConfirmDialog();
    const { activateRecovery } = useGlobalState();

    const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const load = useCallback(async () => {
        try {
            const list = await vault.listRecordings();
            setRecordings(list);
        } catch {
            // IndexedDB unavailable — silent
        } finally {
            setLoading(false);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { load(); }, [load]);

    const handleDownload = async (r: RecordingEntry) => {
        if (r.status === 'processed') {
            toast.info(
                `This recording was saved to your Downloads folder on ${formatDate(r.startedAt)}.`,
            );
            return;
        }
        if (r.status === 'recording') {
            toast.info('This recording is still in progress.');
            return;
        }
        try {
            const blob = await vault.assembleBlob(r.id);
            downloadBlob(blob, r.fileName);
        } catch {
            toast.error('Could not assemble the recording. Chunks may have been cleared.');
        }
    };

    const handleRetry = (r: RecordingEntry) => {
        activateRecovery(r);
        router.push('/listen');
    };

    const handleDelete = (r: RecordingEntry) => {
        confirm({
            title: 'Delete recording',
            message: `Delete "${r.fileName}"? This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                await vault.deleteRecording(r.id).catch(() => {});
                await load();
            },
        });
    };

    const toggleLabel = isExpanded
        ? 'Collapse'
        : `Show ${recordings.length} recording${recordings.length !== 1 ? 's' : ''}`;

    return (
        <SettingsSection
            id="recordings"
            icon={<Mic className="w-5 h-5 text-primary" />}
            title="Recordings"
            description="Audio files saved to your device during recording sessions."
            action={
                !loading && recordings.length > 0 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded((v) => !v)}
                        className="gap-1.5"
                    >
                        {toggleLabel}
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </Button>
                ) : undefined
            }
        >
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : recordings.length === 0 ? (
                <div className="text-center py-8 bg-muted/50 rounded-lg border border-dashed border-border">
                    <Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No recordings yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Recordings will appear here after your first session.
                    </p>
                </div>
            ) : isExpanded ? (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {recordings.map((r) => (
                        <RecordingRow
                            key={r.id}
                            recording={r}
                            onDownload={handleDownload}
                            onRetry={handleRetry}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {recordings.length} recording{recordings.length !== 1 ? 's' : ''} saved locally.
                    Use the button above to view them.
                </p>
            )}
        </SettingsSection>
    );
}
