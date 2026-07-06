import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock onnxruntime-web before importing the module under test
vi.mock('onnxruntime-web', () => ({
  env: { wasm: { wasmPaths: '' } },
  InferenceSession: {
    create: vi.fn(),
  },
  Tensor: vi.fn(function (type: string, data: Float32Array, dims: number[]) { return { type, data, dims }; }),
}));

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

import * as ort from 'onnxruntime-web';
import { openDB } from 'idb';
import { YamnetInference } from '@/lib/autonomous/yamnet-inference';

const mockOrt = ort as unknown as {
  InferenceSession: { create: ReturnType<typeof vi.fn> };
};
const mockOpenDB = openDB as ReturnType<typeof vi.fn>;

function makeScores(speechScore: number): Float32Array {
  // 521 AudioSet classes; class 0 (Speech) set to speechScore, rest zero
  const scores = new Float32Array(521);
  scores[0] = speechScore;
  return scores;
}

function makeSession(runImpl: ReturnType<typeof vi.fn>) {
  return {
    inputNames: ['waveform'],
    // Mimics the model's 3 outputs: spectrogram, embeddings, scores
    outputNames: ['spectrogram', 'embeddings', 'scores'],
    run: runImpl,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  const store = new Map<string, ArrayBuffer>();
  mockOpenDB.mockResolvedValue({
    get: (_storeName: string, key: string) => Promise.resolve(store.get(key)),
    put: (_storeName: string, value: ArrayBuffer, key: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
  });
});

describe('YamnetInference.load', () => {
  it('fetches model from URL when not cached and stores in IndexedDB', async () => {
    const fakeBuffer = new ArrayBuffer(8);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => '8' },
      body: {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array(fakeBuffer) })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    });
    mockOrt.InferenceSession.create.mockResolvedValue(
      makeSession(vi.fn()),
    );

    const yamnet = new YamnetInference();
    await yamnet.load('/models/yamnet_3s.onnx', () => {});

    expect(global.fetch).toHaveBeenCalledWith('/models/yamnet_3s.onnx');
    expect(mockOrt.InferenceSession.create).toHaveBeenCalled();
  });
});

describe('YamnetInference.isSpeech', () => {
  async function buildLoaded(): Promise<YamnetInference> {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => '8' },
      body: {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ done: false, value: new Uint8Array(8) })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    });
    mockOrt.InferenceSession.create.mockResolvedValue(makeSession(vi.fn()));
    const y = new YamnetInference();
    await y.load('/models/yamnet_3s.onnx', () => {});
    return y;
  }

  type SessionHandle = { _session: ReturnType<typeof makeSession> };

  it('returns true when speech class score exceeds threshold', async () => {
    const y = await buildLoaded();
    (y as unknown as SessionHandle)._session.run = vi.fn().mockResolvedValue({
      spectrogram: { data: new Float32Array(64) },
      embeddings:  { data: new Float32Array(1024) },
      scores:      { data: makeScores(0.9) },
    });
    expect(await y.isSpeech(new Float32Array(16000))).toBe(true);
  });

  it('returns false when all speech class scores are below threshold', async () => {
    const y = await buildLoaded();
    (y as unknown as SessionHandle)._session.run = vi.fn().mockResolvedValue({
      spectrogram: { data: new Float32Array(64) },
      embeddings:  { data: new Float32Array(1024) },
      scores:      { data: makeScores(0.1) },
    });
    expect(await y.isSpeech(new Float32Array(16000))).toBe(false);
  });

  it('returns true (fail-open) when inference throws', async () => {
    const y = await buildLoaded();
    (y as unknown as SessionHandle)._session.run = vi.fn().mockRejectedValue(new Error('ONNX error'));
    expect(await y.isSpeech(new Float32Array(16000))).toBe(true);
  });
});
