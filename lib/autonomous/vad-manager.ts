import { MicVAD } from '@ricky0123/vad-web';
import { readMicPreference, resolveMicDevice, buildAudioConstraints } from '@/lib/mic-preference';

export interface VadManagerCallbacks {
  onSpeechStart: () => void;
  onSpeechEnd: (audio: Float32Array) => void;
  onError: (err: Error) => void;
}

// Honors the mic picker's selected device for Autonomous mode. Mono
// (channelCount: 1) matches the library's own default constraints — the
// VAD model expects a single channel.
//
// IMPORTANT: this same function is passed as BOTH getStream and
// resumeStream. vad-web's default pauseStream() stops all tracks, and its
// default resumeStream() re-acquires with a bare {channelCount:1,
// echoCancellation, autoGainControl, noiseSuppression} — no deviceId. If
// only getStream were overridden, Autonomous mode would silently revert to
// the system default mic after the very first pause/resume cycle.
async function acquireVadStream(): Promise<MediaStream> {
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput');
  const { deviceId } = resolveMicDevice(readMicPreference(), devices);
  const constraints = { channelCount: 1, ...buildAudioConstraints(deviceId) };

  try {
    return await navigator.mediaDevices.getUserMedia({ audio: constraints });
  } catch (err) {
    const shouldFallBack = deviceId !== null && (err as DOMException)?.name === 'OverconstrainedError';
    if (!shouldFallBack) throw err;
    return navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, ...buildAudioConstraints(null) } });
  }
}

export class VadManager {
  private _vad: Awaited<ReturnType<typeof MicVAD.new>> | null = null;
  private _onError: ((err: Error) => void) | null = null;

  async init(threshold: number, callbacks: VadManagerCallbacks): Promise<void> {
    this._onError = callbacks.onError;
    this._vad = await MicVAD.new({
      baseAssetPath: '/',
      onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/',
      model: 'v5',
      positiveSpeechThreshold: threshold,
      negativeSpeechThreshold: Math.max(0, threshold - 0.15),
      minSpeechMs: 160,
      getStream: acquireVadStream,
      resumeStream: acquireVadStream,
      onSpeechStart: callbacks.onSpeechStart,
      onSpeechEnd: callbacks.onSpeechEnd,
    });
  }

  async start(): Promise<void> {
    try {
      await this._vad?.start();
    } catch (err) {
      this._onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  async pause(): Promise<void> {
    try {
      await this._vad?.pause();
    } catch (err) {
      this._onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  async resume(): Promise<void> {
    try {
      await this._vad?.start();
    } catch (err) {
      this._onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }

  destroy(): void {
    this._vad?.destroy();
    this._vad = null;
    this._onError = null;
  }
}
