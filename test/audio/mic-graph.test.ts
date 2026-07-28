import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MicGraph } from '@/lib/audio/mic-graph';
import {
  installFakeWebAudio,
  fakeTrack,
  fakeMediaStream,
  FakeMediaStreamAudioDestinationNode,
  FakeAnalyserNode,
} from '../helpers/fake-web-audio';

beforeEach(() => {
  installFakeWebAudio();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('MicGraph.create', () => {
  it('exposes a stable destination stream and the initial stream as active', async () => {
    const trackA = fakeTrack('device-a');
    const streamA = fakeMediaStream(trackA);

    const graph = await MicGraph.create(streamA);

    expect(graph.activeStream).toBe(streamA);
    expect(graph.stream).toBeDefined();
    expect(graph.contextState).toBe('running');
  });

  it('requests a mono destination when the constructor form is supported', async () => {
    const graph = await MicGraph.create(fakeMediaStream(fakeTrack()));
    void graph;

    const dest = FakeMediaStreamAudioDestinationNode.instances[0];
    expect(dest.channelCount).toBe(1);
    expect(dest.channelCountMode).toBe('explicit');
  });

  it('falls back to the 2-channel destination when the mono constructor is unavailable', async () => {
    installFakeWebAudio({ supportsMonoConstructor: false });

    const graph = await MicGraph.create(fakeMediaStream(fakeTrack()));
    void graph;

    const dest = FakeMediaStreamAudioDestinationNode.instances[0];
    expect(dest.channelCount).toBe(2);
  });
});

describe('MicGraph.swapSource', () => {
  it('ramps the new source in and the old source out over the crossfade window', async () => {
    vi.useFakeTimers();
    const streamA = fakeMediaStream(fakeTrack('device-a'));
    const streamB = fakeMediaStream(fakeTrack('device-b'));
    const graph = await MicGraph.create(streamA);

    await graph.swapSource(streamB, { crossfadeMs: 60 });

    const gains = (graph as unknown as { current: { gain: { gain: { history(): unknown[] } } } }).current.gain.gain.history();
    expect(gains[0]).toMatchObject({ type: 'set', value: 0 });
    expect(gains[1]).toMatchObject({ type: 'ramp', value: 1 });
  });

  it('does not stop the old track until the crossfade completes', async () => {
    vi.useFakeTimers();
    const trackA = fakeTrack('device-a');
    const streamA = fakeMediaStream(trackA);
    const streamB = fakeMediaStream(fakeTrack('device-b'));
    const graph = await MicGraph.create(streamA);

    await graph.swapSource(streamB, { crossfadeMs: 60 });
    expect(trackA.stopped).toBe(false);

    vi.advanceTimersByTime(59);
    expect(trackA.stopped).toBe(false);

    vi.advanceTimersByTime(30);
    expect(trackA.stopped).toBe(true);
  });

  it('switches the active stream to the new device immediately, without waiting for the fade', async () => {
    vi.useFakeTimers();
    const streamA = fakeMediaStream(fakeTrack('device-a'));
    const streamB = fakeMediaStream(fakeTrack('device-b'));
    const graph = await MicGraph.create(streamA);

    await graph.swapSource(streamB, { crossfadeMs: 60 });

    expect(graph.activeStream).toBe(streamB);
  });

  it('re-binds the mute/ended hooks onto the newly active track', async () => {
    const streamA = fakeMediaStream(fakeTrack('device-a'));
    const trackB = fakeTrack('device-b');
    const streamB = fakeMediaStream(trackB);
    const onTrackMute = vi.fn();
    const graph = await MicGraph.create(streamA, { onTrackMute });

    await graph.swapSource(streamB, { crossfadeMs: 0 });
    trackB.onmute?.();

    expect(onTrackMute).toHaveBeenCalledWith(true);
  });
});

describe('MicGraph.getRms', () => {
  it('reads the current RMS level from the analyser', async () => {
    const graph = await MicGraph.create(fakeMediaStream(fakeTrack()));
    const analyser = (graph as unknown as { analyser: FakeAnalyserNode }).analyser;

    analyser.setLevel(0.5);

    expect(graph.getRms()).toBeCloseTo(0.5, 1);
  });
});

describe('MicGraph.ensureRunning', () => {
  it('resumes a suspended context', async () => {
    const graph = await MicGraph.create(fakeMediaStream(fakeTrack()));
    const ctx = (graph as unknown as { ctx: { state: string } }).ctx;
    ctx.state = 'suspended';

    await graph.ensureRunning();

    expect(graph.contextState).toBe('running');
  });
});

describe('MicGraph.close', () => {
  it('stops the active track and closes the context', async () => {
    const trackA = fakeTrack('device-a');
    const graph = await MicGraph.create(fakeMediaStream(trackA));

    await graph.close();

    expect(trackA.stopped).toBe(true);
    expect(graph.contextState).toBe('closed');
  });

  it('immediately stops a stream that was mid-crossfade instead of leaking it', async () => {
    vi.useFakeTimers();
    const trackA = fakeTrack('device-a');
    const streamA = fakeMediaStream(trackA);
    const streamB = fakeMediaStream(fakeTrack('device-b'));
    const graph = await MicGraph.create(streamA);

    await graph.swapSource(streamB, { crossfadeMs: 60 });
    expect(trackA.stopped).toBe(false);

    await graph.close();

    expect(trackA.stopped).toBe(true);
  });

  it('rejects a swapSource call after close', async () => {
    const graph = await MicGraph.create(fakeMediaStream(fakeTrack()));
    await graph.close();

    await expect(graph.swapSource(fakeMediaStream(fakeTrack()))).rejects.toThrow();
  });
});
