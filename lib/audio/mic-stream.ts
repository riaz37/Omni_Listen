import { buildAudioConstraints } from '@/lib/mic-preference';

export interface AcquiredMicStream {
  stream: MediaStream;
  /** The deviceId actually in effect — null when recording from the system default. */
  deviceId: string | null;
  /** True when the requested device could not be opened and we fell back to default. */
  fellBackToDefault: boolean;
}

/**
 * Opens a mic stream for the given device, falling back to the system
 * default exactly once if the requested device has gone away
 * (OverconstrainedError, or NotFoundError when a specific device was asked
 * for). Any other error — most commonly NotAllowedError — is rethrown
 * unchanged so the existing permission-error toasts keep working.
 */
export async function acquireMicStream(deviceId: string | null): Promise<AcquiredMicStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: buildAudioConstraints(deviceId) });
    return { stream, deviceId, fellBackToDefault: false };
  } catch (err) {
    const name = (err as DOMException)?.name;
    const shouldFallBack = deviceId !== null && (name === 'OverconstrainedError' || name === 'NotFoundError');
    if (!shouldFallBack) throw err;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: buildAudioConstraints(null) });
    return { stream, deviceId: null, fellBackToDefault: true };
  }
}
