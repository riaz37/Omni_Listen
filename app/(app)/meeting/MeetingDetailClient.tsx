'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI, calendarAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import PrimaryButton from '@/components/PrimaryButton';
import { Calendar, FileText, Loader2, Download, Check, ArrowLeft } from 'lucide-react';
import { exportMeetingToPDF } from '@/lib/export';
import { useToast } from '@/components/Toast';
import FloatingChat from '@/components/FloatingChat';
import { Skeleton } from 'boneyard-js/react';
import { MeetingKeyTakeaways } from './MeetingKeyTakeaways';
import { MeetingTranscript } from './MeetingTranscript';
import { MeetingSidebar } from './MeetingSidebar';
import PageEntrance from '@/components/ui/page-entrance';

export default function MeetingDetailClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('id');

    const { user, loading, isLoggingOut } = useAuth();
    const toast = useToast();
    const [meeting, setMeeting] = useState<any>(null);
    const [loadingMeeting, setLoadingMeeting] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

    useEffect(() => {
        if (!loading && !user && !isLoggingOut) {
            router.push('/signin');
        } else if (user && jobId) {
            loadMeeting();
        }
    }, [user, loading, jobId, router, isLoggingOut]);

    const loadMeeting = async () => {
        if (!jobId) return;
        try {
            const data = await meetingsAPI.getMeetingDetails(jobId);
            setMeeting(data);
        } catch (error: any) {

            // Show specific error message
            if (error.response?.status === 404) {
                toast.error('Meeting not found');
                router.push('/history');
            } else {
                const errorMsg = error.response?.data?.detail || error.message || 'Failed to load meeting';
                toast.error(`Error loading meeting: ${errorMsg}`);
            }
        } finally {
            setLoadingMeeting(false);
        }
    };

    const handleSyncCalendar = async () => {
        if (!jobId) return;
        if (!user?.calendar_connected) {
            toast.error('Please connect your calendar in Settings first');
            return;
        }

        if (meeting?.calendar_synced) {
            toast.info('This meeting has already been synced to calendar');
            return;
        }

        setSyncing(true);
        try {
            await meetingsAPI.syncToCalendar(jobId);
            toast.success('Events synced to calendar successfully!');
            // Reload meeting to get updated sync status
            await loadMeeting();
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
            await meetingsAPI.toggleTaskCompletion(noteId, newCompletedState);

            // Update local state
            setMeeting((prev: any) => ({
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

    if (!meeting && !loading && !loadingMeeting) {
        return null;
    }

    return (
        <Skeleton name="meeting-detail" loading={loading || loadingMeeting} fallback={
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
            {!meeting ? (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <p className="text-muted-foreground">Meeting not found.</p>
                </div>
            ) : (
            <div className="min-h-screen bg-background">
            <PageEntrance name="meeting" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{meeting.title || 'Meeting Analysis'}</h1>
                            <p className="text-sm text-muted-foreground mt-1">{formatDate(meeting.created_at)}</p>
                        </div>
                        <div className="flex gap-3">
                            <PrimaryButton
                                onClick={() => exportMeetingToPDF(meeting)}
                                variant="secondary"
                                icon={Download}
                                title="Export to PDF"
                            >
                                Download Pdf
                            </PrimaryButton>
                            {meeting?.calendar_synced ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-text-primary rounded-lg border border-primary/30 text-sm">
                                    <Check className="w-4 h-4" />
                                    Synced to Calendar
                                </div>
                            ) : (
                                <PrimaryButton
                                    onClick={handleSyncCalendar}
                                    disabled={syncing || !user?.calendar_connected}
                                    loading={syncing}
                                    icon={Calendar}
                                >
                                    Sync to Calendar
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Takeaways / Summary */}
                        {(meeting.key_takeaways || meeting.final_summary) && (
                            <MeetingKeyTakeaways
                                summary={meeting.key_takeaways || meeting.final_summary}
                            />
                        )}

                        {/* Transcript */}
                        {meeting.raw_transcript && (
                            <MeetingTranscript
                                transcript={meeting.raw_transcript}
                                isExpanded={isTranscriptExpanded}
                                onToggleExpand={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                            />
                        )}

                        {/* Additional Analysis Result - Only show if user provided custom input */}
                        {meeting.user_input && meeting.user_input_result && (
                            <div className="bg-card rounded-lg border border-border p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Key Takeaways
                                </h2>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                                    <p className="text-sm text-foreground mb-3 font-medium">
                                        Question: {meeting.user_input}
                                    </p>
                                    <div className="text-foreground whitespace-pre-wrap">
                                        {meeting.user_input_result.content || meeting.user_input_result.description}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <MeetingSidebar
                        datedEvents={meeting.dated_events || []}
                        notes={meeting.notes || []}
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
