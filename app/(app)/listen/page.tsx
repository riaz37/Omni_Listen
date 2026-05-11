'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import * as vault from '@/lib/recording-vault';

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
  const router = useRouter();
  const { user, loading, refreshUser, isLoggingOut } = useAuth();
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
    handleToggleTask,
    handleDeleteTask,
    handleDeleteEvent,
  } = useDashboardData(user, loading, isLoggingOut);

  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const confirmDeleteTask = (taskId: number) => {
    setConfirmDialog({
      title: 'Delete task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      onConfirm: () => {
        handleDeleteTask(taskId);
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
      if (!user) {
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

          for (const [templateId, query] of Object.entries(CHIP_QUERIES)) {
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
      } catch (error) {
      }
    };

    loadPreset();
  }, [user]); // Only run once when user is loaded

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

    // Capture recording ID before async operations
    const capturedRecordingId = currentRecordingId;

    try {
      // startProcessing already polls job status via GlobalStateProvider.pollJobStatus.
      // We only need to watch for completion to handle navigation + vault cleanup.
      const id = await startProcessing(audioSource, config);

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
                router.push(`/conversation?id=${id}`);
              } catch (error) {
                retries++;
                if (retries < maxRetries) {
                  setTimeout(verifyMeeting, 500);
                } else {
                  router.push(`/conversation?id=${id}`);
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

    } catch (error) {
      toast.error('Upload failed. Please try again.');
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
              <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-[1.3]">Dashboard</h1>
              <p className="text-base text-muted-foreground mt-2">
                Your personal AI assistant — always listening, always organized
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(true)}
              className="group gap-3 px-5 py-2.5 h-auto rounded-xl hover:border-primary/30 hover:shadow-md shrink-0 self-start sm:self-auto"
            >
              <div className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-semibold">Roles & Presets</span>
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
          />

          {/* Sidebar */}
          <DashboardRecentConversations
            recentConversations={recentConversations}
            upcomingEvents={upcomingEvents}
            tasks={tasks}
            router={router}
            onToggleTask={handleToggleTask}
            onDeleteTask={confirmDeleteTask}
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

            let matchedTemplate = null;
            for (const [templateId, query] of Object.entries(CHIP_QUERIES)) {
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
