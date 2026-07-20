'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useAuth } from '@/lib/auth-context';
import { useConfig } from '@/lib/config-context';
import { useGlobalState } from '@/lib/global-state-context';
import { toast } from 'sonner';
import RoleConfigModal from '@/components/RoleConfigModal';
import { presetsAPI, authAPI } from '@/lib/api';
import { SYSTEM_PRESETS } from '@/lib/presets';
import { Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from 'boneyard-js/react';
import PageEntrance from '@/components/ui/page-entrance';
import MorningBriefingCard from '@/components/MorningBriefingCard';
import DashboardRecorder from '@/components/dashboard/DashboardRecorder';
import DashboardRecentConversations from '@/components/dashboard/DashboardRecentConversations';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useElectronSync } from '@/hooks/useElectronSync';
import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAutonomous } from '@/hooks/useAutonomous';
import * as vault from '@/lib/recording-vault';
import { getMaxUploadMb, isFileTooLarge } from '@/lib/upload-limits';
import { useTranslation } from '@/lib/i18n/use-translation';

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

const CHIP_QUERIES: Record<string, string> = {
  'budget': 'What were the main budget concerns discussed?',
  'actions': 'List all action items with assigned owners and deadlines',
  'technical': 'Summarize all technical decisions and their rationale',
  'deadlines': 'List all deadlines and important dates mentioned in the conversation.',
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const lp = useLocalePath();
  const { user, loading, isRevalidated, refreshUser, isLoggingOut } = useAuth();
  const { config, updateConfig } = useConfig();

  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    deleteRecording,
    recordingTime,
    audioUrl,
    audioBlob,
    audioLevel,
    noAudioDetected,
    isProcessing,
    processingStatus,
    processingProgress,
    startProcessing,
    resetProcessing,
    isPaused,
    pauseRecording,
    resumeRecording,
    autoProcess,
    setAutoProcess,
    recoveredRecording,
    currentRecordingId,
    activateRecovery,
    dismissRecovery,
    downloadSecondsLeft,
    triggerDownload,
  } = useGlobalState();

  const [inputMode, setInputMode] = useState<'upload' | 'record' | 'auto'>('record');
  const [file, setFile] = useState<File | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [localRolePrefs, setLocalRolePrefs] = useState<Record<string, string>>({});
  // Guard: only write user_input from DB on the very first preset load.
  // Subsequent refreshUser() calls must not overwrite text the user is actively editing.
  const hasLoadedInitialConfig = useRef(false);
  // Stable ref to config so loadPreset can read current user_input without adding config to
  // its dep array (which would re-trigger the effect on every keystroke).
  const configRef = useRef(config);
  useEffect(() => { configRef.current = config; });

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
      router.push(lp('/signin'));
    }
  }, [user, loading, isLoggingOut, router]);

  // Electron IPC sync
  useElectronSync({
    isRecording,
    isPaused,
    isProcessing,
    recordingTime,
    processingStatus,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resumeRecording,
    setAutoProcess,
  });

  // WebSocket notifications
  useWebSocketNotifications({ user, refreshUser });

  // Dashboard data
  const {
    upcomingEvents,
    tasks,
    recentConversations,
    isSidebarLoading,
    queryClient,
    handleToggleTask,
    handleDeleteTask,
    handleDeleteEvent,
  } = useDashboardData(user, loading, isLoggingOut);

  const autonomous = useAutonomous();

  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const confirmDeleteTask = (taskId: number) => {
    setConfirmDialog({
      title: t('dashboard.delete_task_title'),
      message: t('dashboard.delete_task_message'),
      onConfirm: () => {
        handleDeleteTask(taskId);
        setConfirmDialog(null);
      },
    });
  };

  const confirmDeleteEvent = (eventId: number) => {
    setConfirmDialog({
      title: t('dashboard.delete_event_title'),
      message: t('dashboard.delete_event_message'),
      onConfirm: () => {
        handleDeleteEvent(eventId);
        setConfirmDialog(null);
      },
    });
  };

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
    const roleToSave = targetRole || activeRole;

    const doSave = () => {
      if (user && query !== lastSavedQuery.current) {
        lastSavedQuery.current = query;
        authAPI.saveLastQuery(query, roleToSave)
          .then(() => {
            if (roleToSave) {
              setLocalRolePrefs(prev => ({
                ...prev,
                [roleToSave]: query
              }));
            }
            refreshUser();
            if (immediate) {
              toast.success('Saved!', { duration: 1500 });
            }
          })
          .catch(() => {
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
        const query = config.user_input;
        if (user && query !== lastSavedQuery.current) {
          authAPI.saveLastQuery(query).catch(() => {});
        }
      }
    };
  }, [user, config.user_input, activeRole]);

  // Load default or saved preset on mount
  useEffect(() => {
    const loadPreset = async () => {
      // Wait for the background server revalidation to complete so we always
      // load from fresh data, not the stale sessionStorage cache.
      if (!user || !isRevalidated) {
        return;
      }

      try {
        const PRESETS_CACHE_KEY = 'omni-presets-cache';
        const cached = sessionStorage.getItem(PRESETS_CACHE_KEY);
        const response = cached
          ? JSON.parse(cached)
          : await presetsAPI.getPresets().then(r => {
              sessionStorage.setItem(PRESETS_CACHE_KEY, JSON.stringify(r));
              return r;
            });
        setAllPresets(response.presets || []);
        const savedRole = user?.active_role;

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

        // Dashboard additional analysis is role-independent — always use last_custom_query,
        // but only when there is nothing already in the textarea. Two cases where we skip:
        //   1. Same component lifecycle: after the first load, refreshUser() calls must not
        //      overwrite text the user is actively editing (hasLoadedInitialConfig guard).
        //   2. Back-navigation: ConfigProvider persists across client-side navigation, so
        //      config.user_input already holds what the user had — don't clobber it with a
        //      potentially stale user.last_custom_query from the AuthContext.
        const isFirstLoad = !hasLoadedInitialConfig.current;
        const currentUserInput = configRef.current.user_input;
        const shouldInitUserInput = isFirstLoad && !currentUserInput.trim();
        const dashboardQuery = user?.last_custom_query ?? '';

        if (targetPreset) {
          updateConfig({
            role: targetPreset.config.role,
            output_fields: targetPreset.config.output_fields,
            ...(shouldInitUserInput ? { user_input: dashboardQuery } : {}),
          });
          if (shouldInitUserInput) {
            lastSavedQuery.current = dashboardQuery;
            for (const [templateId, query] of Object.entries(CHIP_QUERIES)) {
              if (dashboardQuery === query) {
                setActiveTemplate(templateId);
                break;
              }
            }
          }
          setActiveRole(targetPreset.name);
        } else {
          setActiveRole('Custom');
          if (shouldInitUserInput) {
            updateConfig({ user_input: dashboardQuery });
            lastSavedQuery.current = dashboardQuery;
          }
        }

        hasLoadedInitialConfig.current = true;
      } catch (error) {
      }
    };

    loadPreset();
  }, [user, isRevalidated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (droppedFile: File) => {
    setFile(droppedFile);
  };

  const handleClearFile = () => {
    setFile(null);
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error: any) {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (error.name === 'NotAllowedError') {
        if (isMobile) {
          toast.error(
            'Microphone permission denied. Close overlay apps, disable "Draw over other apps", clear site settings, then reload.'
          );
        } else {
          toast.error('Microphone permission denied. Please grant permission in your browser settings and reload the page.');
        }
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('Audio recording is not supported in your browser. Please try a different browser.');
      } else {
        toast.error(`Failed to access microphone: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const processAudio = async (audioSource: File) => {
    if (config.custom_field_only && !config.user_input.trim()) {
      toast.error('Please provide a question in the "Additional Analysis" field, or uncheck the "Only process additional analysis" option.');
      return;
    }

    // Reject oversized files before uploading — the backend's 413 arrives
    // mid-upload and browsers often never surface it, leaving the UI hanging.
    if (isFileTooLarge(audioSource.size)) {
      toast.error(`File is too large (${Math.round(audioSource.size / (1024 * 1024))} MB). Maximum upload size is ${getMaxUploadMb()} MB.`);
      return;
    }

    // Capture recording ID before async operations
    const capturedRecordingId = currentRecordingId;

    // If the dashboard additional analysis box is empty, fall back to the role preset's
    // default query so the preset's configured analysis still runs.
    const effectiveConfig = {
      ...config,
      user_input: config.user_input.trim() || getDefaultQuery(activeRole),
    };

    try {
      // startProcessing already polls job status via GlobalStateProvider.pollJobStatus.
      // We only need to watch for completion to handle navigation + vault cleanup.
      const id = await startProcessing(audioSource, effectiveConfig);

      const watchInterval = setInterval(async () => {
        try {
          const { conversationsAPI } = await import('@/lib/api');
          const statusData = await conversationsAPI.getJobStatus(id);
          if (statusData.status === 'completed') {
            clearInterval(watchInterval);
            deleteRecording();

            if (capturedRecordingId) {
              vault.updateRecording(capturedRecordingId, { status: 'processed' }).catch(() => {});
              vault.deleteChunks(capturedRecordingId).catch(() => {});
            }

            let retries = 0;
            const maxRetries = 5;
            const verifyMeeting = async () => {
              try {
                await conversationsAPI.getConversationDetails(id);
                router.push(lp(`/conversation?id=${id}`));
              } catch (error) {
                retries++;
                if (retries < maxRetries) {
                  setTimeout(verifyMeeting, 500);
                } else {
                  router.push(lp(`/conversation?id=${id}`));
                }
              }
            };
            verifyMeeting();
          } else if (statusData.status === 'failed') {
            clearInterval(watchInterval);
            toast.error('Processing failed: ' + statusData.error);
            if (capturedRecordingId) {
              vault.updateRecording(capturedRecordingId, { status: 'failed' }).catch(() => {});
            }
          }
        } catch (e) {
          clearInterval(watchInterval);
        }
      }, 5000);

    } catch (error: any) {
      if (error?.response?.status === 413) {
        toast.error(`File is too large. Maximum upload size is ${getMaxUploadMb()} MB.`);
      } else {
        toast.error('Upload failed. Please try again.');
      }
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

  const handleRetryRecovery = async (recordingId: string) => {
    if (!recoveredRecording) return;
    try {
      const blob = await vault.assembleBlob(recordingId);
      const file = new File([blob], recoveredRecording.fileName, {
        type: recoveredRecording.mimeType,
      });
      dismissRecovery(recordingId);
      await processAudio(file);
    } catch {
      toast.error('Could not load recording. The file may have been cleared by the browser.');
    }
  };

  // Auto-process recording when blob is ready
  useEffect(() => {
    if (autoProcess && audioBlob && !isRecording) {
      uploadRecording();
      setAutoProcess(false);
    }
  }, [autoProcess, audioBlob, isRecording]);

  return (
    <Skeleton name="dashboard-recorder" loading={loading} fallback={
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-muted/60 rounded-md animate-pulse mt-3" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border p-1">
                <div className="h-12 bg-muted/50 rounded-lg mx-1 mt-1 animate-pulse" />
                <div className="px-6 pb-8 pt-6 space-y-6">
                  <div className="h-48 bg-muted/30 rounded-lg animate-pulse" />
                  <div className="h-14 bg-muted/40 rounded-lg animate-pulse" />
                  <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border p-6 space-y-4">
              <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-24 bg-muted/30 rounded-lg animate-pulse" />
              <div className="h-24 bg-muted/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    }>
    <div className="min-h-screen bg-background relative overflow-hidden">


      <PageEntrance name="dashboard" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-[1.3]">{t('dashboard.title')}</h1>
              <p className="text-base text-muted-foreground mt-2">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(true)}
              className="group gap-3 px-5 py-2.5 h-auto rounded-xl hover:border-primary/30 hover:shadow-md shrink-0 self-start sm:self-auto"
            >
              <div className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">{t('dashboard.roles_presets')}</span>
              </div>
              <div className="h-5 w-px bg-border mx-1"></div>
              <div className="text-xs font-medium bg-primary/5 text-primary px-3 py-1 rounded-lg group-hover:bg-primary/10 transition-colors truncate max-w-[150px]">
                {activeRole || 'Custom'}
              </div>
            </Button>
          </div>
        </div>

        {/* Morning Briefing Floating Bubble */}
        <MorningBriefingCard />

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
            audioLevel={audioLevel}
            noAudioDetected={noAudioDetected}
            processingProgress={processingProgress}
            file={file}
            config={config}
            onFileChange={handleFileChange}
            onFileDrop={handleFileDrop}
            onClearFile={handleClearFile}
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
            recoveredRecording={recoveredRecording}
            onDismissRecovery={dismissRecovery}
            onRetryRecovery={handleRetryRecovery}
            downloadSecondsLeft={downloadSecondsLeft}
            onTriggerDownload={triggerDownload}
            autonomousState={autonomous.state}
            autonomousSettings={autonomous.settings}
            onAutonomousPrepare={autonomous.prepare}
            onAutonomousStart={autonomous.start}
            onAutonomousPause={autonomous.pause}
            onAutonomousResume={autonomous.resume}
            onAutonomousUploadNow={autonomous.uploadNow}
            onAutonomousDiscard={autonomous.discard}
            onAutonomousUploadAndStop={autonomous.uploadAndStop}
            onAutonomousSaveSettings={autonomous.saveSettings}
          />

          {/* Sidebar */}
          <DashboardRecentConversations
            recentConversations={recentConversations}
            upcomingEvents={upcomingEvents}
            tasks={tasks}
            isLoading={isSidebarLoading}
            router={router}
            onToggleTask={handleToggleTask}
            onDeleteTask={confirmDeleteTask}
            onDeleteEvent={confirmDeleteEvent}
            onRecentConversationRetried={() => {
              queryClient.invalidateQueries({ queryKey: ['conversations', 'recent'] });
            }}
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

            // Dashboard additional analysis is role-independent — keep user_input as-is.
            // Only persist the active role change.
            authAPI.setActiveRole(roleName)
              .then(() => refreshUser())
              .catch(() => {});
          }}
        />
        {confirmDialog && (
          <ConfirmDialog
            isOpen={!!confirmDialog}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </PageEntrance>
    </div>
    </Skeleton>
  );
}
