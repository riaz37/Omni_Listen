// jsdom implements neither AudioContext nor MediaStream, so mic-graph.ts
// (and its tests) need a minimal stand-in for the handful of Web Audio APIs
// it touches: createGain/createAnalyser/createMediaStreamSource/
// createMediaStreamDestination, the mono MediaStreamAudioDestinationNode
// constructor form, and AudioParam scheduling (setValueAtTime /
// linearRampToValueAtTime / cancelScheduledValues). It is not a faithful
// audio engine — there is no real signal path — it exists so MicGraph's
// *wiring and scheduling logic* can be asserted on directly.
import { vi } from 'vitest';

export interface FakeTrack {
  readonly kind: 'audio';
  stopped: boolean;
  onmute: (() => void) | null;
  onunmute: (() => void) | null;
  onended: (() => void) | null;
  stop: () => void;
  getSettings: () => { deviceId?: string };
}

export function fakeTrack(deviceId?: string): FakeTrack {
  const track: FakeTrack = {
    kind: 'audio',
    stopped: false,
    onmute: null,
    onunmute: null,
    onended: null,
    stop: () => {
      track.stopped = true;
    },
    getSettings: () => (deviceId ? { deviceId } : {}),
  };
  return track;
}

export function fakeMediaStream(track: FakeTrack): MediaStream {
  return {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
}

type ScheduledEvent = { type: 'set' | 'ramp' | 'cancel'; value: number; time: number };

export class FakeAudioParam {
  value = 0;
  private scheduled: ScheduledEvent[] = [];

  setValueAtTime(value: number, time: number) {
    this.value = value;
    this.scheduled.push({ type: 'set', value, time });
    return this;
  }

  linearRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.scheduled.push({ type: 'ramp', value, time });
    return this;
  }

  cancelScheduledValues(time: number) {
    this.scheduled.push({ type: 'cancel', value: NaN, time });
    return this;
  }

  history(): readonly ScheduledEvent[] {
    return this.scheduled;
  }
}

class FakeAudioNode {
  connectedTo: FakeAudioNode[] = [];
  disconnected = false;

  connect(dest: FakeAudioNode) {
    this.connectedTo.push(dest);
    return dest;
  }

  disconnect() {
    this.disconnected = true;
    this.connectedTo = [];
  }
}

export class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam();
}

export class FakeMediaStreamAudioSourceNode extends FakeAudioNode {
  constructor(public mediaStream: MediaStream) {
    super();
  }
}

export class FakeAnalyserNode extends FakeAudioNode {
  fftSize = 2048;
  /** Test hook — not part of the real API. Sets the RMS getByteTimeDomainData should produce. */
  private level = 0;

  setLevel(rms: number) {
    this.level = Math.max(0, Math.min(1, rms));
  }

  getByteTimeDomainData(arr: Uint8Array) {
    const amplitude = this.level * 127;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = 128 + (i % 2 === 0 ? amplitude : -amplitude);
    }
  }
}

export class FakeMediaStreamAudioDestinationNode extends FakeAudioNode {
  static instances: FakeMediaStreamAudioDestinationNode[] = [];

  channelCount: number;
  channelCountMode: string;
  channelInterpretation: string;
  stream: MediaStream;

  constructor(
    _ctx: unknown,
    opts?: { channelCount?: number; channelCountMode?: string; channelInterpretation?: string },
  ) {
    super();
    this.channelCount = opts?.channelCount ?? 2;
    this.channelCountMode = opts?.channelCountMode ?? 'max';
    this.channelInterpretation = opts?.channelInterpretation ?? 'speakers';
    this.stream = { getTracks: () => [], getAudioTracks: () => [] } as unknown as MediaStream;
    FakeMediaStreamAudioDestinationNode.instances.push(this);
  }
}

export class FakeAudioContext {
  state: 'running' | 'suspended' | 'closed' = 'running';
  currentTime = 0;

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.state = 'closed';
  }

  createGain() {
    return new FakeGainNode();
  }

  createAnalyser() {
    return new FakeAnalyserNode();
  }

  createMediaStreamSource(stream: MediaStream) {
    return new FakeMediaStreamAudioSourceNode(stream);
  }

  createMediaStreamDestination() {
    return new FakeMediaStreamAudioDestinationNode(this);
  }
}

/**
 * Installs the fakes as globals for the duration of a test. Pass
 * `supportsMonoConstructor: false` to simulate a browser where
 * `new MediaStreamAudioDestinationNode(...)` throws, forcing MicGraph onto
 * its `createMediaStreamDestination()` 2-channel fallback path.
 */
export function installFakeWebAudio(opts: { supportsMonoConstructor?: boolean } = {}) {
  FakeMediaStreamAudioDestinationNode.instances = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);

  if (opts.supportsMonoConstructor ?? true) {
    vi.stubGlobal('MediaStreamAudioDestinationNode', FakeMediaStreamAudioDestinationNode);
  } else {
    vi.stubGlobal(
      'MediaStreamAudioDestinationNode',
      class {
        constructor() {
          throw new TypeError('Illegal constructor');
        }
      },
    );
  }
}
