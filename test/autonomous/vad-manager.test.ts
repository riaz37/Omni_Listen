import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MicVAD } from '@ricky0123/vad-web';
import { VadManager } from '@/lib/autonomous/vad-manager';
import { writeMicPreference } from '@/lib/mic-preference';

vi.mock('@ricky0123/vad-web', () => ({
  MicVAD: { new: vi.fn() },
}));

function fakeStream(): MediaStream {
  return { getTracks: () => [], getAudioTracks: () => [] } as unknown as MediaStream;
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(MicVAD.new).mockResolvedValue({
    start: vi.fn(),
    pause: vi.fn(),
    destroy: vi.fn(),
  } as any);
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue(fakeStream()),
      enumerateDevices: vi.fn().mockResolvedValue([
        { deviceId: 'id-a', label: 'Built-in Microphone', kind: 'audioinput', groupId: 'g1', toJSON: () => ({}) },
        { deviceId: 'id-b', label: 'USB Headset', kind: 'audioinput', groupId: 'g1', toJSON: () => ({}) },
      ]),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('VadManager — device-aware getStream/resumeStream', () => {
  it('passes both getStream and resumeStream to MicVAD.new (regression: overriding only getStream silently drops the deviceId on resume)', async () => {
    const manager = new VadManager();
    await manager.init(0.5, { onSpeechStart: vi.fn(), onSpeechEnd: vi.fn(), onError: vi.fn() });

    const options = vi.mocked(MicVAD.new).mock.calls[0][0] as any;
    expect(typeof options.getStream).toBe('function');
    expect(typeof options.resumeStream).toBe('function');
  });

  it('getStream requests the exact preferred device with a mono channel constraint', async () => {
    writeMicPreference({ deviceId: 'id-b', label: 'USB Headset' });
    const manager = new VadManager();
    await manager.init(0.5, { onSpeechStart: vi.fn(), onSpeechEnd: vi.fn(), onError: vi.fn() });

    const options = vi.mocked(MicVAD.new).mock.calls[0][0] as any;
    await options.getStream();

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: expect.objectContaining({ channelCount: 1, deviceId: { exact: 'id-b' } }),
    });
  });

  it('resumeStream requests the SAME preferred device — not the library default (channelCount:1 only, no deviceId)', async () => {
    writeMicPreference({ deviceId: 'id-b', label: 'USB Headset' });
    const manager = new VadManager();
    await manager.init(0.5, { onSpeechStart: vi.fn(), onSpeechEnd: vi.fn(), onError: vi.fn() });

    const options = vi.mocked(MicVAD.new).mock.calls[0][0] as any;
    await options.resumeStream(fakeStream());

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: expect.objectContaining({ channelCount: 1, deviceId: { exact: 'id-b' } }),
    });
  });

  it('falls back to the system default (still mono) when the preferred device is unavailable', async () => {
    writeMicPreference({ deviceId: 'id-gone', label: 'Unplugged Mic' });
    const manager = new VadManager();
    await manager.init(0.5, { onSpeechStart: vi.fn(), onSpeechEnd: vi.fn(), onError: vi.fn() });

    const options = vi.mocked(MicVAD.new).mock.calls[0][0] as any;
    await options.getStream();

    const call = vi.mocked(navigator.mediaDevices.getUserMedia).mock.calls[0][0] as any;
    expect(call.audio.channelCount).toBe(1);
    expect(call.audio).not.toHaveProperty('deviceId');
  });

  it('retries against the default device on OverconstrainedError', async () => {
    writeMicPreference({ deviceId: 'id-b', label: 'USB Headset' });
    vi.mocked(navigator.mediaDevices.getUserMedia)
      .mockRejectedValueOnce(new DOMException('overconstrained', 'OverconstrainedError'))
      .mockResolvedValueOnce(fakeStream());

    const manager = new VadManager();
    await manager.init(0.5, { onSpeechStart: vi.fn(), onSpeechEnd: vi.fn(), onError: vi.fn() });
    const options = vi.mocked(MicVAD.new).mock.calls[0][0] as any;

    const stream = await options.getStream();

    expect(stream).toBeDefined();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
    const secondCall = vi.mocked(navigator.mediaDevices.getUserMedia).mock.calls[1][0] as any;
    expect(secondCall.audio).not.toHaveProperty('deviceId');
  });
});
