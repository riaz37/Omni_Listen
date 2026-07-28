import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMicDevices } from '@/hooks/useMicDevices';

const mockGlobalState = {
  selectedMicId: null as string | null,
  selectedMicLabel: '',
  isSwitchingMic: false,
  isPreviewingMic: false,
  isRecording: false,
  audioLevel: 0,
  setMicDevice: vi.fn(),
  startMicPreview: vi.fn(),
  stopMicPreview: vi.fn(),
};

vi.mock('@/lib/global-state-context', () => ({
  useGlobalState: () => mockGlobalState,
}));

function installPermissions(state: 'granted' | 'denied' | 'prompt' | 'unsupported') {
  if (state === 'unsupported') {
    Object.defineProperty(navigator, 'permissions', { value: undefined, configurable: true });
    return { onchange: null as (() => void) | null };
  }
  const status: { state: string; onchange: (() => void) | null } = { state, onchange: null };
  Object.defineProperty(navigator, 'permissions', {
    value: { query: vi.fn().mockResolvedValue(status) },
    configurable: true,
  });
  return status;
}

function installMediaDevices() {
  class FakeMediaDevices extends EventTarget {
    enumerateDevices = vi.fn().mockResolvedValue([]);
    getUserMedia = vi.fn();
  }
  const md = new FakeMediaDevices();
  Object.defineProperty(navigator, 'mediaDevices', { value: md, configurable: true });
  return md;
}

beforeEach(() => {
  mockGlobalState.selectedMicId = null;
  mockGlobalState.selectedMicLabel = '';
  mockGlobalState.isSwitchingMic = false;
  mockGlobalState.isPreviewingMic = false;
  mockGlobalState.isRecording = false;
  mockGlobalState.audioLevel = 0;
  mockGlobalState.setMicDevice = vi.fn().mockResolvedValue(undefined);
  mockGlobalState.startMicPreview = vi.fn().mockResolvedValue(undefined);
  mockGlobalState.stopMicPreview = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useMicDevices — permission state', () => {
  it('reports "unsupported" when the Permissions API has no microphone query support', async () => {
    installPermissions('unsupported');
    installMediaDevices();

    const { result } = renderHook(() => useMicDevices('System default'));

    await waitFor(() => expect(result.current.permission).toBe('unsupported'));
  });

  it('reports "granted" and lists real devices when permission is already granted', async () => {
    installPermissions('granted');
    const md = installMediaDevices();
    md.enumerateDevices.mockResolvedValue([
      { deviceId: 'id-a', label: 'USB Headset', kind: 'audioinput', groupId: 'g1', toJSON: () => ({}) },
    ]);

    const { result } = renderHook(() => useMicDevices('System default'));

    await waitFor(() => expect(result.current.permission).toBe('granted'));
    await waitFor(() => expect(result.current.devices.map((d) => d.label)).toEqual(['System default', 'USB Headset']));
  });

  it('reports "denied" without enumerating device labels', async () => {
    installPermissions('denied');
    installMediaDevices();

    const { result } = renderHook(() => useMicDevices('System default'));

    await waitFor(() => expect(result.current.permission).toBe('denied'));
  });
});

describe('useMicDevices — select', () => {
  it('delegates to setMicDevice on the global state', async () => {
    installPermissions('granted');
    installMediaDevices();
    const { result } = renderHook(() => useMicDevices('System default'));

    await act(async () => {
      await result.current.select('device-b', 'USB Headset');
    });

    expect(mockGlobalState.setMicDevice).toHaveBeenCalledWith('device-b', 'USB Headset');
  });
});

describe('useMicDevices — requestPermission', () => {
  it('opens the mic, re-enumerates, releases the bootstrap stream, and arms the preview', async () => {
    installPermissions('prompt');
    const md = installMediaDevices();
    const track = { stop: vi.fn() };
    const bootstrapStream = { getTracks: () => [track] };
    md.getUserMedia.mockResolvedValue(bootstrapStream);

    const { result } = renderHook(() => useMicDevices('System default'));
    await waitFor(() => expect(result.current.permission).toBe('prompt'));

    let granted: boolean | undefined;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(true);
    expect(md.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(track.stop).toHaveBeenCalled();
    expect(mockGlobalState.startMicPreview).toHaveBeenCalled();
  });

  it('returns false and does not start a preview when the user denies the prompt', async () => {
    installPermissions('prompt');
    const md = installMediaDevices();
    md.getUserMedia.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));

    const { result } = renderHook(() => useMicDevices('System default'));

    let granted: boolean | undefined;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(false);
    expect(mockGlobalState.startMicPreview).not.toHaveBeenCalled();
  });
});

describe('useMicDevices — preview idle auto-stop', () => {
  it('stops the preview after 20s of no picker interaction and flags previewExpired', async () => {
    vi.useFakeTimers();
    installPermissions('granted');
    installMediaDevices();

    const { result } = renderHook(() => useMicDevices('System default'));
    // waitFor's polling relies on real timers, so with fake timers active
    // just flush the microtask queue instead — the permission Promise
    // resolves immediately, this only needs one tick to land in state.
    await act(async () => {});
    expect(result.current.permission).toBe('granted');

    act(() => {
      result.current.handleOpenChange(true);
    });
    expect(mockGlobalState.startMicPreview).toHaveBeenCalledTimes(1);
    expect(result.current.previewExpired).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });

    expect(mockGlobalState.stopMicPreview).toHaveBeenCalled();
    expect(result.current.previewExpired).toBe(true);
  });
});

describe('useMicDevices — dropdown open/close wiring', () => {
  it('arms the preview on open (when granted) and stops it on close', async () => {
    installPermissions('granted');
    installMediaDevices();
    const { result } = renderHook(() => useMicDevices('System default'));
    await waitFor(() => expect(result.current.permission).toBe('granted'));

    act(() => {
      result.current.handleOpenChange(true);
    });
    expect(mockGlobalState.startMicPreview).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.handleOpenChange(false);
    });
    expect(mockGlobalState.stopMicPreview).toHaveBeenCalledTimes(1);
  });

  it('does not stop the preview on close while a recording is in progress', async () => {
    installPermissions('granted');
    installMediaDevices();
    mockGlobalState.isRecording = true;
    const { result } = renderHook(() => useMicDevices('System default'));

    act(() => {
      result.current.handleOpenChange(false);
    });

    expect(mockGlobalState.stopMicPreview).not.toHaveBeenCalled();
  });
});
