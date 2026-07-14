/**
 * Stall-aware upload orchestration.
 *
 * A flat request timeout is the wrong tool for a size-dependent upload on a
 * variable connection: a large file on a slow uplink gets killed even though
 * bytes are flowing. Instead we watch upload progress and abort only when NO
 * bytes move for a full stall window, retrying once on transport failures
 * (a stall or a network error where the server never responded).
 */

export const UPLOAD_STALL_TIMEOUT_MS = 60_000;

export interface UploadProgressEvent {
  loaded: number;
  total?: number;
}

export type UploadAttempt<T> = (
  signal: AbortSignal,
  onProgress: (e: UploadProgressEvent) => void,
) => Promise<T>;

export interface UploadWithStallRetryOptions {
  /** ms of zero byte movement before the attempt is aborted */
  stallMs?: number;
  /** additional attempts after the first (default 1) */
  retries?: number;
  /** whole-number percent callback; only fired when total size is known */
  onProgress?: (percent: number) => void;
}

/** True when the request died in transit — the server never sent a response.
 * Covers our own stall aborts (ERR_CANCELED), network drops, and DNS/socket
 * failures. A received response (any status) or a programmer error is NOT a
 * transport failure and must not be retried. */
export function isTransportError(error: unknown): boolean {
  const err = error as { isAxiosError?: boolean; response?: unknown };
  return err?.isAxiosError === true && err.response === undefined;
}

export async function uploadWithStallRetry<T>(
  attempt: UploadAttempt<T>,
  options: UploadWithStallRetryOptions = {},
): Promise<T> {
  const { stallMs = UPLOAD_STALL_TIMEOUT_MS, retries = 1, onProgress } = options;

  const runOnce = async (): Promise<T> => {
    const controller = new AbortController();
    let stalled = false;
    let lastLoaded = -1;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const armStallTimer = (): void => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        stalled = true;
        controller.abort();
      }, stallMs);
    };

    const handleProgress = (e: UploadProgressEvent): void => {
      // Only actual byte movement counts as life; a re-fired event with the
      // same loaded value is still a stalled connection.
      if (e.loaded !== lastLoaded) {
        lastLoaded = e.loaded;
        armStallTimer();
      }
      if (onProgress && e.total && e.total > 0) {
        onProgress(Math.floor((e.loaded / e.total) * 100));
      }
    };

    armStallTimer();
    try {
      return await attempt(controller.signal, handleProgress);
    } catch (error) {
      if (stalled) {
        throw Object.assign(
          new Error(`Upload stalled: no data sent for ${Math.round(stallMs / 1000)}s`),
          { isAxiosError: true, code: 'ERR_CANCELED', cause: error },
        );
      }
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  let attemptsLeft = 1 + Math.max(0, retries);
  for (;;) {
    attemptsLeft--;
    try {
      return await runOnce();
    } catch (error) {
      if (attemptsLeft > 0 && isTransportError(error)) continue;
      throw error;
    }
  }
}
