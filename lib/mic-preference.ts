// Per-browser microphone preference for the recorder. Deliberately NOT synced
// to /api/user/preferences: a deviceId is scoped to the origin + machine that
// issued it and is meaningless on another device. The label is stored
// alongside it so a stale deviceId (Chrome reshuffles ids across reboots/OS
// updates) can be re-matched by name instead of silently falling back.

export const MIC_PREF_KEY = 'esap-mic-preference';

export interface MicPreference {
  v: 1;
  /** Empty string means "system default" (no deviceId constraint). */
  deviceId: string;
  label: string;
  groupId?: string;
  savedAt: number;
}

export function readMicPreference(): MicPreference | null {
  try {
    const raw = localStorage.getItem(MIC_PREF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.deviceId !== 'string') return null;
    return parsed as MicPreference;
  } catch {
    return null;
  }
}

export function writeMicPreference(pref: { deviceId: string | null; label: string; groupId?: string }): void {
  try {
    const record: MicPreference = {
      v: 1,
      deviceId: pref.deviceId ?? '',
      label: pref.label,
      groupId: pref.groupId,
      savedAt: Date.now(),
    };
    localStorage.setItem(MIC_PREF_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable (private browsing, quota) — preference just won't persist.
  }
}

export function clearMicPreference(): void {
  try {
    localStorage.removeItem(MIC_PREF_KEY);
  } catch {
    // no-op
  }
}

/**
 * Strips Chrome's "Default - " / "Communications - " display prefixes,
 * collapses whitespace, and lowercases — so a device renamed slightly by the
 * OS/browser can still be recognized as the same physical microphone.
 */
export function normalizeLabel(label: string): string {
  return label
    .replace(/^(Default|Communications)\s*-\s*/i, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export type MicMatchKind = 'default' | 'id' | 'label' | 'label-normalized' | 'stale';

export interface MicResolution {
  deviceId: string | null;
  matchedBy: MicMatchKind;
  device?: MediaDeviceInfo;
}

/**
 * Resolves a stored preference against the current device list. Order:
 * exact deviceId -> exact label -> normalized label -> give up (system
 * default, but the preference is kept so a re-plugged device is re-adopted).
 */
export function resolveMicDevice(pref: MicPreference | null, devices: MediaDeviceInfo[]): MicResolution {
  if (!pref || pref.deviceId === '') {
    return { deviceId: null, matchedBy: 'default' };
  }

  const byId = devices.find((d) => d.deviceId === pref.deviceId);
  if (byId) {
    return { deviceId: byId.deviceId, matchedBy: 'id', device: byId };
  }

  const byLabel = devices.find((d) => d.label === pref.label);
  if (byLabel) {
    return { deviceId: byLabel.deviceId, matchedBy: 'label', device: byLabel };
  }

  const normalizedPref = normalizeLabel(pref.label);
  const byNormalizedLabel = devices.find((d) => normalizeLabel(d.label) === normalizedPref);
  if (byNormalizedLabel) {
    return { deviceId: byNormalizedLabel.deviceId, matchedBy: 'label-normalized', device: byNormalizedLabel };
  }

  return { deviceId: null, matchedBy: 'stale' };
}

export interface MicSelectionUpdate {
  deviceId: string | null;
  label: string;
  /** True only when the device was found under a NEW deviceId — rewrite localStorage. */
  shouldPersist: boolean;
}

/**
 * Decides what the picker should DISPLAY (and what should be persisted) for a
 * given resolveMicDevice() result. Kept separate from resolveMicDevice itself
 * so the persist-or-not policy — the part that actually matters for
 * behavior — has its own dedicated tests, independent of device-matching.
 *
 * The critical distinction is 'stale' vs 'label'/'label-normalized':
 *   - 'stale'  → the device is genuinely gone. Fall back to default for
 *     display, but do NOT touch the stored preference — that's what lets a
 *     later re-plug of the same device be silently re-adopted by label.
 *   - 'label'/'label-normalized' → the device is present, just under a
 *     reshuffled id (a normal OS/browser occurrence). This is a legitimate
 *     permanent correction, so the preference IS rewritten to the fresh id.
 */
export function deriveMicSelection(resolution: MicResolution, pref: MicPreference | null): MicSelectionUpdate {
  switch (resolution.matchedBy) {
    case 'default':
      return { deviceId: null, label: pref?.label ?? '', shouldPersist: false };
    case 'id':
      return { deviceId: resolution.deviceId, label: resolution.device!.label, shouldPersist: false };
    case 'label':
    case 'label-normalized':
      return { deviceId: resolution.deviceId, label: resolution.device!.label, shouldPersist: true };
    case 'stale':
      return { deviceId: null, label: '', shouldPersist: false };
  }
}

/**
 * True iff the device list is trustworthy enough to reconcile a selection
 * against — i.e. mic permission has actually been granted. Before that,
 * enumerateDevices() returns entries with blank deviceId/label (Chrome) or an
 * empty array (Firefox), which would otherwise read as "every stored device
 * is stale" and silently wipe the remembered mic on every cold page load.
 */
export function canResolveDevices(devices: MediaDeviceInfo[]): boolean {
  return devices.some((d) => d.deviceId !== '' && d.label !== '');
}

/**
 * Baseline getUserMedia audio constraints, unchanged from the pre-existing
 * recorder, with an exact deviceId added when a specific device is selected.
 * Uses `exact` (never `ideal`) — `ideal` degrades to the wrong mic silently
 * instead of throwing, which would defeat the whole point of a picker.
 */
export function buildAudioConstraints(deviceId: string | null): MediaTrackConstraints {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
  };
}
