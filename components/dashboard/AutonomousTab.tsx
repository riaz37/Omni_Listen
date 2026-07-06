'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Zap,
  Mic,
  Pause,
  Play,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  StopCircle,
  Landmark,
  ListChecks,
  Settings as SettingsIcon,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AutonomousState, AutonomousSettings } from '@/lib/autonomous/types';

interface AutonomousTabProps {
  state: AutonomousState;
  settings: AutonomousSettings | null;
  onPrepare: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onUploadNow: () => void;
  onDiscard: () => void;
  onUploadAndStop: () => void;
  onSaveSettings: (s: AutonomousSettings) => void;
}

export default function AutonomousTab({
  state,
  settings,
  onPrepare,
  onStart,
  onPause,
  onResume,
  onUploadNow,
  onDiscard,
  onUploadAndStop,
  onSaveSettings,
}: AutonomousTabProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalysisBox, setShowAnalysisBox] = useState(false);
  const { status, utteranceCount, error, loadingProgress, pendingUploads } = state;
  const isActive = ['listening', 'utterance', 'session-active'].includes(status);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Idle ── */}
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Autonomous Mode</p>
            <p className="text-sm text-muted-foreground mt-1">
              Continuous voice detection. Sessions upload automatically.
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button onClick={onPrepare} className="mt-2">
            Prepare Autonomous Mode
          </Button>
        </div>
      )}

      {/* ── Loading ── */}
      {status === 'loading' && loadingProgress && (
        <div className="flex flex-col gap-3 py-6">
          <p className="text-sm font-medium text-foreground text-center">
            {loadingProgress.phase === 'downloading'
              ? `Downloading YAMNet model${
                  loadingProgress.bytesTotal
                    ? ` (${Math.round(loadingProgress.bytesLoaded! / 1_000_000)} / ${Math.round(
                        loadingProgress.bytesTotal / 1_000_000,
                      )} MB)`
                    : ''
                }`
              : 'Initialising models…'}
          </p>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${loadingProgress.percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {loadingProgress.percent}% — this only happens once
          </p>
        </div>
      )}

      {/* ── Ready ── */}
      {status === 'ready' && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            ✓ Ready to listen
          </p>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button onClick={onStart} className="gap-2">
            <Mic className="w-4 h-4" />
            Start Listening
          </Button>
        </div>
      )}

      {/* ── Active (listening / utterance / session-active / paused) ── */}
      {(isActive || status === 'paused') && (
        <div className="flex flex-col gap-4">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'paused' ? (
                <span className="text-sm font-medium text-amber-500">⏸ Paused</span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {status === 'utterance' ? 'Capturing…' : 'Listening'}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {utteranceCount} utterance{utteranceCount !== 1 ? 's' : ''} captured
            </span>
          </div>

          {/* Waveform bars */}
          {isActive && (
            <div className="flex items-end justify-center gap-0.5 h-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={{
                    height: status === 'utterance'
                      ? [`${12 + Math.random() * 24}px`, `${12 + Math.random() * 24}px`]
                      : ['8px', '12px'],
                  }}
                  transition={{
                    duration: 0.4 + i * 0.02,
                    repeat: Infinity,
                    repeatType: 'mirror',
                  }}
                />
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            {status === 'paused' ? (
              <Button variant="outline" size="sm" onClick={onResume} className="gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Resume
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onPause} className="gap-1.5">
                <Pause className="w-3.5 h-3.5" />
                Pause
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadNow}
              disabled={utteranceCount === 0}
              className="gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={utteranceCount === 0}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadAndStop}
              className="gap-1.5"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {/* ── Uploading / Done ── */}
      {(status === 'uploading' || status === 'done') && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm font-medium text-foreground">
            {status === 'uploading' ? 'Sending session to AI…' : '✓ Session sent for processing'}
          </p>
        </div>
      )}

      {/* ── Background upload indicator (shown in ready/active states) ── */}
      {!['uploading', 'done', 'loading', 'idle'].includes(status) && pendingUploads > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center py-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {pendingUploads === 1 ? 'Uploading session in background…' : `${pendingUploads} sessions uploading in background…`}
        </div>
      )}

      {/* ── Additional analysis query (shown when ready or active) ── */}
      {['ready', 'listening', 'utterance', 'session-active', 'paused'].includes(status) && settings && (
        <div className="rounded-lg text-start border border-border">
          <Button
            variant="ghost"
            onClick={() => setShowAnalysisBox(!showAnalysisBox)}
            className="w-full flex items-center justify-between p-4 h-auto text-start rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Additional Analysis (Optional)</span>
              {settings.additionalAnalysisQuery && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {showAnalysisBox ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </Button>

          {showAnalysisBox && (
            <div className="p-4 border-t bg-card">
              <p className="text-sm text-muted-foreground mb-3">
                Describe the additional analysis you want to perform.
              </p>

              {/* Quick Access Cards */}
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Access</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: <Landmark className="w-4 h-4 text-muted-foreground mb-2 shrink-0" />, label: 'Budget concerns', query: 'What were the main budget concerns discussed?' },
                    { icon: <ListChecks className="w-4 h-4 text-muted-foreground mb-2 shrink-0" />, label: 'Action Items', query: 'List all action items with assigned owners and deadlines' },
                    { icon: <SettingsIcon className="w-4 h-4 text-muted-foreground mb-2 shrink-0" />, label: 'Technical decisions', query: 'Summarize all technical decisions and their rationale' },
                  ].map(({ icon, label, query }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      onClick={() =>
                        onSaveSettings({
                          ...settings,
                          additionalAnalysisQuery:
                            settings.additionalAnalysisQuery === query ? '' : query,
                        })
                      }
                      className={`p-3 h-auto rounded-lg border text-start flex flex-col items-start overflow-hidden min-w-0 ${
                        settings.additionalAnalysisQuery === query
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {icon}
                      <p className="text-sm font-semibold text-foreground truncate w-full">{label}</p>
                      <p className="text-xs text-muted-foreground truncate w-full">{query}</p>
                    </Button>
                  ))}
                </div>
              </div>

              <textarea
                value={settings.additionalAnalysisQuery}
                onChange={(e) => {
                  if (e.target.value.length <= 1000)
                    onSaveSettings({ ...settings, additionalAnalysisQuery: e.target.value });
                }}
                placeholder={"Describe what you want to extract...\n\nExamples:\n• What risks were identified?\n• Who is assigned to each task?\n• What follow-ups were scheduled?"}
                className="w-full px-4 py-3 border border-border rounded-lg text-foreground bg-card focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                rows={4}
                maxLength={1000}
              />
              <p className={`text-xs mt-2 ${settings.additionalAnalysisQuery.length > 900 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                {settings.additionalAnalysisQuery.length}/1000 characters
                {settings.additionalAnalysisQuery.length > 900 && (
                  <span className="ms-2 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Approaching limit
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Quick settings (shown when ready or active) ── */}
      {['ready', 'listening', 'utterance', 'session-active', 'paused'].includes(status) && settings && (
        <div className="border-t border-border pt-3 mt-1">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Settings
            <span className="ml-2 text-muted-foreground/60">
              schedule: {settings.schedule.enabled ? 'on' : 'off'}
              {' · '}
              silence: {settings.sessionSilenceMinutes} min
            </span>
          </button>

          {showSettings && (
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex items-center justify-between text-sm">
                <span className="text-foreground">Schedule</span>
                <button
                  role="switch"
                  aria-checked={settings.schedule.enabled}
                  onClick={() =>
                    onSaveSettings({
                      ...settings,
                      schedule: { ...settings.schedule, enabled: !settings.schedule.enabled },
                    })
                  }
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

              <label className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">Session silence</span>
                  <span className="text-muted-foreground">{settings.sessionSilenceMinutes} min</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={settings.sessionSilenceMinutes}
                  onChange={(e) =>
                    onSaveSettings({
                      ...settings,
                      sessionSilenceMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
              </label>

              <p className="text-xs text-muted-foreground">
                Full configuration in{' '}
                <a href="/settings#autonomous" className="text-primary underline">
                  Settings → Autonomous
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
