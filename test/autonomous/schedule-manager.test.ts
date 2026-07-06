import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScheduleManager } from '@/lib/autonomous/schedule-manager';
import type { AutonomousSettings } from '@/lib/autonomous/types';
import { DEFAULT_SETTINGS } from '@/lib/autonomous/types';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

function settingsWithSchedule(day: number, start: string, end: string): AutonomousSettings {
  return {
    ...DEFAULT_SETTINGS,
    schedule: { enabled: true, days: [day], startTime: start, endTime: end },
  };
}

describe('ScheduleManager.isWithinWindow', () => {
  it('returns true when current time is within scheduled window', () => {
    // Fix: Monday 10:00
    vi.setSystemTime(new Date('2026-06-08T10:00:00')); // Monday
    const sm = new ScheduleManager();
    const settings = settingsWithSchedule(1, '09:00', '17:00');
    expect(sm.isWithinWindow(settings)).toBe(true);
  });

  it('returns false when outside time window', () => {
    vi.setSystemTime(new Date('2026-06-08T18:00:00')); // Monday 18:00
    const sm = new ScheduleManager();
    const settings = settingsWithSchedule(1, '09:00', '17:00');
    expect(sm.isWithinWindow(settings)).toBe(false);
  });

  it('returns false on unscheduled day', () => {
    vi.setSystemTime(new Date('2026-06-07T10:00:00')); // Sunday = 0
    const sm = new ScheduleManager();
    const settings = settingsWithSchedule(1, '09:00', '17:00'); // only Monday
    expect(sm.isWithinWindow(settings)).toBe(false);
  });

  it('returns false when schedule.enabled is false', () => {
    vi.setSystemTime(new Date('2026-06-08T10:00:00'));
    const sm = new ScheduleManager();
    const settings: AutonomousSettings = {
      ...DEFAULT_SETTINGS,
      schedule: { enabled: false, days: [1], startTime: '09:00', endTime: '17:00' },
    };
    expect(sm.isWithinWindow(settings)).toBe(false);
  });
});

describe('ScheduleManager settings persistence', () => {
  it('saves and loads settings from localStorage', () => {
    const sm = new ScheduleManager();
    const modified: AutonomousSettings = { ...DEFAULT_SETTINGS, sessionSilenceMinutes: 10 };
    sm.save(modified);
    expect(sm.load().sessionSilenceMinutes).toBe(10);
  });

  it('returns DEFAULT_SETTINGS when nothing saved', () => {
    const sm = new ScheduleManager();
    const s = sm.load();
    expect(s.sessionSilenceMinutes).toBe(DEFAULT_SETTINGS.sessionSilenceMinutes);
  });
});
