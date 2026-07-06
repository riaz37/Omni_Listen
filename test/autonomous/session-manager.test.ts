import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '@/lib/autonomous/session-manager';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SessionManager.addUtterance', () => {
  it('increments utterance count', () => {
    const sm = new SessionManager(5);
    sm.addUtterance(new Float32Array(16000));
    sm.addUtterance(new Float32Array(16000));
    expect(sm.utteranceCount).toBe(2);
  });
});

describe('SessionManager silence timer', () => {
  it('fires onSessionReady after configured silence minutes', async () => {
    const onReady = vi.fn();
    const sm = new SessionManager(1);
    sm.onSessionReady = onReady;
    sm.addUtterance(new Float32Array(16000));

    vi.advanceTimersByTime(60_000); // 1 minute

    expect(onReady).toHaveBeenCalledTimes(1);
    const blob: Blob = onReady.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('audio/wav');
  });

  it('resets timer when a new utterance arrives', () => {
    const onReady = vi.fn();
    const sm = new SessionManager(1);
    sm.onSessionReady = onReady;

    sm.addUtterance(new Float32Array(16000));
    vi.advanceTimersByTime(50_000);
    sm.addUtterance(new Float32Array(16000)); // resets timer
    vi.advanceTimersByTime(50_000);           // only 50s since last utterance
    expect(onReady).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10_001);           // now 60s since last utterance
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('does not fire if no utterances were added', () => {
    const onReady = vi.fn();
    const sm = new SessionManager(1);
    sm.onSessionReady = onReady;
    vi.advanceTimersByTime(120_000);
    expect(onReady).not.toHaveBeenCalled();
  });
});

describe('SessionManager.clear', () => {
  it('resets utterance count and cancels pending timer', () => {
    const onReady = vi.fn();
    const sm = new SessionManager(1);
    sm.onSessionReady = onReady;
    sm.addUtterance(new Float32Array(16000));
    sm.clear();
    expect(sm.utteranceCount).toBe(0);
    vi.advanceTimersByTime(120_000);
    expect(onReady).not.toHaveBeenCalled();
  });
});

describe('SessionManager.flushNow', () => {
  it('fires onSessionReady immediately with buffered audio', () => {
    const onReady = vi.fn();
    const sm = new SessionManager(5);
    sm.onSessionReady = onReady;
    sm.addUtterance(new Float32Array(8000));
    sm.flushNow();
    expect(onReady).toHaveBeenCalledTimes(1);
    const blob: Blob = onReady.mock.calls[0][0];
    expect(blob).toBeInstanceOf(Blob);
  });
});
