import type { AutonomousSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'autonomous-settings';

export class ScheduleManager {
  private _timer: ReturnType<typeof setInterval> | null = null;

  load(): AutonomousSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<AutonomousSettings>;
      const settings: AutonomousSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        // Deep-merge nested schedule so missing fields fall back to defaults
        schedule: { ...DEFAULT_SETTINGS.schedule, ...(parsed.schedule ?? {}) },
      };
      // Guard against NaN or out-of-range values from corrupted storage
      if (typeof settings.vadThreshold !== 'number' || isNaN(settings.vadThreshold)) {
        settings.vadThreshold = DEFAULT_SETTINGS.vadThreshold;
      } else {
        settings.vadThreshold = Math.max(0.1, Math.min(0.95, settings.vadThreshold));
      }
      return settings;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  save(settings: AutonomousSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  isWithinWindow(settings: AutonomousSettings): boolean {
    if (!settings.schedule.enabled) return false;
    const now = new Date();
    const day = now.getDay();
    if (!settings.schedule.days.includes(day)) return false;

    const [startH, startM] = settings.schedule.startTime.split(':').map(Number);
    const [endH, endM] = settings.schedule.endTime.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  startTick(
    onShouldStart: () => void,
    onShouldStop: () => void,
    isListening: () => boolean,
  ): void {
    this.stopTick();
    this._timer = setInterval(() => {
      const settings = this.load();
      const inWindow = this.isWithinWindow(settings);
      if (inWindow && !isListening()) {
        onShouldStart();
      } else if (!inWindow && isListening()) {
        onShouldStop();
      }
    }, 60_000);
  }

  stopTick(): void {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}
