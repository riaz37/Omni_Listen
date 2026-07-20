'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuth } from '@/lib/auth-context';
import { conversationsAPI, calendarAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Loader2, Download, Check, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { exportConversationToPDF } from '@/lib/export';
import { toast } from 'sonner';
import FloatingChat from '@/components/FloatingChat';
import { Skeleton } from 'boneyard-js/react';
import { ConversationKeyTakeaways } from './ConversationKeyTakeaways';
import { ConversationTranscript } from './ConversationTranscript';
import { ConversationSidebar } from './ConversationSidebar';
import PageEntrance from '@/components/ui/page-entrance';

// Backend placeholder (audio_processor.py) substituted when transcription returns
// no segments at all — e.g. a Deepgram silence result.
const NO_SPEECH_PLACEHOLDER = 'Transcription failed or no speech found.';

// True when the transcript has no actual spoken content — covers both the
// backend's placeholder string and a "successful" transcription of silence,
// which comes back as segment scaffolding ("[00:00 - 00:00] Speaker 1: ")
// wrapped around empty text.
export function hasNoSpeech(conversation: any): boolean {
    const transcript = conversation?.raw_transcript;
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) return true;
    if (transcript.trim() === NO_SPEECH_PLACEHOLDER) return true;
    const withoutScaffolding = transcript.replace(/\[\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\]\s*Speaker\s*\d+:/g, '');
    return !/\w/.test(withoutScaffolding);
}

export default function ConversationDetailClient() {
    const router = useRouter();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('id');

    const { user, loading, isLoggingOut } = useAuth();

    const [conversation, setConversation] = useState<any>(null);
    const [loadingConversation, setLoadingConversation] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isLoggingOut) {
            router.push(lp('/signin'));
        } else if (user && jobId) {
            loadConversation();
        }
    }, [user, loading, jobId, router, isLoggingOut]);

    const loadConversation = async () => {
        if (!jobId) return;
        setLoadingConversation(true);
        setLoadError(null);
        try {
            const data = await conversationsAPI.getConversationDetails(jobId);
            setConversation(data);
        } catch (error: any) {

            // Show specific error message
            if (error.response?.status === 404) {
                toast.error('Conversation not found');
                router.push(lp('/history'));
            } else {
                const errorMsg = error.response?.data?.detail || error.message || 'Failed to load conversation';
                toast.error(`Error loading conversation: ${errorMsg}`);
                setLoadError(errorMsg);
            }
        } finally {
            setLoadingConversation(false);
        }
    };

    const handleRetry = async () => {
        if (!jobId) return;
        setRetrying(true);
        try {
            await conversationsAPI.retryExtraction(jobId);
            const poll = setInterval(async () => {
                try {
                    const status = await conversationsAPI.getJobStatus(jobId);
                    if (status.status === 'completed') {
                        clearInterval(poll);
                        setRetrying(false);
                        toast.success('Extraction complete!');
                        await loadConversation();
                    } else if (status.status === 'failed') {
                        clearInterval(poll);
                        setRetrying(false);
                        toast.error('Retry failed: ' + (status.error || 'Unknown error'));
                    }
                } catch {
                    clearInterval(poll);
                    setRetrying(false);
                }
            }, 5000);
        } catch {
            setRetrying(false);
            toast.error('Failed to start retry. Please try again.');
        }
    };

    const handleSyncCalendar = async () => {
        if (!jobId) return;
        if (!user?.calendar_connected) {
            toast.error('Please connect your calendar in Settings first');
            return;
        }

        if (conversation?.calendar_synced) {
            toast.info('This conversation has already been synced to calendar');
            return;
        }

        setSyncing(true);
        try {
            await conversationsAPI.syncToCalendar(jobId);
            toast.success('Events synced to calendar successfully!');
            // Reload conversation to get updated sync status
            await loadConversation();
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to sync to calendar';

            // Check if token expired (401 status) - auto-trigger OAuth
            if (error.response?.status === 401) {
                try {
                    // Get OAuth URL from backend
                    const { authorization_url } = await calendarAPI.getAuthUrl();

                    // Open OAuth in popup window
                    const popup = window.open(
                        authorization_url,
                        'Google Calendar Authorization',
                        'width=600,height=700,left=200,top=100'
                    );

                    // Monitor popup for OAuth completion
                    const checkPopup = setInterval(() => {
                        if (popup?.closed) {
                            clearInterval(checkPopup);
                            // Reload page to get updated calendar connection status
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    }, 500);

                } catch (oauthError) {
                    toast.error('Unable to reconnect calendar. Please try from Settings.');
                }
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setSyncing(false);
        }
    };

    const handleToggleCompletion = async (noteId: number, currentCompleted: boolean) => {
        try {
            const newCompletedState = !currentCompleted;
            await conversationsAPI.toggleTaskCompletion(noteId, newCompletedState);

            // Update local state
            setConversation((prev: any) => ({
                ...prev,
                notes: prev.notes.map((note: any) =>
                    note.id === noteId ? { ...note, completed: newCompletedState } : note
                )
            }));

            if (newCompletedState) {
                toast.success('Note marked as completed');
            } else {
                toast.info('Note marked as incomplete');
            }
        } catch (error) {
            toast.error('Failed to update completion status');
        }
    };

    return (
        <Skeleton name="conversation-detail" loading={loading || loadingConversation} fallback={
            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="h-5 w-16 bg-muted rounded animate-pulse mb-4" />
                    <div className="mb-8">
                        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
                        <div className="h-4 w-40 bg-muted/60 rounded animate-pulse mt-2" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card rounded-xl border border-border p-6 h-48 animate-pulse" />
                            <div className="bg-card rounded-xl border border-border p-6 h-64 animate-pulse" />
                        </div>
                        <div className="bg-card rounded-xl border border-border p-6 h-80 animate-pulse" />
                    </div>
                </div>
            </div>
        }>
            {loadError ? (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="flex flex-col items-center text-center max-w-sm px-4">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
                        <h2 className="text-lg font-semibold text-foreground mb-1">{t('conversation.load_error_title')}</h2>
                        <p className="text-sm text-muted-foreground mb-6">{loadError}</p>
                        <Button onClick={loadConversation}>{t('conversation.load_error_action')}</Button>
                    </div>
                </div>
            ) : !conversation ? (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-muted-foreground">{t('conversation.not_found')}</p>
                </div>
            ) : (
            <div className="min-h-screen bg-background">
            <PageEntrance name="conversation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    <span>{t('conversation.back')}</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{conversation.title || t('conversation.default_title')}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{formatDate(conversation.created_at)}</p>
                        </div>
                        <div className="flex gap-3">
                            {(conversation?.failed_at_stage === 'extraction_failed' || conversation?.final_summary?.english === 'Error') && (
                                <Button
                                    onClick={handleRetry}
                                    disabled={retrying}
                                    loading={retrying}
                                    variant="outline"
                                    iconLeft={<RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />}
                                >
                                    {retrying ? 'Retrying...' : 'Retry Extraction'}
                                </Button>
                            )}
                            <Button
                                onClick={() => exportConversationToPDF(conversation)}
                                variant="secondary"
                                iconLeft={<Download className="w-4 h-4" />}
                                title={t('conversation.export_to_pdf')}
                            >
                                {t('conversation.download_pdf')}
                            </Button>
                            {conversation?.calendar_synced ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-text-primary rounded-lg border border-primary/30 text-sm">
                                    <Check className="w-4 h-4" />
                                    {t('conversation.synced_to_calendar')}
                                </div>
                            ) : (
                                <Button
                                    onClick={handleSyncCalendar}
                                    disabled={syncing || !user?.calendar_connected}
                                    loading={syncing}
                                    iconLeft={<Calendar className="w-4 h-4" />}
                                >
                                    {t('conversation.sync_to_calendar')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Takeaways / Summary — no-speech recordings get an explanatory
                            card instead of the silent blank space a truly empty summary leaves */}
                        {hasNoSpeech(conversation) ? (
                            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <h2 className="text-base font-semibold text-foreground mb-1">
                                        {t('conversation.no_speech_title')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {t('conversation.no_speech_description')}
                                    </p>
                                    <Button onClick={() => router.push(lp('/listen'))} size="sm">
                                        {t('conversation.no_speech_record_again')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            (conversation.key_takeaways || (conversation.final_summary && Object.keys(conversation.final_summary).length > 0 && conversation.final_summary.english !== 'Error')) && (
                                <ConversationKeyTakeaways
                                    summary={conversation.key_takeaways || conversation.final_summary}
                                />
                            )
                        )}

                        {/* Transcript — suppressed for no-speech recordings, since it would only show placeholder/empty scaffolding */}
                        {conversation.raw_transcript && !hasNoSpeech(conversation) && (
                            <ConversationTranscript
                                transcript={conversation.raw_transcript}
                                isExpanded={isTranscriptExpanded}
                                onToggleExpand={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                            />
                        )}

                        {/* Additional Analysis Result - Only show if user provided custom input */}
                        {conversation.user_input && conversation.user_input_result && (
                            <div className="bg-card rounded-lg border border-border p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    {t('conversation.key_takeaways_title')}
                                </h2>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border-s-4 border-blue-500 p-4 rounded">
                                    <p className="text-sm text-foreground mb-3 font-medium">
                                        {t('conversation.question_label')} {conversation.user_input}
                                    </p>
                                    <div className="text-foreground whitespace-pre-wrap">
                                        {conversation.user_input_result.content || conversation.user_input_result.description}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <ConversationSidebar
                        datedEvents={conversation.dated_events || []}
                        notes={conversation.notes || []}
                        onToggleCompletion={handleToggleCompletion}
                    />
                </div>
            </PageEntrance>
            {jobId && <FloatingChat jobId={jobId} />}
            </div>
            )}
        </Skeleton>
    );
}
