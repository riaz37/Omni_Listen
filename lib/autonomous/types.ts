export type AutonomousStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'listening'
  | 'utterance'
  | 'session-active'
  | 'paused'
  | 'uploading'
  | 'done';

export interface AutonomousSettings {
  enabled: boolean;
  schedule: {
    enabled: boolean;
    days: number[];        // 0 = Sun … 6 = Sat
    startTime: string;     // "HH:MM"
    endTime: string;       // "HH:MM"
  };
  sessionSilenceMinutes: number;     // default 5
  vadThreshold: number;              // default 0.5
  minUtteranceDurationMs: number;    // default 500
  additionalAnalysisQuery: string;   // custom LLM question for every auto session
}

export const DEFAULT_SETTINGS: AutonomousSettings = {
  enabled: false,
  schedule: {
    enabled: false,
    days: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
  },
  sessionSilenceMinutes: 5,
  vadThreshold: 0.5,
  minUtteranceDurationMs: 500,
  additionalAnalysisQuery: '',
};

export interface LoadingProgress {
  phase: 'downloading' | 'initializing';
  percent: number;
  bytesLoaded?: number;
  bytesTotal?: number;
}

export interface AutonomousState {
  status: AutonomousStatus;
  utteranceCount: number;
  error: string | null;
  loadingProgress: LoadingProgress | null;
  pendingUploads: number;
}
