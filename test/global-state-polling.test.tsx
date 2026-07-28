import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalStateProvider, useGlobalState } from '@/lib/global-state-context';
import { installFakeWebAudio } from './helpers/fake-web-audio';
import { installFakeMediaRecorder, installFakeMediaDevices } from './helpers/fake-media';

// Covers the second half of the "processing a new recording shows the
// previous meeting" investigation: pollJobStatus used setInterval(async tick)
// scheduling the NEXT tick's timer before the CURRENT tick's await had
// resolved. On a slow backend (Render cold start), that let multiple
// getJobStatus calls run concurrently and let a stale result overwrite
// state after a newer poll had already superseded it. Fixed with a
// self-scheduling setTimeout chain plus a generation guard.

const mockGetJobStatus = vi.fn();
vi.mock('@/lib/api', () => ({
  conversationsAPI: {
    getJobStatus: (...args: any[]) => mockGetJobStatus(...args),
    uploadAudio: vi.fn(),
    getConversationDetails: vi.fn(),
  },
}));

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const hook = renderHook(() => useGlobalState(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <GlobalStateProvider>{children}</GlobalStateProvider>
      </QueryClientProvider>
    ),
  });
  return { ...hook, queryClient };
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  installFakeWebAudio();
  installFakeMediaRecorder();
  installFakeMediaDevices();
  mockGetJobStatus.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('pollJobStatus — no overlapping in-flight requests', () => {
  it('does not issue a second status check while the first is still pending, even once the interval elapses', async () => {
    const first = deferred<any>();
    mockGetJobStatus.mockReturnValueOnce(first.promise);

    const { result } = setup();
    act(() => {
      result.current.pollJobStatus('job-1');
    });

    // Jittered initial delay (500-1500ms) — let the first tick fire.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(mockGetJobStatus).toHaveBeenCalledTimes(1);

    // A naive setInterval would fire again here, well past the ~2s base
    // interval, even though the first call above never resolved.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(mockGetJobStatus).toHaveBeenCalledTimes(1);

    first.resolve({ status: 'processing', overall_progress: 40, stages: {} });
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('schedules the next check only after the previous one resolves', async () => {
    const first = deferred<any>();
    mockGetJobStatus.mockReturnValueOnce(first.promise);
    mockGetJobStatus.mockResolvedValueOnce({ status: 'processing', overall_progress: 60, stages: {} });

    const { result } = setup();
    act(() => {
      result.current.pollJobStatus('job-1');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(mockGetJobStatus).toHaveBeenCalledTimes(1);

    first.resolve({ status: 'processing', overall_progress: 40, stages: {} });
    // Advance just enough to cover the backoff before the SECOND tick (the
    // first non-terminal poll grows the interval to ~2.8-3.3s), but stop
    // short of the THIRD tick's (larger) backoff — this test only asserts
    // on the transition from 1 to 2 calls.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });
    expect(mockGetJobStatus).toHaveBeenCalledTimes(2);
  });
});

describe('pollJobStatus — terminal state signals', () => {
  it('sets completedJobId when the job completes', async () => {
    mockGetJobStatus.mockResolvedValueOnce({ status: 'completed', overall_progress: 100, stages: {} });

    const { result } = setup();
    act(() => {
      result.current.pollJobStatus('job-done');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(result.current.completedJobId).toBe('job-done');
    expect(result.current.isProcessing).toBe(false);
  });

  it('invalidates the History page cache on completion, so a freshly finished meeting is not hidden by its 5-minute staleTime', async () => {
    mockGetJobStatus.mockResolvedValueOnce({ status: 'completed', overall_progress: 100, stages: {} });

    const { result, queryClient } = setup();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => {
      result.current.pollJobStatus('job-done');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['conversations', 'history'] }),
    );
  });

  it('sets failedJobId and the error message when the job fails', async () => {
    mockGetJobStatus.mockResolvedValueOnce({ status: 'failed', overall_progress: 50, stages: {}, error: 'boom' });

    const { result } = setup();
    act(() => {
      result.current.pollJobStatus('job-bad');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(result.current.failedJobId).toBe('job-bad');
    expect(result.current.isProcessing).toBe(false);
  });
});

describe('pollJobStatus — supersession', () => {
  it('a stale in-flight response for a superseded poll cannot set completedJobId for the wrong job', async () => {
    const staleForJob1 = deferred<any>();
    mockGetJobStatus.mockReturnValueOnce(staleForJob1.promise);

    const { result } = setup();
    act(() => {
      result.current.pollJobStatus('job-1');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(mockGetJobStatus).toHaveBeenCalledTimes(1);

    // A new job supersedes the first before it resolved.
    mockGetJobStatus.mockResolvedValueOnce({ status: 'processing', overall_progress: 10, stages: {} });
    act(() => {
      result.current.pollJobStatus('job-2');
    });

    // The stale job-1 response arrives late and claims completion.
    staleForJob1.resolve({ status: 'completed', overall_progress: 100, stages: {} });
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.completedJobId).not.toBe('job-1');
  });
});
