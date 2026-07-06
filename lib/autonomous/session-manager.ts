const MAX_BUFFER_SAMPLES = 30 * 60 * 16_000; // 30 min × 16 kHz mono

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataLen = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const view = new DataView(buf);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLen, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buf;
}

export class SessionManager {
  private _buffer: Float32Array[] = [];
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _silenceMs: number;

  onSessionReady: ((blob: Blob) => void) | null = null;

  constructor(silenceMinutes: number) {
    this._silenceMs = silenceMinutes * 60_000;
  }

  get utteranceCount(): number {
    return this._buffer.length;
  }

  setSilenceMinutes(minutes: number): void {
    this._silenceMs = minutes * 60_000;
  }

  addUtterance(audio: Float32Array): void {
    const totalBuffered = this._buffer.reduce((n, a) => n + a.length, 0);
    if (totalBuffered > 0 && totalBuffered + audio.length > MAX_BUFFER_SAMPLES) {
      // Auto-flush before the buffer exceeds the 30-min memory cap
      this._clearTimer();
      this._emit();
    }
    this._buffer.push(audio);
    this._resetTimer();
  }

  flushNow(): void {
    if (this._buffer.length === 0) return;
    this._clearTimer();
    this._emit();
  }

  clear(): void {
    this._clearTimer();
    this._buffer = [];
  }

  private _resetTimer(): void {
    this._clearTimer();
    this._timer = setTimeout(() => this._emit(), this._silenceMs);
  }

  private _clearTimer(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  private _emit(): void {
    if (this._buffer.length === 0) return;
    const totalLen = this._buffer.reduce((n, a) => n + a.length, 0);
    const merged = new Float32Array(totalLen);
    let offset = 0;
    for (const chunk of this._buffer) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    const wavBuffer = encodeWav(merged, 16000);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    this._buffer = [];
    this._timer = null;
    this.onSessionReady?.(blob);
  }
}
