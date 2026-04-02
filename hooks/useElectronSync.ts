import { useEffect } from 'react';

interface UseElectronSyncProps {
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  recordingTime: number;
  processingStatus: string;
  stopRecording: () => void;
  cancelRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  setAutoProcess: (value: boolean) => void;
}

export function useElectronSync({
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
}: UseElectronSyncProps) {
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
}
