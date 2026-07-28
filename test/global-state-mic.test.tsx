import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GlobalStateProvider, useGlobalState } from '@/lib/global-state-context';
import { installFakeWebAudio, fakeTrack, fakeMediaStream } from './helpers/fake-web-audio';
import { installFakeMediaRecorder, installFakeMediaDevices, FakeMediaDevices, fakeDeviceInfo } from './helpers/fake-media';
import { writeMicPreference, readMicPreference } from '@/lib/mic-preference';

// These exercise the REAL GlobalStateProvider (not a re-implementation) to
// prove the mic hot-swap refactor didn't reopen the "mic stays hot after
// Stop/Cancel" bug and didn't break the existing recorder lifecycle.

let mediaDevices: FakeMediaDevices;

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(() => useGlobalState(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GlobalStateProvider>{children}</GlobalStateProvider>
      </QueryClientProvider>
    ),
  });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  installFakeWebAudio();
  installFakeMediaRecorder();
  mediaDevices = installFakeMediaDevices();
  vi.spyOn(toast, 'error').mockImplementation(() => 't' as any);
  vi.spyOn(toast, 'warning').mockImplementation(() => 't' as any);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('cancelRecording releases the microphone', () => {
  it('stops the mic track even though MediaRecorder now reads from a Web Audio destination stream', async () => {
    const trackA = fakeTrack('device-a');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackA));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });
    expect(trackA.stopped).toBe(false);

    act(() => {
      result.current.cancelRecording();
    });

    expect(trackA.stopped).toBe(true);
  });
});

describe('recorder.onstop releases the microphone', () => {
  it('stops the mic track on a normal stop', async () => {
    const trackA = fakeTrack('device-a');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackA));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });

    act(() => {
      result.current.stopRecording();
    });

    expect(trackA.stopped).toBe(true);
  });
});

describe('mid-recording microphone switch', () => {
  it('never restarts MediaRecorder — same instance, still recording', async () => {
    const trackA = fakeTrack('device-a');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackA));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });
    const recorderBefore = result.current.mediaRecorderRef.current;
    expect(recorderBefore?.state).toBe('recording');

    const trackB = fakeTrack('device-b');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackB));

    await act(async () => {
      await result.current.setMicDevice('device-b', 'USB Headset');
    });

    expect(result.current.mediaRecorderRef.current).toBe(recorderBefore);
    expect(result.current.mediaRecorderRef.current?.state).toBe('recording');
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
    expect(mediaDevices.getUserMedia.mock.calls[1][0]).toEqual({
      audio: expect.objectContaining({ deviceId: { exact: 'device-b' } }),
    });

    act(() => {
      result.current.cancelRecording();
    });
  });

  it('reverts the selection and toasts an error if the new device fails to open, leaving the old mic in place', async () => {
    const trackA = fakeTrack('device-a');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackA));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });

    mediaDevices.getUserMedia.mockRejectedValueOnce(new DOMException('denied', 'NotAllowedError'));

    await act(async () => {
      await result.current.setMicDevice('device-b', 'Broken Mic');
    });

    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.mediaRecorderRef.current?.state).toBe('recording');
    expect(trackA.stopped).toBe(false);
    expect(toast.error).toHaveBeenCalled();

    act(() => {
      result.current.cancelRecording();
    });
  });
});

// Regression coverage for: connect a neckband, select it mid-recording (works),
// stop recording, physically disconnect it — the picker kept showing the dead
// neckband as selected until a stream was next acquired, and even then only
// the id (not the label) was ever corrected. Root cause: both existing
// recovery paths (handleActiveDeviceLost, the devicechange effect) bailed out
// whenever there was no live MicGraph — i.e. always, once idle.
describe('idle microphone disconnect recovery', () => {
  it('falls back to the system default when the selected mic disappears while idle, without discarding the stored preference', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'Neckband Pro' });
    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));

    const { result } = setup();
    expect(result.current.selectedMicId).toBe('device-b');

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.selectedMicLabel).toBe('');
    // The preference is kept (not wiped) so a later replug can re-adopt it.
    expect(readMicPreference()?.deviceId).toBe('device-b');
    // Nothing may open the mic while idle.
    expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('re-adopts the same microphone by label when it is replugged under a new deviceId', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'Neckband Pro' });
    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));

    const { result } = setup();

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });
    expect(result.current.selectedMicId).toBeNull();

    // Replugged — OS assigned it a new deviceId, but the label is unchanged.
    mediaDevices.setDevices(
      fakeDeviceInfo('device-a', 'Built-in Microphone'),
      fakeDeviceInfo('device-b2', 'Neckband Pro'),
    );

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.selectedMicId).toBe('device-b2');
    expect(result.current.selectedMicLabel).toBe('Neckband Pro');
    expect(readMicPreference()?.deviceId).toBe('device-b2');
  });

  it('leaves the selection and the stored preference alone when the selected device is still present', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    mediaDevices.setDevices(
      fakeDeviceInfo('device-a', 'Built-in Microphone'),
      fakeDeviceInfo('device-b', 'USB Headset'),
    );
    const prefBefore = readMicPreference();

    const { result } = setup();

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.selectedMicId).toBe('device-b');
    expect(readMicPreference()?.savedAt).toBe(prefBefore?.savedAt);
  });

  it('does not touch the selection when the device list has no labels (permission not granted)', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    mediaDevices.setDevices(fakeDeviceInfo('', ''));

    const { result } = setup();

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.selectedMicId).toBe('device-b');
  });

  it('re-resolves the selection before opening the mic in startMicPreview, when a devicechange was missed', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    // device-b is already gone from the list, but no devicechange ever fired.
    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    const { result } = setup();
    await act(async () => {
      await result.current.startMicPreview();
    });

    const call = mediaDevices.getUserMedia.mock.calls[0][0];
    expect(call.audio).not.toHaveProperty('deviceId');
    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.selectedMicLabel).toBe('');
    expect(readMicPreference()?.deviceId).toBe('device-b');
    expect(result.current.isPreviewingMic).toBe(true);

    act(() => {
      result.current.stopMicPreview();
    });
  });

  it('re-resolves the selection before opening the mic in startRecording (cold start), when a devicechange was missed', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });

    const call = mediaDevices.getUserMedia.mock.calls[0][0];
    expect(call.audio).not.toHaveProperty('deviceId');
    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.selectedMicLabel).toBe('');
    expect(readMicPreference()?.deviceId).toBe('device-b');

    act(() => {
      result.current.cancelRecording();
    });
  });

  it('corrects the displayed selection when getUserMedia itself falls back to default (device reported present but unopenable)', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    mediaDevices.setDevices(
      fakeDeviceInfo('device-a', 'Built-in Microphone'),
      fakeDeviceInfo('device-b', 'USB Headset'),
    );
    mediaDevices.getUserMedia
      .mockRejectedValueOnce(new DOMException('overconstrained', 'OverconstrainedError'))
      .mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    const { result } = setup();
    await act(async () => {
      await result.current.startMicPreview();
    });

    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.selectedMicLabel).toBe('');
    expect(readMicPreference()?.deviceId).toBe('device-b');
    expect(toast.warning).toHaveBeenCalled();

    act(() => {
      result.current.stopMicPreview();
    });
  });
});

describe('mid-recording disconnect corrects both id and label', () => {
  it('updates selectedMicLabel as well as selectedMicId when the active mic is unplugged', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    const trackB = fakeTrack('device-b');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackB));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });
    expect(result.current.selectedMicId).toBe('device-b');

    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    await act(async () => {
      trackB.onended?.();
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.selectedMicId).toBeNull();
    expect(result.current.selectedMicLabel).toBe('');
    expect(readMicPreference()?.deviceId).toBe('device-b');
    expect(result.current.mediaRecorderRef.current?.state).toBe('recording');
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
    expect(toast.warning).toHaveBeenCalled();

    act(() => {
      result.current.cancelRecording();
    });
  });

  it('handles a devicechange for a lost active device with a single enumeration and a single re-acquire', async () => {
    writeMicPreference({ deviceId: 'device-b', label: 'USB Headset' });
    const trackB = fakeTrack('device-b');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackB));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording();
    });

    mediaDevices.enumerateDevices.mockClear();
    mediaDevices.setDevices(fakeDeviceInfo('device-a', 'Built-in Microphone'));
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1);
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(2); // 1 initial start + 1 recovery

    act(() => {
      result.current.cancelRecording();
    });
  });

  it('does not reconcile against the stored preference while a live graph is healthy, even if the preference differs from the active device', async () => {
    const trackA = fakeTrack('device-a');
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(trackA));

    const { result } = setup();
    await act(async () => {
      await result.current.startRecording(); // no preference yet -> system default -> device-a
    });

    // Simulate the stored preference pointing elsewhere (e.g. changed in another
    // tab) — the live graph on device-a is healthy and must not be disturbed.
    writeMicPreference({ deviceId: 'device-c', label: 'New Headset' });
    mediaDevices.setDevices(
      fakeDeviceInfo('device-a', 'Built-in Microphone'),
      fakeDeviceInfo('device-c', 'New Headset'),
    );

    await act(async () => {
      mediaDevices.dispatchEvent(new Event('devicechange'));
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(result.current.selectedMicId).not.toBe('device-c');
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1); // no swap attempted

    act(() => {
      result.current.cancelRecording();
    });
  });
});

describe('mic preview', () => {
  it('does not create a MediaRecorder while only previewing', async () => {
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    const { result } = setup();
    await act(async () => {
      await result.current.startMicPreview();
    });

    expect(result.current.isPreviewingMic).toBe(true);
    expect(result.current.mediaRecorderRef.current).toBeNull();

    act(() => {
      result.current.stopMicPreview();
    });
  });

  it('hands the live preview graph over to the recording instead of opening the mic twice', async () => {
    mediaDevices.getUserMedia.mockResolvedValueOnce(fakeMediaStream(fakeTrack('device-a')));

    const { result } = setup();
    await act(async () => {
      await result.current.startMicPreview();
    });
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.startRecording();
    });

    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPreviewingMic).toBe(false);

    act(() => {
      result.current.cancelRecording();
    });
  });
});
