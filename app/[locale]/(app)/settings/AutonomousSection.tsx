'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { ScheduleManager } from '@/lib/autonomous/schedule-manager';
import { DEFAULT_SETTINGS } from '@/lib/autonomous/types';
import type { AutonomousSettings } from '@/lib/autonomous/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const sm = new ScheduleManager();

export function AutonomousSection() {
  const [settings, setSettings] = useState<AutonomousSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(sm.load());
  }, []);

  function handleSave() {
    sm.save(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function patch(updates: Partial<AutonomousSettings>) {
    setSettings((s) => ({ ...s, ...updates }));
  }

  function patchSchedule(updates: Partial<AutonomousSettings['schedule']>) {
    setSettings((s) => ({ ...s, schedule: { ...s.schedule, ...updates } }));
  }

  function toggleDay(day: number) {
    const days = settings.schedule.days.includes(day)
      ? settings.schedule.days.filter((d) => d !== day)
      : [...settings.schedule.days, day].sort((a, b) => a - b);
    patchSchedule({ days });
  }

  return (
    <SettingsSection
      id="autonomous"
      icon={<Bot className="w-5 h-5" />}
      title="Autonomous Mode"
      description="Continuous background listening with automatic session uploads."
    >
      <div className="space-y-5">
        {/* VAD Threshold */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <label className="font-medium text-foreground">Speech sensitivity</label>
            <span className="text-muted-foreground">{settings.vadThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.05}
            value={settings.vadThreshold}
            onChange={(e) => patch({ vadThreshold: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Higher = only confident speech triggers recording (fewer false positives).
          </p>
        </div>

        {/* Min utterance duration */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <label className="font-medium text-foreground">Min utterance length</label>
            <span className="text-muted-foreground">{settings.minUtteranceDurationMs} ms</span>
          </div>
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={settings.minUtteranceDurationMs}
            onChange={(e) => patch({ minUtteranceDurationMs: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Session silence */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <label className="font-medium text-foreground">Session silence timeout</label>
            <span className="text-muted-foreground">{settings.sessionSilenceMinutes} min</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={settings.sessionSilenceMinutes}
            onChange={(e) => patch({ sessionSilenceMinutes: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Session uploads after this many minutes of silence.
          </p>
        </div>

        {/* Additional analysis query */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Additional analysis query</label>
          <textarea
            rows={3}
            placeholder="e.g. What decisions were made? What are the key risks?"
            value={settings.additionalAnalysisQuery}
            onChange={(e) => patch({ additionalAnalysisQuery: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Optional custom question answered by the AI for every auto session.
          </p>
        </div>

        {/* Schedule */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Scheduled listening</span>
            <button
              role="switch"
              aria-checked={settings.schedule.enabled}
              onClick={() => patchSchedule({ enabled: !settings.schedule.enabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.schedule.enabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  settings.schedule.enabled ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {settings.schedule.enabled && (
            <div className="space-y-3 pl-1">
              {/* Day picker */}
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      settings.schedule.days.includes(i)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Time range */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Start</label>
                  <input
                    type="time"
                    value={settings.schedule.startTime}
                    onChange={(e) => patchSchedule({ startTime: e.target.value })}
                    className="border border-border rounded-md px-2 py-1 text-sm bg-background text-foreground"
                  />
                </div>
                <span className="text-muted-foreground mt-4">→</span>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">End</label>
                  <input
                    type="time"
                    value={settings.schedule.endTime}
                    onChange={(e) => patchSchedule({ endTime: e.target.value })}
                    className="border border-border rounded-md px-2 py-1 text-sm bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} variant="default" size="sm">
          {saved ? '✓ Saved' : 'Save settings'}
        </Button>
      </div>
    </SettingsSection>
  );
}
