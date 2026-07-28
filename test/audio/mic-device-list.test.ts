import { describe, it, expect } from 'vitest';
import { buildMicDeviceList } from '@/lib/audio/mic-device-list';

function device(deviceId: string, label: string, groupId = 'g1'): MediaDeviceInfo {
  return { deviceId, label, kind: 'audioinput', groupId, toJSON: () => ({}) } as MediaDeviceInfo;
}

describe('buildMicDeviceList', () => {
  it('always leads with a synthetic system-default row', () => {
    const list = buildMicDeviceList([], 'System default');
    expect(list).toEqual([{ deviceId: '', label: 'System default', isDefault: true, groupId: '' }]);
  });

  it('lists real audioinput devices after the default row', () => {
    const list = buildMicDeviceList(
      [device('id-a', 'Built-in Microphone'), device('id-b', 'USB Headset')],
      'System default',
    );
    expect(list).toEqual([
      { deviceId: '', label: 'System default', isDefault: true, groupId: '' },
      { deviceId: 'id-a', label: 'Built-in Microphone', isDefault: false, groupId: 'g1' },
      { deviceId: 'id-b', label: 'USB Headset', isDefault: false, groupId: 'g1' },
    ]);
  });

  it('drops non-audioinput devices', () => {
    const videoDevice = { deviceId: 'cam-1', label: 'Webcam', kind: 'videoinput', groupId: 'g1', toJSON: () => ({}) } as MediaDeviceInfo;
    const list = buildMicDeviceList([videoDevice, device('id-a', 'Built-in Microphone')], 'System default');
    expect(list.map((d) => d.deviceId)).toEqual(['', 'id-a']);
  });

  it("drops Chrome's synthetic 'default' and 'communications' pseudo-entries so the real mic isn't listed twice", () => {
    const list = buildMicDeviceList(
      [
        device('default', 'Default - USB Headset'),
        device('communications', 'Communications - USB Headset'),
        device('id-b', 'USB Headset'),
      ],
      'System default',
    );
    expect(list.map((d) => d.deviceId)).toEqual(['', 'id-b']);
  });

  it('dedupes by deviceId', () => {
    const list = buildMicDeviceList(
      [device('id-a', 'Built-in Microphone'), device('id-a', 'Built-in Microphone')],
      'System default',
    );
    expect(list).toHaveLength(2); // synthetic default + one real entry
  });

  it('labels devices with a blank label (permission not yet granted) as "Microphone N"', () => {
    const list = buildMicDeviceList([device('id-a', ''), device('id-b', '')], 'System default');
    expect(list.map((d) => d.label)).toEqual(['System default', 'Microphone 1', 'Microphone 2']);
  });

  it('strips the Chrome "Default - " prefix from a real label', () => {
    const list = buildMicDeviceList([device('id-a', 'Default - Built-in Microphone')], 'System default');
    expect(list[1].label).toBe('Built-in Microphone');
  });
});
