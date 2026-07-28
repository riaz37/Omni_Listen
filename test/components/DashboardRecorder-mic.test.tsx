import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardRecorder from '@/components/dashboard/DashboardRecorder';

const baseProps = {
  inputMode: 'record' as const,
  setInputMode: vi.fn(),
  isRecording: false,
  isPaused: false,
  isProcessing: false,
  recordingTime: 0,
  audioUrl: null,
  audioLevel: 0.5,
  noAudioDetected: false,
  processingProgress: 0,
  file: null,
  config: { user_input: '', custom_field_only: false },
  onFileChange: vi.fn(),
  onFileDrop: vi.fn(),
  onClearFile: vi.fn(),
  onStartRecording: vi.fn(),
  onStopRecording: vi.fn(),
  onCancelRecording: vi.fn(),
  onPauseRecording: vi.fn(),
  onResumeRecording: vi.fn(),
  onUpload: vi.fn(),
  onUploadRecording: vi.fn(),
  onSetAutoProcess: vi.fn(),
  updateConfig: vi.fn(),
  saveCustomQuery: vi.fn(),
  getDefaultQuery: vi.fn(() => ''),
  activeRole: null,
  recoveredRecording: null,
  onDismissRecovery: vi.fn(),
  onRetryRecovery: vi.fn(),
  downloadSecondsLeft: null,
  onTriggerDownload: vi.fn(),
  autonomousState: {
    status: 'idle' as const,
    utteranceCount: 0,
    error: null,
    loadingProgress: null,
    pendingUploads: 0,
  },
  autonomousSettings: null,
  onAutonomousPrepare: vi.fn(),
  onAutonomousStart: vi.fn(),
  onAutonomousPause: vi.fn(),
  onAutonomousResume: vi.fn(),
  onAutonomousUploadNow: vi.fn(),
  onAutonomousDiscard: vi.fn(),
  onAutonomousUploadAndStop: vi.fn(),
  onAutonomousSaveSettings: vi.fn(),
};

describe('DashboardRecorder — mic picker slot', () => {
  it('renders the micPicker slot content in Record mode', () => {
    render(<DashboardRecorder {...baseProps} micPicker={<button>pick-a-mic</button>} />);
    expect(screen.getByRole('button', { name: 'pick-a-mic' })).toBeInTheDocument();
  });

  it('renders nothing extra when micPicker is omitted', () => {
    render(<DashboardRecorder {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'pick-a-mic' })).not.toBeInTheDocument();
  });
});

describe('DashboardRecorder — pre-recording level meter (isPreviewingMic)', () => {
  it('shows the level bars as live (bg-primary) while previewing, even though not recording', () => {
    const { container } = render(
      <DashboardRecorder {...baseProps} isRecording={false} isPreviewingMic audioLevel={0.9} />,
    );
    const bars = container.querySelectorAll('.bg-primary.w-2.rounded-full');
    expect(bars.length).toBe(20);
  });

  it('shows the level bars as idle (muted) when neither recording nor previewing', () => {
    const { container } = render(
      <DashboardRecorder {...baseProps} isRecording={false} isPreviewingMic={false} audioLevel={0.9} />,
    );
    const litBars = container.querySelectorAll('.bg-primary.w-2.rounded-full');
    expect(litBars.length).toBe(0);
  });
});
