import type { InferenceSession } from 'onnxruntime-web';
import type { LoadingProgress } from './types';

const DB_NAME = 'autonomous-models';
const DB_VERSION = 1;
const MODEL_KEY = 'yamnet_3s';
const SPEECH_CLASSES = [0, 1, 6, 7, 8];
const SPEECH_THRESHOLD = 0.3;
const TARGET_SAMPLES = 48_000; // 3 seconds at 16 kHz — fixed input window

let _ort: typeof import('onnxruntime-web') | null = null;

async function getOrt() {
  if (!_ort) {
    _ort = await import('onnxruntime-web');
    try {
      _ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/';
      // numThreads=1 triggers ORT 1.17.x to use non-threaded WASM (no SharedArrayBuffer needed)
      _ort.env.wasm.numThreads = 1;
    } catch {
      // env may not be configurable in some environments
    }
  }
  return _ort;
}

async function openModelDB() {
  const { openDB } = await import('idb');
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('models')) {
        db.createObjectStore('models');
      }
    },
  });
}

export class YamnetInference {
  private _session: InferenceSession | null = null;

  static async isModelCached(): Promise<boolean> {
    try {
      const db = await openModelDB();
      const buf = await db.get('models', MODEL_KEY);
      return !!buf;
    } catch {
      return false;
    }
  }

  async load(
    modelUrl: string,
    onProgress: (p: LoadingProgress) => void,
  ): Promise<void> {
    let buffer: ArrayBuffer | undefined;

    try {
      const db = await openModelDB();
      buffer = await db.get('models', MODEL_KEY);
      if (!buffer) {
        buffer = await this._fetchWithProgress(modelUrl, onProgress);
        try {
          await db.put('models', buffer, MODEL_KEY);
        } catch {
          // Non-fatal: cache write failed, continue without caching
        }
      }
    } catch {
      // IndexedDB unavailable (private browsing, quota) — fetch directly
      buffer = await this._fetchWithProgress(modelUrl, onProgress);
    }

    onProgress({ phase: 'initializing', percent: 95 });
    const ort = await getOrt();
    this._session = await ort.InferenceSession.create(buffer!, {
      executionProviders: ['wasm'],
    });
    onProgress({ phase: 'initializing', percent: 100 });
  }

  dispose(): void {
    this._session = null;
  }

  async isSpeech(audio: Float32Array): Promise<boolean> {
    if (!this._session) return true;

    // Pad short utterances or trim long ones to the fixed 3-second window
    let samples: Float32Array;
    if (audio.length >= TARGET_SAMPLES) {
      samples = audio.subarray(0, TARGET_SAMPLES);
    } else {
      samples = new Float32Array(TARGET_SAMPLES);
      samples.set(audio);
    }

    const ort = await getOrt();
    const inputName = this._session.inputNames[0];
    const input = new ort.Tensor('float32', samples, [1, TARGET_SAMPLES]);

    try {
      const outputs = await this._session.run({ [inputName]: input });

      // The model has multiple outputs; find the one with 521 AudioSet class scores
      let scores: Float32Array | null = null;
      for (const name of this._session.outputNames) {
        const tensor = outputs[name];
        if (tensor?.data.length === 521) {
          scores = tensor.data as Float32Array;
          break;
        }
      }
      if (!scores) return true; // fail-open: no 521-class output found

      for (const cls of SPEECH_CLASSES) {
        if (scores[cls] > SPEECH_THRESHOLD) return true;
      }
      return false;
    } catch {
      return true;
    }
  }

  private async _fetchWithProgress(
    url: string,
    onProgress: (p: LoadingProgress) => void,
  ): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch model: ${response.status}`);
    const contentLength = Number(response.headers.get('Content-Length') ?? 0);
    if (!response.body) throw new Error('Response body is null');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      const percent = contentLength
        ? Math.round((loaded / contentLength) * 90)
        : 0;
      onProgress({
        phase: 'downloading',
        percent,
        bytesLoaded: loaded,
        bytesTotal: contentLength || undefined,
      });
    }

    const merged = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged.buffer;
  }
}
