// jsdom implements neither MediaRecorder nor navigator.mediaDevices. These
// fakes let tests exercise the real GlobalStateProvider recording lifecycle
// end-to-end (start/stop/cancel/switch) instead of re-simulating its logic.
import { vi } from 'vitest';

export class FakeMediaRecorder {
  private static supportedTypes = new Set(['audio/webm']);

  static isTypeSupported(type: string): boolean {
    return FakeMediaRecorder.supportedTypes.has(type.split(';')[0]);
  }

  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  readonly stream: MediaStream;
  readonly mimeType: string;
  readonly audioBitsPerSecond?: number;

  constructor(stream: MediaStream, options?: { mimeType?: string; audioBitsPerSecond?: number }) {
    this.stream = stream;
    this.mimeType = options?.mimeType ?? 'audio/webm';
    this.audioBitsPerSecond = options?.audioBitsPerSecond;
  }

  start(_timesliceMs?: number) {
    this.state = 'recording';
  }

  stop() {
    if (this.state === 'inactive') return;
    this.state = 'inactive';
    this.onstop?.();
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  emitData(data: Blob) {
    this.ondataavailable?.({ data });
  }
}

export function installFakeMediaRecorder() {
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
}

/** navigator.mediaDevices, with devicechange support via a real EventTarget. */
export class FakeMediaDevices extends EventTarget {
  getUserMedia = vi.fn();
  enumerateDevices = vi.fn().mockResolvedValue([]);
}

export function installFakeMediaDevices(): FakeMediaDevices {
  const mediaDevices = new FakeMediaDevices();
  Object.defineProperty(navigator, 'mediaDevices', {
    value: mediaDevices,
    configurable: true,
  });
  return mediaDevices;
}
