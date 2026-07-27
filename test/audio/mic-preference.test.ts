import { describe, it, expect, beforeEach } from 'vitest';
import {
  MIC_PREF_KEY,
  readMicPreference,
  writeMicPreference,
  clearMicPreference,
  normalizeLabel,
  resolveMicDevice,
  buildAudioConstraints,
} from '@/lib/mic-preference';

function fakeDevice(deviceId: string, label: string, groupId = 'group-1'): MediaDeviceInfo {
  return { deviceId, label, kind: 'audioinput', groupId, toJSON: () => ({}) } as MediaDeviceInfo;
}

beforeEach(() => {
  localStorage.clear();
});

describe('writeMicPreference / readMicPreference', () => {
  it('round-trips a preference through localStorage', () => {
    writeMicPreference({ deviceId: 'abc123', label: 'USB Headset', groupId: 'g1' });
    const pref = readMicPreference();
    expect(pref).toEqual({ v: 1, deviceId: 'abc123', label: 'USB Headset', groupId: 'g1', savedAt: expect.any(Number) });
  });

  it('stores system default as an empty deviceId when null is passed', () => {
    writeMicPreference({ deviceId: null, label: 'System default' });
    const pref = readMicPreference();
    expect(pref?.deviceId).toBe('');
  });

  it('returns null when nothing has been saved', () => {
    expect(readMicPreference()).toBeNull();
  });

  it('returns null and does not throw on corrupted JSON', () => {
    localStorage.setItem(MIC_PREF_KEY, '{not json');
    expect(readMicPreference()).toBeNull();
  });
});

describe('clearMicPreference', () => {
  it('removes the stored preference', () => {
    writeMicPreference({ deviceId: 'abc123', label: 'USB Headset' });
    clearMicPreference();
    expect(readMicPreference()).toBeNull();
  });
});

describe('normalizeLabel', () => {
  it('strips the Chrome "Default - " prefix', () => {
    expect(normalizeLabel('Default - USB Headset (0abc:1234)')).toBe('usb headset (0abc:1234)');
  });

  it('strips the Chrome "Communications - " prefix', () => {
    expect(normalizeLabel('Communications - USB Headset')).toBe('usb headset');
  });

  it('collapses repeated whitespace and lowercases', () => {
    expect(normalizeLabel('  USB   Headset  ')).toBe('usb headset');
  });
});

describe('resolveMicDevice', () => {
  const devices = [fakeDevice('id-a', 'Built-in Microphone'), fakeDevice('id-b', 'USB Headset')];

  it('resolves to system default when there is no stored preference', () => {
    expect(resolveMicDevice(null, devices)).toEqual({ deviceId: null, matchedBy: 'default' });
  });

  it('resolves to system default when the stored preference is the empty-id default', () => {
    const pref = { v: 1 as const, deviceId: '', label: 'System default', savedAt: 0 };
    expect(resolveMicDevice(pref, devices)).toEqual({ deviceId: null, matchedBy: 'default' });
  });

  it('matches by exact deviceId when present', () => {
    const pref = { v: 1 as const, deviceId: 'id-b', label: 'USB Headset', savedAt: 0 };
    const result = resolveMicDevice(pref, devices);
    expect(result.matchedBy).toBe('id');
    expect(result.deviceId).toBe('id-b');
    expect(result.device).toBe(devices[1]);
  });

  it('falls back to an exact label match and reports the fresh deviceId when the stored id has gone stale', () => {
    const pref = { v: 1 as const, deviceId: 'stale-id', label: 'USB Headset', savedAt: 0 };
    const result = resolveMicDevice(pref, devices);
    expect(result.matchedBy).toBe('label');
    expect(result.deviceId).toBe('id-b');
  });

  it('falls back to a normalized label match (Chrome renamed the device slightly)', () => {
    const pref = { v: 1 as const, deviceId: 'stale-id', label: 'Default - USB Headset', savedAt: 0 };
    const result = resolveMicDevice(pref, devices);
    expect(result.matchedBy).toBe('label-normalized');
    expect(result.deviceId).toBe('id-b');
  });

  it('falls back to system default without discarding the preference when nothing matches', () => {
    const pref = { v: 1 as const, deviceId: 'gone', label: 'Unplugged Mic', savedAt: 0 };
    const result = resolveMicDevice(pref, devices);
    expect(result).toEqual({ deviceId: null, matchedBy: 'stale' });
  });
});

describe('buildAudioConstraints', () => {
  it('returns the baseline constraints with no deviceId for system default', () => {
    expect(buildAudioConstraints(null)).toEqual({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
  });

  it('adds an exact deviceId constraint when a device is selected', () => {
    expect(buildAudioConstraints('id-b')).toEqual({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      deviceId: { exact: 'id-b' },
    });
  });
});
