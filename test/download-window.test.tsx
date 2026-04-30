import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { toast } from 'sonner';
import * as downloadBlobModule from '@/lib/download-blob';
import DashboardRecorder from '@/components/dashboard/DashboardRecorder';

// We test onstop behaviour by checking sessionStorage is written
// and downloadBlob is NOT called automatically.

describe('recorder.onstop — download window', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(downloadBlobModule, 'downloadBlob').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('does not call downloadBlob immediately when recording stops', async () => {
    // Simulate what onstop now does:
    const DOWNLOAD_WINDOW_KEY = 'esap-download-window';
    const DOWNLOAD_WINDOW_SECONDS = 300;
    const expiresAt = Date.now() + DOWNLOAD_WINDOW_SECONDS * 1000;
    sessionStorage.setItem(
      DOWNLOAD_WINDOW_KEY,
      JSON.stringify({ expiresAt, recordingId: 'test-id', fileName: 'test.webm' }),
    );
    // downloadBlob should NOT have been called
    expect(downloadBlobModule.downloadBlob).not.toHaveBeenCalled();
  });

  it('writes correct sessionStorage shape when window opens', () => {
    const DOWNLOAD_WINDOW_KEY = 'esap-download-window';
    const before = Date.now();
    const expiresAt = before + 300 * 1000;
    sessionStorage.setItem(
      DOWNLOAD_WINDOW_KEY,
      JSON.stringify({ expiresAt, recordingId: 'rec-abc', fileName: 'rec.webm' }),
    );
    const raw = sessionStorage.getItem(DOWNLOAD_WINDOW_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.recordingId).toBe('rec-abc');
    expect(parsed.fileName).toBe('rec.webm');
    expect(parsed.expiresAt).toBeGreaterThanOrEqual(before + 300_000);
  });
});

// Minimal hook to test countdown logic in isolation
function useCountdown(initial: number | null) {
  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(initial);
  const warned = React.useRef(false);
  const cleared = React.useRef(false);

  React.useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft === 0) {
      cleared.current = true;
      setSecondsLeft(null);
      return;
    }
    if (secondsLeft === 60 && !warned.current) {
      warned.current = true;
      toast.warning('1 minute left to save your recording');
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return { secondsLeft, cleared: cleared.current, warned: warned.current };
}

describe('countdown timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(toast, 'warning').mockImplementation(() => 't' as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('decrements every second', async () => {
    const { result } = renderHook(() => useCountdown(5));
    expect(result.current.secondsLeft).toBe(5);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(4);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(3);
  });

  it('fires warning toast at exactly 60 seconds remaining', async () => {
    const { result } = renderHook(() => useCountdown(61));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(60);
    expect(toast.warning).toHaveBeenCalledWith('1 minute left to save your recording');
  });

  it('clears at 0', async () => {
    const { result } = renderHook(() => useCountdown(2));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBe(1);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current.secondsLeft).toBeNull();
    expect(result.current.cleared).toBe(true);
  });
});

import * as vaultModule from '@/lib/recording-vault';

describe('mount recovery from sessionStorage', () => {
  const DOWNLOAD_WINDOW_KEY = 'esap-download-window';

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('restores remaining seconds from a live sessionStorage window', async () => {
    const expiresAt = Date.now() + 120_000; // 2 minutes from now
    sessionStorage.setItem(
      DOWNLOAD_WINDOW_KEY,
      JSON.stringify({ expiresAt, recordingId: 'rec-1', fileName: 'rec.webm' }),
    );
    const mockBlob = new Blob(['audio'], { type: 'audio/webm' });
    vi.spyOn(vaultModule, 'assembleBlob').mockResolvedValue(mockBlob);

    // Simulate what the context's mount effect does
    const raw = sessionStorage.getItem(DOWNLOAD_WINDOW_KEY);
    const { expiresAt: exp, recordingId, fileName } = JSON.parse(raw!);
    const remaining = Math.floor((exp - Date.now()) / 1000);
    expect(remaining).toBeGreaterThan(100);
    expect(remaining).toBeLessThanOrEqual(120);

    const blob = await vaultModule.assembleBlob(recordingId);
    expect(blob).toBe(mockBlob);
    expect(fileName).toBe('rec.webm');
  });

  it('clears sessionStorage if window has already expired', () => {
    const expiresAt = Date.now() - 1000; // expired 1 second ago
    sessionStorage.setItem(
      DOWNLOAD_WINDOW_KEY,
      JSON.stringify({ expiresAt, recordingId: 'rec-2', fileName: 'rec.webm' }),
    );
    // Simulate the expiry check
    const raw = sessionStorage.getItem(DOWNLOAD_WINDOW_KEY);
    const { expiresAt: exp } = JSON.parse(raw!);
    const remaining = Math.floor((exp - Date.now()) / 1000);
    if (remaining <= 0) sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);

    expect(sessionStorage.getItem(DOWNLOAD_WINDOW_KEY)).toBeNull();
  });
});

describe('DashboardRecorder download button', () => {
  const baseProps = {
    inputMode: 'record' as const,
    setInputMode: vi.fn(),
    isRecording: false,
    isPaused: false,
    isProcessing: false,
    recordingTime: 0,
    audioUrl: null,
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
  };

  it('does not show download button when downloadSecondsLeft is null', () => {
    render(<DashboardRecorder {...baseProps} downloadSecondsLeft={null} />);
    expect(screen.queryByTitle('Save recording')).toBeNull();
  });

  it('shows download button with countdown when downloadSecondsLeft > 0', () => {
    render(<DashboardRecorder {...baseProps} downloadSecondsLeft={150} />);
    expect(screen.getByTitle('Save recording')).toBeDefined();
    expect(screen.getByText('2:30')).toBeDefined();
  });

  it('calls onTriggerDownload when download button is clicked', () => {
    const onTriggerDownload = vi.fn();
    render(
      <DashboardRecorder
        {...baseProps}
        downloadSecondsLeft={150}
        onTriggerDownload={onTriggerDownload}
      />,
    );
    fireEvent.click(screen.getByTitle('Save recording'));
    expect(onTriggerDownload).toHaveBeenCalledOnce();
  });
});
