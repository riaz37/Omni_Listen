export interface MicDeviceOption {
  /** '' is the synthetic "system default" row — never a real deviceId. */
  deviceId: string;
  label: string;
  isDefault: boolean;
  groupId: string;
}

/**
 * Turns enumerateDevices() output into the list the picker renders: always
 * led by a synthetic "system default" row, followed by real input devices.
 * Drops Chrome's synthetic 'default'/'communications' pseudo-entries (which
 * otherwise duplicate whatever the OS default happens to be), dedupes by
 * deviceId, and gives blank labels (permission not yet granted) a stable
 * placeholder instead of showing nothing.
 */
export function buildMicDeviceList(devices: MediaDeviceInfo[], systemDefaultLabel: string): MicDeviceOption[] {
  const defaultRow: MicDeviceOption = { deviceId: '', label: systemDefaultLabel, isDefault: true, groupId: '' };

  const seen = new Set<string>();
  const named: MicDeviceOption[] = [];
  let blankCounter = 0;

  for (const d of devices) {
    if (d.kind !== 'audioinput') continue;
    if (d.deviceId === 'default' || d.deviceId === 'communications') continue;
    if (seen.has(d.deviceId)) continue;
    seen.add(d.deviceId);

    let label = d.label;
    if (!label) {
      blankCounter += 1;
      label = `Microphone ${blankCounter}`;
    } else {
      label = label.replace(/^(Default|Communications)\s*-\s*/i, '');
    }

    named.push({ deviceId: d.deviceId, label, isDefault: false, groupId: d.groupId });
  }

  return [defaultRow, ...named];
}
