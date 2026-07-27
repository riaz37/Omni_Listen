// The hot-swap core behind the mic picker. A recording is fed from a single
// MediaStreamAudioDestinationNode whose upstream source can be swapped for a
// different device mid-recording without ever stopping the MediaRecorder —
// so the encoder, the WebM cluster/timecode chain, and the vault chunk
// sequence all stay untouched across a device switch.
//
//   mic A ─┐
//          ├▶ source ▶ gain ▶ Analyser ▶ MediaStreamDestination ▶ (MediaRecorder reads this)
//   mic B ─┘   (swapSource splices here)
//
// AnalyserNode is a pass-through node, so the same chain both meters the
// level (getRms) and feeds the recorder — there is only ever one graph.

const DEFAULT_CROSSFADE_MS = 60;

export interface MicGraphHooks {
  /** Fired when the currently-active track mutes/unmutes (e.g. hardware mute). */
  onTrackMute?: (muted: boolean) => void;
  /** Fired when the currently-active track ends unexpectedly (e.g. device unplugged). */
  onTrackEnded?: () => void;
}

interface SourceEntry {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  gain: GainNode;
}

export class MicGraph {
  private readonly ctx: AudioContext;
  private readonly analyser: AnalyserNode;
  private readonly dest: MediaStreamAudioDestinationNode;
  private readonly hooks: MicGraphHooks;
  private readonly rmsBuffer: Uint8Array<ArrayBuffer>;

  private current: SourceEntry | null = null;
  private pending: { timer: ReturnType<typeof setTimeout>; entry: SourceEntry }[] = [];
  private closed = false;

  private constructor(
    ctx: AudioContext,
    analyser: AnalyserNode,
    dest: MediaStreamAudioDestinationNode,
    hooks: MicGraphHooks,
  ) {
    this.ctx = ctx;
    this.analyser = analyser;
    this.dest = dest;
    this.hooks = hooks;
    this.rmsBuffer = new Uint8Array(analyser.fftSize);
  }

  static async create(initialStream: MediaStream, hooks: MicGraphHooks = {}): Promise<MicGraph> {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextCtor();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    // Prefer a mono destination: the constructor form is the only reliable
    // way to fix the emitted stream at 1 channel (mutating .channelCount on
    // createMediaStreamDestination()'s result does not change its output).
    // A mono mic upmixed to stereo roughly doubles file size for no benefit.
    let dest: MediaStreamAudioDestinationNode;
    try {
      dest = new MediaStreamAudioDestinationNode(ctx, {
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
      });
    } catch {
      dest = ctx.createMediaStreamDestination(); // 2-channel fallback (older Safari)
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.connect(dest);

    const graph = new MicGraph(ctx, analyser, dest, hooks);
    await graph.swapSource(initialStream, { crossfadeMs: 0 });
    return graph;
  }

  /** The stable stream MediaRecorder should be constructed on — never changes across swaps. */
  get stream(): MediaStream {
    return this.dest.stream;
  }

  /** The raw mic stream currently feeding the graph. */
  get activeStream(): MediaStream | null {
    return this.current?.stream ?? null;
  }

  get contextState(): AudioContextState {
    return this.ctx.state;
  }

  /**
   * Splices a new mic stream into the graph. The previous source is faded
   * out and only stopped once the fade completes, so there is never a
   * silent gap and the switch produces no click. MediaRecorder is never
   * touched — the destination stream's identity is stable across calls.
   */
  async swapSource(stream: MediaStream, opts: { crossfadeMs?: number } = {}): Promise<void> {
    if (this.closed) throw new Error('MicGraph is closed');
    const crossfadeMs = opts.crossfadeMs ?? DEFAULT_CROSSFADE_MS;
    const now = this.ctx.currentTime;

    const source = this.ctx.createMediaStreamSource(stream);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    source.connect(gain);
    gain.connect(this.analyser);
    gain.gain.linearRampToValueAtTime(1, now + crossfadeMs / 1000);

    this.bindTrackHooks(stream);

    const previous = this.current;
    this.current = { stream, source, gain };

    if (previous) {
      previous.gain.gain.cancelScheduledValues(now);
      previous.gain.gain.setValueAtTime(previous.gain.gain.value, now);
      previous.gain.gain.linearRampToValueAtTime(0, now + crossfadeMs / 1000);

      const timer = setTimeout(() => {
        this.teardownEntry(previous);
        this.pending = this.pending.filter((p) => p.timer !== timer);
      }, crossfadeMs + 20);
      this.pending.push({ timer, entry: previous });
    }
  }

  private bindTrackHooks(stream: MediaStream): void {
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    track.onmute = () => this.hooks.onTrackMute?.(true);
    track.onunmute = () => this.hooks.onTrackMute?.(false);
    track.onended = () => this.hooks.onTrackEnded?.();
  }

  private teardownEntry(entry: SourceEntry): void {
    entry.source.disconnect();
    entry.gain.disconnect();
    entry.stream.getTracks().forEach((t) => t.stop());
  }

  getRms(): number {
    this.analyser.getByteTimeDomainData(this.rmsBuffer);
    let sumSquares = 0;
    for (let i = 0; i < this.rmsBuffer.length; i++) {
      const normalized = (this.rmsBuffer[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / this.rmsBuffer.length);
  }

  async ensureRunning(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume().catch(() => {});
    }
  }

  /** Tears down everything — including any stream still mid-crossfade — and releases the mic(s). */
  async close(): Promise<void> {
    this.closed = true;

    this.pending.forEach(({ timer, entry }) => {
      clearTimeout(timer);
      this.teardownEntry(entry);
    });
    this.pending = [];

    if (this.current) {
      this.teardownEntry(this.current);
      this.current = null;
    }

    this.analyser.disconnect();
    try {
      await this.ctx.close();
    } catch {
      // already closed
    }
  }
}
