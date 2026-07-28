import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GlobalStateProvider, useGlobalState } from '@/lib/global-state-context';
import { installFakeWebAudio, fakeTrack, fakeMediaStream } from './helpers/fake-web-audio';
import { installFakeMediaRecorder, installFakeMediaDevices, FakeMediaDevices } from './helpers/fake-media';

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
