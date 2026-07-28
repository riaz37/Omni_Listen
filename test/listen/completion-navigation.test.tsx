import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProcessingCompletion } from '@/hooks/useProcessingCompletion';

// Regression coverage for the orphaned processAudio() watchInterval that used
// to live in listen/page.tsx: a plain setInterval with an async callback, no
// cleanup, and a "push anyway" fallback even after verification failed. That
// let a completed job push the user to /conversation seconds later — after
// they had already navigated elsewhere or into a DIFFERENT meeting — which
// is what this hook (and its host, listen/page.tsx) now prevents.

function baseParams(overrides: Partial<Parameters<typeof useProcessingCompletion>[0]> = {}) {
  return {
    completedJobId: null,
    failedJobId: null,
    failedJobError: null,
    acknowledgeJobCompletion: vi.fn(),
    onNavigateToConversation: vi.fn(),
    verifyConversationExists: vi.fn().mockResolvedValue(true),
    onVerifyFailed: vi.fn(),
    onProcessingFailed: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useProcessingCompletion — success path', () => {
  it('navigates to the completed job exactly once, after verifying it exists', async () => {
    const params = baseParams({ completedJobId: 'job-b' });
    renderHook((p) => useProcessingCompletion(p), { initialProps: params });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(params.verifyConversationExists).toHaveBeenCalledWith('job-b');
    expect(params.onNavigateToConversation).toHaveBeenCalledTimes(1);
    expect(params.onNavigateToConversation).toHaveBeenCalledWith('job-b');
    expect(params.acknowledgeJobCompletion).toHaveBeenCalledTimes(1);
  });

  it('retries verification a few times before succeeding, still navigating exactly once', async () => {
    const verify = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const params = baseParams({ completedJobId: 'job-b', verifyConversationExists: verify });
    renderHook((p) => useProcessingCompletion(p), { initialProps: params });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(verify).toHaveBeenCalledTimes(3);
    expect(params.onNavigateToConversation).toHaveBeenCalledTimes(1);
  });
});

describe('useProcessingCompletion — verification never succeeds', () => {
  it('does not navigate (would 404) — reports a verify failure instead', async () => {
    const params = baseParams({
      completedJobId: 'job-b',
      verifyConversationExists: vi.fn().mockResolvedValue(false),
    });
    renderHook((p) => useProcessingCompletion(p), { initialProps: params });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(params.onNavigateToConversation).not.toHaveBeenCalled();
    expect(params.onVerifyFailed).toHaveBeenCalledTimes(1);
    expect(params.acknowledgeJobCompletion).toHaveBeenCalledTimes(1);
  });
});

describe('useProcessingCompletion — unmounted before verification settles', () => {
  it('does not navigate once the component has unmounted (user navigated away)', async () => {
    const params = baseParams({ completedJobId: 'job-b' });
    // Verification takes a while — the user navigates away before it resolves.
    let resolveVerify!: (v: boolean) => void;
    params.verifyConversationExists = vi.fn(() => new Promise((r) => { resolveVerify = r; }));

    const { unmount } = renderHook((p) => useProcessingCompletion(p), { initialProps: params });
    unmount();

    resolveVerify(true);
    await act(async () => {
      await Promise.resolve();
    });

    expect(params.onNavigateToConversation).not.toHaveBeenCalled();
    // Left un-acknowledged on purpose: the always-mounted FloatingStatusIndicator
    // is the one that reacts to it now and offers a toast + link instead.
    expect(params.acknowledgeJobCompletion).not.toHaveBeenCalled();
  });
});

describe('useProcessingCompletion — failed job', () => {
  it('reports the failure and acknowledges, without ever navigating', async () => {
    const params = baseParams({ failedJobId: 'job-c', failedJobError: 'boom' });
    renderHook((p) => useProcessingCompletion(p), { initialProps: params });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(params.onProcessingFailed).toHaveBeenCalledWith('boom');
    expect(params.onNavigateToConversation).not.toHaveBeenCalled();
    expect(params.acknowledgeJobCompletion).toHaveBeenCalledTimes(1);
  });
});
