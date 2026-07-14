import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadWithStallRetry,
  isTransportError,
  UPLOAD_STALL_TIMEOUT_MS,
} from '@/lib/upload-stall';

// Simulates an axios-like attempt: the caller receives the abort signal and a
// progress emitter, and we control time with fake timers.
type Progress = (e: { loaded: number; total?: number }) => void;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('uploadWithStallRetry — stall detection', () => {
  it('aborts when no bytes move for the stall window', async () => {
    let signal: AbortSignal | undefined;
    const attempt = (s: AbortSignal, _onProgress: Progress) =>
      new Promise((_resolve, reject) => {
        signal = s;
        s.addEventListener('abort', () => reject(new Error('canceled')));
      });

    const promise = uploadWithStallRetry(attempt, { retries: 0 });
    const expectation = expect(promise).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(UPLOAD_STALL_TIMEOUT_MS + 1);

    await expectation;
    expect(signal?.aborted).toBe(true);
  });

  it('does NOT abort while bytes keep moving, even past the stall window', async () => {
    const attempt = (s: AbortSignal, onProgress: Progress) =>
      new Promise<string>((resolve, reject) => {
        s.addEventListener('abort', () => reject(new Error('canceled')));
        // Emit progress every 30s for 3 minutes (total > stall window), then finish.
        let loaded = 0;
        const tick = setInterval(() => {
          loaded += 1000;
          onProgress({ loaded, total: 7000 });
          if (loaded >= 6000) {
            clearInterval(tick);
            resolve('done');
          }
        }, 30_000);
      });

    const promise = uploadWithStallRetry(attempt, { retries: 0 });
    await vi.advanceTimersByTimeAsync(6 * 30_000 + 1);

    await expect(promise).resolves.toBe('done');
  });

  it('a repeated progress event with the same byte count does not reset the stall timer', async () => {
    let signal: AbortSignal | undefined;
    const attempt = (s: AbortSignal, onProgress: Progress) =>
      new Promise((_resolve, reject) => {
        signal = s;
        s.addEventListener('abort', () => reject(new Error('canceled')));
        // Same loaded value re-emitted forever — a stalled connection that
        // still fires events must not be treated as alive.
        setInterval(() => onProgress({ loaded: 500, total: 1000 }), 5_000);
      });

    const promise = uploadWithStallRetry(attempt, { retries: 0 });
    const expectation = expect(promise).rejects.toThrow();

    // First event arrives at 5s and legitimately resets the timer once.
    await vi.advanceTimersByTimeAsync(5_000 + UPLOAD_STALL_TIMEOUT_MS + 1);

    await expectation;
    expect(signal?.aborted).toBe(true);
  });
});

describe('uploadWithStallRetry — progress reporting', () => {
  it('reports whole-number percentages to onProgress', async () => {
    const seen: number[] = [];
    const attempt = (_s: AbortSignal, onProgress: Progress) => {
      onProgress({ loaded: 250, total: 1000 });
      onProgress({ loaded: 999, total: 1000 });
      return Promise.resolve('ok');
    };

    await uploadWithStallRetry(attempt, { onProgress: (pct) => seen.push(pct) });
    expect(seen).toEqual([25, 99]);
  });

  it('omits percentage callbacks when total is unknown', async () => {
    const seen: number[] = [];
    const attempt = (_s: AbortSignal, onProgress: Progress) => {
      onProgress({ loaded: 250 });
      return Promise.resolve('ok');
    };

    await uploadWithStallRetry(attempt, { onProgress: (pct) => seen.push(pct) });
    expect(seen).toEqual([]);
  });
});

describe('uploadWithStallRetry — retry policy', () => {
  it('retries once after a stall and succeeds on the second attempt', async () => {
    let calls = 0;
    const attempt = (s: AbortSignal, _onProgress: Progress) => {
      calls++;
      if (calls === 1) {
        return new Promise((_resolve, reject) => {
          s.addEventListener('abort', () => reject(new Error('canceled')));
        });
      }
      return Promise.resolve('second-time-lucky');
    };

    const promise = uploadWithStallRetry(attempt);
    await vi.advanceTimersByTimeAsync(UPLOAD_STALL_TIMEOUT_MS + 1);

    await expect(promise).resolves.toBe('second-time-lucky');
    expect(calls).toBe(2);
  });

  it('does not retry when the server actually responded (axios error with response)', async () => {
    let calls = 0;
    const serverError = Object.assign(new Error('Request failed with status code 500'), {
      isAxiosError: true,
      response: { status: 500 },
    });
    const attempt = () => {
      calls++;
      return Promise.reject(serverError);
    };

    await expect(uploadWithStallRetry(attempt)).rejects.toBe(serverError);
    expect(calls).toBe(1);
  });

  it('gives up after the retry also stalls', async () => {
    let calls = 0;
    const attempt = (s: AbortSignal, _onProgress: Progress) => {
      calls++;
      return new Promise((_resolve, reject) => {
        s.addEventListener('abort', () => reject(new Error('canceled')));
      });
    };

    const promise = uploadWithStallRetry(attempt);
    const expectation = expect(promise).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(2 * (UPLOAD_STALL_TIMEOUT_MS + 1));

    await expectation;
    expect(calls).toBe(2);
  });

  it('retries a network error where no response ever arrived', async () => {
    let calls = 0;
    const networkError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      code: 'ERR_NETWORK',
    });
    const attempt = () => {
      calls++;
      return calls === 1 ? Promise.reject(networkError) : Promise.resolve('recovered');
    };

    await expect(uploadWithStallRetry(attempt)).resolves.toBe('recovered');
    expect(calls).toBe(2);
  });
});

describe('isTransportError', () => {
  it('classifies axios errors without a response as transport failures', () => {
    expect(isTransportError(Object.assign(new Error('x'), { isAxiosError: true, code: 'ERR_NETWORK' }))).toBe(true);
    expect(isTransportError(Object.assign(new Error('x'), { isAxiosError: true, code: 'ERR_CANCELED' }))).toBe(true);
    expect(isTransportError(Object.assign(new Error('x'), { isAxiosError: true }))).toBe(true);
  });

  it('does not classify responses or programmer errors as transport failures', () => {
    expect(isTransportError(Object.assign(new Error('500'), { isAxiosError: true, response: { status: 500 } }))).toBe(false);
    expect(isTransportError(new TypeError('undefined is not a function'))).toBe(false);
  });
});
