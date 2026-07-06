import { MicVAD } from '@ricky0123/vad-web';

export interface VadManagerCallbacks {
  onSpeechStart: () => void;
  onSpeechEnd: (audio: Float32Array) => void;
  onError: (err: Error) => void;
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
