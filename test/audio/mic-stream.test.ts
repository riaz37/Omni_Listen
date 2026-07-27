import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { acquireMicStream } from '@/lib/audio/mic-stream';

function fakeStream(): MediaStream {
  return { getTracks: () => [], getAudioTracks: () => [] } as unknown as MediaStream;
}

function overconstrainedError(): DOMException {
  return new DOMException('overconstrained', 'OverconstrainedError');
}

function notFoundError(): DOMException {
  return new DOMException('not found', 'NotFoundError');
}

beforeEach(() => {
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi.fn(),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('acquireMicStream', () => {
  it('requests the exact device when a deviceId is given, and reports no fallback on success', async () => {
    const stream = fakeStream();
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockResolvedValueOnce(stream);

    const result = await acquireMicStream('device-b');

    expect(getUserMedia).toHaveBeenCalledWith({
      audio: expect.objectContaining({ deviceId: { exact: 'device-b' } }),
    });
    expect(result).toEqual({ stream, deviceId: 'device-b', fellBackToDefault: false });
  });

  it('requests the system default with no deviceId constraint when null is given', async () => {
    const stream = fakeStream();
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockResolvedValueOnce(stream);

    await acquireMicStream(null);

    const call = getUserMedia.mock.calls[0][0];
    expect(call.audio).not.toHaveProperty('deviceId');
  });

  it('retries once against the system default on OverconstrainedError and reports the fallback', async () => {
    const stream = fakeStream();
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockRejectedValueOnce(overconstrainedError()).mockResolvedValueOnce(stream);

    const result = await acquireMicStream('gone-device');

    expect(getUserMedia).toHaveBeenCalledTimes(2);
    const secondCall = getUserMedia.mock.calls[1][0];
    expect(secondCall.audio).not.toHaveProperty('deviceId');
    expect(result).toEqual({ stream, deviceId: null, fellBackToDefault: true });
  });

  it('retries once against the system default on NotFoundError when a deviceId was requested', async () => {
    const stream = fakeStream();
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockRejectedValueOnce(notFoundError()).mockResolvedValueOnce(stream);

    const result = await acquireMicStream('gone-device');

    expect(getUserMedia).toHaveBeenCalledTimes(2);
    expect(result.fellBackToDefault).toBe(true);
  });

  it('does not retry NotFoundError when no deviceId was requested (nothing to fall back to)', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    const err = notFoundError();
    getUserMedia.mockRejectedValueOnce(err);

    await expect(acquireMicStream(null)).rejects.toBe(err);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('rethrows NotAllowedError unchanged without retrying', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    const err = new DOMException('denied', 'NotAllowedError');
    getUserMedia.mockRejectedValueOnce(err);

    await expect(acquireMicStream('device-b')).rejects.toBe(err);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('rethrows the second error if the fallback attempt also fails', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    const fallbackErr = new DOMException('still broken', 'NotFoundError');
    getUserMedia.mockRejectedValueOnce(overconstrainedError()).mockRejectedValueOnce(fallbackErr);

    await expect(acquireMicStream('device-b')).rejects.toBe(fallbackErr);
  });
});
