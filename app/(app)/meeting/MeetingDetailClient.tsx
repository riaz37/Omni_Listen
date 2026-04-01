'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { meetingsAPI, calendarAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { detectUrgency, getUrgencyStyles } from '@/lib/urgency-detector';
import { Calendar, FileText, CheckCircle, AlertCircle, Loader2, Download, Check, FileDown, Circle, CheckCircle2, ArrowLeft, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { exportMeetingToPDF } from '@/lib/export';
import { useToast } from '@/components/Toast';
import FloatingChat from '@/components/FloatingChat';

// Helper function to highlight important keywords in text
const getLineStyle = (text: string) => {
    const categories = [
        {
            id: 'urgent',
            // Added: عاجل (Urgent), ضروري (Necessary), طارئ (Emergency), فورا (Immediately)
            patterns: ['URGENT:', 'عاجل'],
            className: 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-900 dark:text-red-200',

        }
    ];

    // Combine English and Arabic detection logic
    for (const cat of categories) {
        // We create a Regex that works for both languages:
        // 1. We join all patterns with OR (|)
        // 2. We use a "Look ahead" or generic boundary to catch words even if they have Arabic prefixes like "Al-" (ال)
        // This regex looks for the pattern appearing at the start of line, after a space, or as a distinct word.
        const pattern = new RegExp(`(?:^|\\s|\\b)(${cat.patterns.join('|')})`, 'i');

        if (pattern.test(text)) {
            return {
                className: `${cat.className} pl-4 py-2 my-2 rounded-r`,

            };
        }
    }

    // Default style (no highlight)
    return {
        className: 'mb-2 leading-relaxed text-foreground',

    };
};

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
                alert('Meeting not found');
                router.push('/history');
            } else {
                const errorMsg = error.response?.data?.detail || error.message || 'Failed to load meeting';
                alert(`Error loading meeting: ${errorMsg}`);
            }
        } finally {
            setLoadingMeeting(false);
        }
    };

    const handleSyncCalendar = async () => {
        if (!jobId) return;
        if (!user?.calendar_connected) {
            alert('Please connect your calendar in Settings first');
            return;
        }

        if (meeting?.calendar_synced) {
            alert('This meeting has already been synced to calendar');
            return;
        }

        setSyncing(true);
        try {
            await meetingsAPI.syncToCalendar(jobId);
            alert('Events synced to calendar successfully!');
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
                    alert('Unable to reconnect calendar. Please try from Settings.');
                }
            } else {
                alert(errorMessage);
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

    if (loading || loadingMeeting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!meeting) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{meeting.title || 'Meeting Analysis'}</h1>
                            <p className="text-muted-foreground mt-2">{formatDate(meeting.created_at)}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportMeetingToPDF(meeting)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
                                title="Export to PDF"
                            >
                                <FileDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Export PDF</span>
                            </button>
                            {meeting?.calendar_synced ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-text-primary rounded-md border border-primary/30">
                                    <Check className="w-4 h-4" />
                                    Synced to Calendar
                                </div>
                            ) : (
                                <button
                                    onClick={handleSyncCalendar}
                                    disabled={syncing || !user?.calendar_connected}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed"
                                >
                                    {syncing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Calendar className="w-4 h-4" />
                                    )}
                                    Sync to Calendar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Takeaways / Summary */}
                        {(meeting.key_takeaways || meeting.final_summary) && (
                            <div className="bg-card rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Key Takeaways
                                </h2>
                                <div className="space-y-4">
                                    {(() => {
                                        const summary = meeting.key_takeaways || meeting.final_summary;
                                        const englishText = summary?.english;
                                        const arabicText = summary?.arabic || summary?.original_language;

                                        return (
                                            <>
                                                {englishText && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-foreground mb-2">English</h3>
                                                        <div className="prose prose-sm max-w-none">
                                                            {englishText.split('\n').map((line: string, i: number) => {
                                                                // Calculate style BEFORE rendering
                                                                const style = getLineStyle(line);

                                                                return (
                                                                    <p key={i} className={style.className}>
                                                                        {<span className="mr-2">{line}</span>}

                                                                    </p>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* ARABIC SECTION */}
                                                {arabicText && arabicText !== englishText && (
                                                    <div className="mt-4">
                                                        <h3 className="text-sm font-medium text-foreground mb-2">Arabic</h3>
                                                        <div className="prose prose-sm max-w-none" dir="rtl">
                                                            {arabicText.split('\n').map((line: string, i: number) => {
                                                                const style = getLineStyle(line);

                                                                return (
                                                                    <p key={i} className={style.className}>
                                                                        {<span className="ml-2"></span>}
                                                                        {line}
                                                                    </p>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Transcript */}
                        {meeting.raw_transcript && (
                            <div className="bg-card rounded-lg shadow p-6">
                                <button
                                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                                    className="w-full flex justify-between items-center group"
                                >
                                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">Full Transcript</h2>
                                    {isTranscriptExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                    )}
                                </button>

                                {isTranscriptExpanded && (
                                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto mt-4">
                                        <pre className="whitespace-pre-wrap text-sm text-foreground">
                                            {meeting.raw_transcript}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Additional Analysis Result - Only show if user provided custom input */}
                        {meeting.user_input && meeting.user_input_result && (
                            <div className="bg-card rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Additional Analysis
                                </h2>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
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
                    <div className="space-y-6">
                        {/* Events */}
                        {meeting.dated_events && meeting.dated_events.length > 0 && (
                            <div className="bg-card rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                    Events ({meeting.dated_events.length})
                                </h3>
                                <div className="space-y-4">
                                    {meeting.dated_events.map((event: any, index: number) => {
                                        // Handle both old and new field names
                                        const title = event.title || event.task;
                                        const date = event.date || event.due_date;
                                        const formattedDate = event.formatted_date;
                                        const description = event.description || event.context;

                                        return (
                                            <div key={index} className="border-l-4 border-primary pl-3 py-2">
                                                <p className="text-sm font-semibold text-foreground">{title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    📅 {formattedDate || date || 'TBD'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    👤 {event.assignee || 'Unassigned'}
                                                </p>
                                                {description && (
                                                    <p className="text-xs text-muted-foreground mt-2">{description}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {meeting.notes && meeting.notes.length > 0 && (
                            <div className="bg-card rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                    Notes ({meeting.notes.length})
                                </h3>
                                <div className="space-y-4">
                                    {meeting.notes.map((note: any, index: number) => {
                                        // Handle both old and new field names
                                        const category = note.category || note.note_type || 'GENERAL';
                                        const description = note.description || note.details;

                                        const isUrgent = note.urgency && note.urgency.toLowerCase() === 'yes';

                                        // Determine border color based on completion and urgency
                                        const styles = getUrgencyStyles(isUrgent);

                                        // 4. Determine border color
                                        // Priority: Completed -> Urgent -> Category Specific -> Default
                                        let borderColor = 'border-yellow-500'; // Default

                                        if (note.completed) {
                                            borderColor = 'border-primary';
                                        } else if (isUrgent) {
                                            borderColor = styles.border;
                                        } else if (category === 'BUDGET' || category === 'BUDGET_REQUEST') {
                                            borderColor = 'border-primary';
                                        } else if (category === 'DECISION') {
                                            borderColor = 'border-blue-500';
                                        }

                                        // 5. Determine background
                                        const bgClass = !note.completed && isUrgent ? styles.cardBg : '';

                                        return (
                                            <div
                                                key={note.id || index}
                                                className={`border-l-4 ${borderColor} pl-3 py-2 ${bgClass} ${note.completed ? 'opacity-75' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-xs font-medium text-muted-foreground uppercase">
                                                                {category.replace(/_/g, ' ')}
                                                            </p>
                                                            <div className="flex items-center gap-1">
                                                                {note.completed && (
                                                                    <span className="px-2 py-0.5 bg-primary/10 text-text-primary rounded text-xs font-medium flex-shrink-0">
                                                                        ✓ Done
                                                                    </span>
                                                                )}
                                                                {!note.completed && isUrgent && (
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${styles.badge}`}>
                                                                        {styles.icon}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className={`text-sm font-semibold text-foreground mt-1 ${note.completed ? 'line-through' : ''}`}>
                                                            {note.title}
                                                        </p>
                                                        {description && (
                                                            <p className="text-xs text-muted-foreground mt-2">{description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {jobId && <FloatingChat jobId={jobId} />}
        </div>
    );
}
