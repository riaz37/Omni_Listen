'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useConfig } from '@/lib/config-context';
import { useGlobalState } from '@/lib/global-state-context';
import { useToast } from '@/components/Toast';
import Navigation from '@/components/Navigation';
import RoleConfigModal from '@/components/RoleConfigModal';
import { meetingsAPI, analyticsAPI, presetsAPI } from '@/lib/api';
import { SYSTEM_PRESETS } from '@/lib/presets';
import { Loader2, Settings } from 'lucide-react';
import MorningBriefingCard from '@/components/MorningBriefingCard';
import DashboardRecorder from '@/components/dashboard/DashboardRecorder';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import DashboardRecentMeetings from '@/components/dashboard/DashboardRecentMeetings';

declare global {
  interface Window {
    electron?: {
      startRecording?: () => Promise<boolean>;
      stopRecording?: () => Promise<boolean>;
      onVadStatus?: (callback: (status: string) => void) => void;
      restoreMain?: () => Promise<void>;
      sendMiniAction?: (action: string) => Promise<void>;
      onMiniAction?: (callback: (action: string) => void) => void;
      sendTimerUpdate?: (time: string) => Promise<void>;
      onTimerUpdate?: (callback: (time: string) => void) => void;
      sendProcessingStatus?: (status: string) => Promise<void>;
      onProcessingStatus?: (callback: (status: string) => void) => void;
      sendRecordingState?: (state: { isPaused: boolean; isRecording: boolean }) => Promise<void>;
      onRecordingState?: (callback: (state: { isPaused: boolean }) => void) => void;
    };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, refreshUser, isLoggingOut } = useAuth();
  const { config, updateConfig } = useConfig();
  const toast = useToast();
  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    deleteRecording,
    recordingTime,
    audioUrl,
    audioBlob,
    isProcessing,
    processingStatus,
    processingProgress,
    startProcessing,
    resetProcessing,
    isPaused,
    pauseRecording,
    resumeRecording,
    autoProcess,
    setAutoProcess
  } = useGlobalState();

  const [inputMode, setInputMode] = useState<'upload' | 'record'>('record');
  const [file, setFile] = useState<File | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [localRolePrefs, setLocalRolePrefs] = useState<Record<string, string>>({});

  // Initialize localRolePrefs from user profile
  useEffect(() => {
    if (user?.role_preferences) {
      try {
        const prefs = JSON.parse(user.role_preferences);
        setLocalRolePrefs(prefs);
      } catch (e) {
        // Parse error handled silently
      }
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/signin');
    }
  }, [user, loading, isLoggingOut, router]);

  // Listen for Mini Window Actions (IPC)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron && window.electron.onMiniAction) {
      window.electron.onMiniAction((action) => {
        if (action === 'stop') {
          setAutoProcess(true);
          stopRecording();
        } else if (action === 'cancel') {
          cancelRecording();
        } else if (action === 'pause') {
          pauseRecording();
        } else if (action === 'resume') {
          resumeRecording();
        }
      });
    }
  }, [stopRecording, cancelRecording, pauseRecording, resumeRecording]);

  // Sync Timer to Mini Window
  useEffect(() => {
    if (window.electron?.sendTimerUpdate) {
      if (isRecording) {
        const mins = Math.floor(recordingTime / 60).toString().padStart(2, '0');
        const secs = (recordingTime % 60).toString().padStart(2, '0');
        window.electron.sendTimerUpdate(`${mins}:${secs}`);
      } else {
        window.electron.sendTimerUpdate('00:00');
      }
    }
  }, [recordingTime, isRecording]);

  // Sync Recording State (Active/Pause)
  useEffect(() => {
    if (window.electron?.sendRecordingState) {
      window.electron.sendRecordingState({ isPaused, isRecording: isRecording || false });
    }
  }, [isPaused, isRecording]);

  // Sync Processing Status to Mini Window
  useEffect(() => {
    if (window.electron?.sendProcessingStatus) {
      if (isProcessing) {
        window.electron.sendProcessingStatus('processing');
      } else if (!isProcessing && !isRecording && (processingStatus === 'completed' || processingStatus.includes('Complete'))) {
        window.electron.sendProcessingStatus('done');
      } else {
        window.electron.sendProcessingStatus('idle');
      }
    }
  }, [isProcessing, isRecording, processingStatus]);

  // WebSocket for System Notifications (Calendar Disconnect Popup)
  useEffect(() => {
    if (!user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrlBase = apiUrl.replace(/^http/, 'ws');
    const token = localStorage.getItem('access_token');

    if (!token) return;

    const wsUrl = `${wsUrlBase}/ws/notifications?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {};

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'calendar.disconnected') {
          await refreshUser();
          toast.error("⚠️ Calendar Disconnected! Please sign in again.", 5000);
          router.push('/settings');
        }
      } catch (e) {
        // WS message parse error handled silently
      }
    };

    return () => {
      ws.close();
    };
  }, [user, router, toast]);

  // Auto-switch to record tab if recording is active
  useEffect(() => {
    if (isRecording) {
      setInputMode('record');
    }
  }, [isRecording]);

  // Sync activeTemplate with user_input
  useEffect(() => {
    const input = config.user_input;
    if (input === "What were the main budget concerns discussed?") {
      setActiveTemplate('budget');
    } else if (input === "List all action items with assigned owners and deadlines") {
      setActiveTemplate('actions');
    } else if (input === "Summarize all technical decisions and their rationale") {
      setActiveTemplate('technical');
    } else if (input === "List all deadlines and important dates mentioned in the meeting.") {
      setActiveTemplate('deadlines');
    } else {
      setActiveTemplate(null);
    }
  }, [config.user_input]);

  const [analytics, setAnalytics] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);

  const [allPresets, setAllPresets] = useState<any[]>([]);

  // Helper to get default query for a role
  const getDefaultQuery = useCallback((roleName: string | null) => {
    if (!roleName) return '';
    const preset = allPresets.find(p => p.name === roleName) || SYSTEM_PRESETS.find(p => p.name === roleName);
    return preset?.config?.user_input || '';
  }, [allPresets]);

  // Debounced save for custom query (with optional immediate save)
  const saveQueryTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedQuery = useRef<string>('');

  const saveCustomQuery = useCallback((query: string, immediate: boolean = false, targetRole?: string) => {
    const token = localStorage.getItem('access_token');
    const roleToSave = targetRole || activeRole;

    const doSave = () => {
      if (token && user && query !== lastSavedQuery.current) {
        lastSavedQuery.current = query;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/last-query`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            role_name: roleToSave
          })
        })
          .then(res => {
            if (res.ok) {
              if (roleToSave) {
                setLocalRolePrefs(prev => ({
                  ...prev,
                  [roleToSave]: query
                }));
              }
              refreshUser();
              if (immediate) {
                toast.success('Saved!', 1500);
              }
            }
            return res.json();
          })
          .then(() => {})
          .catch(err => {
            if (immediate) {
              toast.error('Failed to save query');
            }
          });
      }
    };

    if (immediate) {
      if (saveQueryTimeout.current) {
        clearTimeout(saveQueryTimeout.current);
        saveQueryTimeout.current = null;
      }
      doSave();
    } else {
      if (saveQueryTimeout.current) {
        clearTimeout(saveQueryTimeout.current);
      }
      saveQueryTimeout.current = setTimeout(doSave, 300);
    }
  }, [user, activeRole]);

  // Cleanup: Save pending query on unmount
  useEffect(() => {
    return () => {
      if (saveQueryTimeout.current) {
        clearTimeout(saveQueryTimeout.current);
        const token = localStorage.getItem('access_token');
        const query = config.user_input;
        if (token && user && query !== lastSavedQuery.current) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/last-query`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
          }).catch(() => {});
        }
      }
    };
  }, [user, config.user_input, activeRole]);

  // Load default or saved preset on mount
  useEffect(() => {
    const loadPreset = async () => {
      if (!user) {
        return;
      }

      try {
        const response = await presetsAPI.getPresets();
        setAllPresets(response.presets || []);
        const savedRole = user?.active_role;
        const lastQuery = user?.last_custom_query;

        let targetPreset;

        if (savedRole) {
          targetPreset = response.presets?.find((p: any) => p.name === savedRole);
          if (!targetPreset) {
            targetPreset = SYSTEM_PRESETS.find((p: any) => p.name === savedRole);
          }
        }

        if (!targetPreset) {
          targetPreset = response.presets?.find((p: any) => p.is_default);
        }

        if (targetPreset) {
          let roleQuery = targetPreset.config.user_input || '';

          if (user?.role_preferences) {
            try {
              const prefs = JSON.parse(user.role_preferences);
              if (prefs[targetPreset.name] !== undefined) {
                roleQuery = prefs[targetPreset.name];
              }
            } catch (e) {
            }
          }

          updateConfig({
            role: targetPreset.config.role,
            output_fields: targetPreset.config.output_fields,
            user_input: roleQuery,
          });
          setActiveRole(targetPreset.name);

          const chipQueries = {
            'budget': 'What were the main budget concerns discussed?',
            'actions': 'List all action items with assigned owners and deadlines',
            'technical': 'Summarize all technical decisions and their rationale',
            'deadlines': 'List all deadlines and important dates mentioned in the meeting.'
          };

          for (const [templateId, query] of Object.entries(chipQueries)) {
            if (roleQuery === query) {
              setActiveTemplate(templateId);
              break;
            }
          }
        } else {
          setActiveRole('Custom');

          if (user?.role_preferences) {
            try {
              const prefs = JSON.parse(user.role_preferences);
              if (prefs['Custom'] !== undefined) {
                updateConfig({ user_input: prefs['Custom'] });
              }
            } catch (e) {
            }
          }
        }
        if (false && lastQuery) {
          updateConfig({
            user_input: lastQuery || undefined,
          });

          const chipQueries = {
            'budget': 'What were the main budget concerns discussed?',
            'actions': 'List all action items with assigned owners and deadlines',
            'technical': 'Summarize all technical decisions and their rationale',
            'deadlines': 'List all deadlines and important dates mentioned in the meeting.'
          };

          for (const [templateId, query] of Object.entries(chipQueries)) {
            if (lastQuery === query) {
              setActiveTemplate(templateId);
              break;
            }
          }
        }

      } catch (error) {
      }
    };

    loadPreset();
  }, [user]); // Only run once when user is loaded

  const fetchUpcomingEvents = async () => {
    try {
      const eventsResponse = await meetingsAPI.getAllEvents();
      const now = new Date();
      const allEvents: any[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            if (event.date) {
              const eventDate = new Date(event.date);
              if (eventDate > now) {
                allEvents.push({
                  id: event.id,
                  title: event.title || 'Untitled Event',
                  date: eventDate,
                  assignee: event.assignee,
                  description: event.description || '',
                  urgency: event.urgency || 'no',
                  completed: event.completed || false,
                  meetingId: event.meeting_id || '',
                });
              }
            }
          } catch (err) {
          }
        });
      }

      allEvents.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      });
      setUpcomingEvents(allEvents.slice(0, 5));
    } catch (error) {
    }
  };

  const fetchTasks = async () => {
    try {
      const [eventsResponse, notesResponse] = await Promise.all([
        meetingsAPI.getAllEvents(),
        meetingsAPI.getAllNotes()
      ]);

      const allTasks: any[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            allTasks.push({
              id: event.id,
              title: event.title || 'Untitled Task',
              date: new Date(event.date),
              completed: event.completed || false,
              type: 'dated_events',
              category: event.category,
              description: event.description || '',
              urgency: event.urgency || 'no',
              meetingId: event.meeting_id || '',
              assignee: event.assignee,
            });
          } catch (err) {
          }
        });
      }

      if (notesResponse.notes && Array.isArray(notesResponse.notes)) {
        notesResponse.notes.forEach((note: any) => {
          try {
            allTasks.push({
              id: note.id,
              title: note.title || 'Untitled Note',
              date: new Date(note.created_at || Date.now()),
              completed: note.completed || false,
              type: 'notes',
              category: note.category || note.note_type,
              description: note.description || '',
              urgency: note.urgency || 'no',
              meetingId: note.meeting_id || '',
              assignee: note.assignee,
            });
          } catch (err) {
          }
        });
      }

      allTasks.sort((a, b) => {
        const aRawUrgency = a.urgency || 'no';
        const bRawUrgency = b.urgency || 'no';
        const aLevel = (aRawUrgency === 'high' || aRawUrgency === 'medium' || aRawUrgency === 'yes') ? 'yes' : 'no';
        const bLevel = (bRawUrgency === 'high' || bRawUrgency === 'medium' || bRawUrgency === 'yes') ? 'yes' : 'no';
        if (aLevel !== bLevel) {
          const urgencyOrder = { yes: 0, no: 1 };
          return urgencyOrder[aLevel] - urgencyOrder[bLevel];
        }
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      });
      setTasks(allTasks);
    } catch (error) {
    }
  };

  const fetchRecentMeetings = async () => {
    try {
      const response = await meetingsAPI.getMeetings(5, 0);
      if (response.meetings && Array.isArray(response.meetings)) {
        const meetings = response.meetings.map((meeting: any) => ({
          job_id: meeting.job_id,
          title: meeting.title || 'Meeting Analysis',
          created_at: new Date(meeting.created_at),
        }));
        setRecentMeetings(meetings);
      }
    } catch (error) {
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      await meetingsAPI.toggleTaskCompletion(taskId, completed);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      ));
      setTasks(prev => [...prev].sort((a, b) => {
        const aRawUrgency = a.urgency || 'no';
        const bRawUrgency = b.urgency || 'no';
        const aLevel = (aRawUrgency === 'high' || aRawUrgency === 'medium' || aRawUrgency === 'yes') ? 'yes' : 'no';
        const bLevel = (bRawUrgency === 'high' || bRawUrgency === 'medium' || bRawUrgency === 'yes') ? 'yes' : 'no';
        if (aLevel !== bLevel) {
          const urgencyOrder = { yes: 0, no: 1 };
          return urgencyOrder[aLevel] - urgencyOrder[bLevel];
        }
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      }));
      fetchUpcomingEvents();
    } catch (error) {
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await meetingsAPI.deleteEvent(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      fetchUpcomingEvents();
    } catch (error) {
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await meetingsAPI.deleteEvent(eventId);
      setUpcomingEvents(upcomingEvents.filter(event => event.id !== eventId));
    } catch (error) {
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error: any) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (error.name === 'NotAllowedError') {
        if (isMobile) {
          alert(
            '❌ Microphone permission denied.\n\n' +
            'If you see "This site can\'t ask for your permission":\n\n' +
            '1. Close all overlay apps (chat heads, screen filters, blue light apps)\n' +
            '2. Disable "Draw over other apps" for those apps in Settings\n' +
            '3. Clear Chrome site settings and try again\n' +
            '4. Or try Firefox/Samsung Internet browser\n\n' +
            'Then reload this page and try recording again.'
          );
        } else {
          alert('Microphone permission denied. Please grant permission in your browser settings and reload the page.');
        }
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotSupportedError') {
        alert('Audio recording is not supported in your browser. Please try a different browser.');
      } else {
        alert(`Failed to access microphone: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const processAudio = async (audioSource: File) => {
    if (config.custom_field_only && !config.user_input.trim()) {
      alert('Please provide a question in the "Additional Analysis" field, or uncheck the "Only process additional analysis" option.');
      return;
    }

    try {
      const id = await startProcessing(audioSource, config);

      const checkInterval = setInterval(async () => {
        try {
          const statusData = await meetingsAPI.getJobStatus(id);
          if (statusData.status === 'completed') {
            clearInterval(checkInterval);
            resetProcessing();
            deleteRecording();

            let retries = 0;
            const maxRetries = 5;
            const verifyMeeting = async () => {
              try {
                await meetingsAPI.getMeetingDetails(id);
                router.push(`/meeting?id=${id}`);
              } catch (error) {
                retries++;
                if (retries < maxRetries) {
                  setTimeout(verifyMeeting, 500);
                } else {
                  router.push(`/meeting?id=${id}`);
                }
              }
            };
            verifyMeeting();
          } else if (statusData.status === 'failed') {
            clearInterval(checkInterval);
            alert('Processing failed: ' + statusData.error);
          }
        } catch (e) {
          clearInterval(checkInterval);
        }
      }, 2000);

    } catch (error) {
      alert('Upload failed. Please try again.');
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;
    const recordingFile = new File(
      [audioBlob],
      `recording_${Date.now()}.webm`,
      { type: 'audio/webm' }
    );
    await processAudio(recordingFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    await processAudio(file);
  };

  // Auto-process recording when blob is ready
  useEffect(() => {
    if (autoProcess && audioBlob && !isRecording) {
      uploadRecording();
      setAutoProcess(false);
    }
  }, [autoProcess, audioBlob, isRecording]);

  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      router.push('/signin');
    } else if (user) {
      analyticsAPI.getAnalytics().then(setAnalytics).catch(() => {});
      fetchUpcomingEvents();
      fetchTasks();
      fetchRecentMeetings();
    }
  }, [user, loading, router, isLoggingOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-96 bg-gradient-to-bl from-primary/3 to-transparent pointer-events-none" />

      <Navigation />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-base text-muted-foreground mt-2 font-light">
                Capture and analyze your meetings with AI-powered precision
              </p>
            </div>
            <button
              onClick={() => setShowRoleModal(true)}
              className="group flex items-center gap-3 px-5 py-2.5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200 shrink-0 self-start sm:self-auto"
            >
              <div className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">Roles & Presets</span>
              </div>
              <div className="h-5 w-px bg-border mx-1"></div>
              <div className="text-xs font-medium bg-primary/5 text-text-primary px-3 py-1 rounded-lg group-hover:bg-primary/10 transition-colors truncate max-w-[150px]">
                {activeRole || 'Custom'}
              </div>
            </button>
          </div>
        </div>

        {/* Morning Briefing Floating Bubble */}
        <MorningBriefingCard />

        {/* Analytics Stats */}
        <DashboardAnalytics analytics={analytics} />

        {/* Main Content Area with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Area */}
          <DashboardRecorder
            inputMode={inputMode}
            setInputMode={setInputMode}
            isRecording={isRecording}
            isPaused={isPaused}
            isProcessing={isProcessing}
            recordingTime={recordingTime}
            audioUrl={audioUrl}
            processingProgress={processingProgress}
            file={file}
            config={config}
            onFileChange={handleFileChange}
            onStartRecording={handleStartRecording}
            onStopRecording={stopRecording}
            onCancelRecording={cancelRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onUpload={handleUpload}
            onUploadRecording={uploadRecording}
            onSetAutoProcess={setAutoProcess}
            updateConfig={updateConfig}
            saveCustomQuery={saveCustomQuery}
            getDefaultQuery={getDefaultQuery}
            activeRole={activeRole}
          />

          {/* Sidebar */}
          <DashboardRecentMeetings
            recentMeetings={recentMeetings}
            upcomingEvents={upcomingEvents}
            tasks={tasks}
            router={router}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>

        <RoleConfigModal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
          }}
          activeRoleName={activeRole}
          onRoleSelected={(preset) => {
            const roleName = preset.name;
            setActiveRole(roleName);

            let defaultQuery = preset.config.user_input || '';

            if (localRolePrefs[roleName]) {
              defaultQuery = localRolePrefs[roleName];
            }

            const chipQueries = {
              'budget': 'What were the main budget concerns discussed?',
              'actions': 'List all action items with assigned owners and deadlines',
              'technical': 'Summarize all technical decisions and their rationale',
              'deadlines': 'List all deadlines and important dates mentioned in the meeting.'
            };

            let matchedTemplate = null;
            for (const [templateId, query] of Object.entries(chipQueries)) {
              if (defaultQuery === query) {
                matchedTemplate = templateId;
                break;
              }
            }
            setActiveTemplate(matchedTemplate);

            updateConfig({
              user_input: defaultQuery
            });

            saveCustomQuery(defaultQuery, true, roleName);
          }}
        />
      </div>
    </div>
  );
}
