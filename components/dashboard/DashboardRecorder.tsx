'use client';

import { useState } from 'react';
import {
  Upload,
  Mic,
  AudioLines,
  Square,
  Play,
  Pause,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Landmark,
  ListChecks,
  Settings,
} from 'lucide-react';
import DashboardProcessing from './DashboardProcessing';

interface RecorderConfig {
  user_input: string;
  custom_field_only: boolean;
  [key: string]: any;
}

interface DashboardRecorderProps {
  inputMode: 'upload' | 'record';
  setInputMode: (mode: 'upload' | 'record') => void;
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  recordingTime: number;
  audioUrl: string | null;
  processingProgress: number;
  file: File | null;
  config: RecorderConfig;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onUpload: () => void;
  onUploadRecording: () => void;
  onSetAutoProcess: (value: boolean) => void;
  updateConfig: (updates: Record<string, unknown>) => void;
  saveCustomQuery: (query: string, immediate?: boolean) => void;
  getDefaultQuery: (roleName: string | null) => string;
  activeRole: string | null;
}

export default function DashboardRecorder({
  inputMode,
  setInputMode,
  isRecording,
  isPaused,
  isProcessing,
  recordingTime,
  audioUrl,
  processingProgress,
  file,
  config,
  onFileChange,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onPauseRecording,
  onResumeRecording,
  onUpload,
  onUploadRecording,
  onSetAutoProcess,
  updateConfig,
  saveCustomQuery,
  getDefaultQuery,
  activeRole,
}: DashboardRecorderProps) {
  const [showAnalysisBox, setShowAnalysisBox] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAnalysisBox = (mode: 'upload' | 'record') => {
    const checkboxId = mode === 'upload' ? 'custom_field_only' : 'custom_field_only_record';

    const handleChipClick = (query: string) => {
      if (mode === 'upload') {
        if (config.user_input.trim() === query) {
          const defaultQuery = getDefaultQuery(activeRole);
          updateConfig({ user_input: defaultQuery });
          saveCustomQuery(defaultQuery, true);
        } else {
          updateConfig({ user_input: query });
          saveCustomQuery(query, true);
        }
      } else {
        if (config.user_input === query) {
          updateConfig({ user_input: '' });
          saveCustomQuery('', true);
        } else {
          updateConfig({ user_input: query });
          saveCustomQuery(query, true);
        }
      }
    };

    const getChipClass = (query: string, activeClass: string, inactiveClass: string) => {
      const currentInput = mode === 'upload' ? config.user_input.trim() : config.user_input;
      return currentInput === query ? activeClass : inactiveClass;
    };

    const isChipActive = (query: string) => {
      return mode === 'upload' ? config.user_input.trim() === query : config.user_input === query;
    };

    return (
      <div className="bg-muted p-4 rounded-lg text-left">
        <button
          onClick={() => setShowAnalysisBox(!showAnalysisBox)}
          className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {config.custom_field_only
                ? '🎯 Custom Analysis (Required)'
                : '✨ Additional Analysis (Optional)'}
            </span>
            {config.user_input && (
              <span className="text-xs bg-primary/10 text-text-primary px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </div>
          <div className="text-muted-foreground">
            {showAnalysisBox ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showAnalysisBox && (
          <div className={`p-4 border-t ${config.custom_field_only
            ? 'bg-gradient-to-br from-emerald-50 to-green-50'
            : 'bg-card'
            }`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm text-muted-foreground">
                  Describe about the additional analysis you want to perform.
                </p>
              </div>

              {/* Quick Access Cards */}
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Acess</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChipClick("What were the main budget concerns discussed?")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isChipActive("What were the main budget concerns discussed?")
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground truncate">Budget concerns</p>
                    <p className="text-xs text-muted-foreground truncate">What were the main budget concerns discuss...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChipClick("List all action items with assigned owners and deadlines")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isChipActive("List all action items with assigned owners and deadlines")
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <ListChecks className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground truncate">Action Items</p>
                    <p className="text-xs text-muted-foreground truncate">List all action items with assigned owners and dea...</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChipClick("Summarize all technical decisions and their rationale")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isChipActive("Summarize all technical decisions and their rationale")
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground truncate">Technical decisions</p>
                    <p className="text-xs text-muted-foreground truncate">Summarize all technical decisions and their ratio...</p>
                  </button>
                </div>
              </div>

              <textarea
                value={config.user_input}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    updateConfig({ user_input: value });
                    if (mode === 'upload') {
                      const queryToSave = value || getDefaultQuery(activeRole);
                      saveCustomQuery(queryToSave);
                    } else {
                      saveCustomQuery(value);
                    }
                  }
                }}
                placeholder={
                  config.custom_field_only
                    ? "🎯 Additional analysis active!\n\nDescribe what you want to extract from the meeting:\n• Focus on specific topics\n• Ask targeted questions\n• Request particular formats"
                    : mode === 'upload'
                      ? "describe what you want to extract...\n\nExamples:\n• List the risks indentified.\n• Who is assigned to each task?\n• What follow-up meetings were scheduled?"
                      : "Describe what you want to extract...\n\nExamples:\n• What risks were identified?\n• Who is assigned to each task?\n• What follow-up meetings were scheduled?"
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm ${config.custom_field_only
                  ? 'border-primary/30 bg-card'
                  : 'border-border bg-card'
                  }`}
                rows={4}
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-2">
                <p className={`text-xs ${config.user_input.length > 900 ? 'text-amber-600 font-medium' : 'text-muted-foreground'
                  }`}>
                  {config.user_input.length}/1000 characters
                  {config.user_input.length > 900 && (
                    <span className="ml-2">⚠️ Approaching limit</span>
                  )}
                </p>
                {config.custom_field_only && config.user_input.length === 0 && (
                  <span className="text-sm text-amber-600 font-medium">⚠️ Analysis request required in this mode</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <input
                type="checkbox"
                id={checkboxId}
                checked={config.custom_field_only}
                onChange={(e) =>
                  updateConfig({ custom_field_only: e.target.checked })
                }
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor={checkboxId} className="text-sm text-foreground">
                Only process additional analysis (skip standard extraction)
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-2">
      <div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-1">
          {/* Segmented Control Tabs */}
          <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-xl mb-8 border border-border">
            <button
              onClick={() => setInputMode('record')}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${inputMode === 'record'
                ? 'bg-card text-primary shadow-sm ring-1 ring-black/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <AudioLines className="w-4 h-4" />
              Voice
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${inputMode === 'upload'
                ? 'bg-card text-primary shadow-sm ring-1 ring-black/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <AudioLines className="w-4 h-4" />
              File Upload
            </button>
          </div>

          <div className="px-6 pb-8">
            {!isProcessing ? (
              <div className="space-y-8">
                {inputMode === 'upload' && (
                  <>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-primary hover:text-text-primary font-medium"
                      >
                        Choose a file
                      </label>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        MP3, WAV, M4A, WebM up to 500MB
                      </p>
                      {file && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <p className="text-sm font-medium text-text-primary">Selected file:</p>
                          <p className="text-sm text-text-primary truncate">{file.name}</p>
                          <p className="text-xs text-primary mt-1">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional Analysis for Upload */}
                    {renderAnalysisBox('upload')}

                    {/* Process Button */}
                    <button
                      onClick={inputMode === 'upload' ? onUpload : onUploadRecording}
                      disabled={inputMode === 'upload' ? !file : !audioUrl}
                      className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      Process Audio
                    </button>
                  </>
                )}

                {/* Record Mode */}
                {inputMode === 'record' && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-5">
                    {/* Timer */}
                    <div className="relative">
                      <div className="text-5xl sm:text-6xl font-light text-foreground tracking-tight font-mono">
                        {formatTime(recordingTime)}
                      </div>
                      {isRecording && (
                        <div className="absolute -top-2 -right-4">
                          <span className="relative flex h-4 w-4">
                            {!isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-4 w-4 ${isPaused ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Visualizer Placeholder */}
                    <div className="h-24 flex items-end gap-1.5 justify-center w-full max-w-lg px-4">
                      {[...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 rounded-full transition-all duration-150 ${isRecording ? 'bg-gradient-to-t from-primary to-primary' : 'bg-muted-foreground/20'
                            }`}
                          style={{
                            height: isRecording ? `${Math.max(15, Math.random() * 100)}%` : '15%',
                            opacity: isRecording ? 1 : 0.5,
                            animation: isRecording && !isPaused ? `pulse 1s infinite ${i * 0.05}s` : 'none'
                          }}
                        />
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-8">
                      {!isRecording ? (
                        <button
                          onClick={onStartRecording}
                          className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
                        >
                          <Mic className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={isPaused ? onResumeRecording : onPauseRecording}
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                            title={isPaused ? "Resume recording" : "Pause recording"}
                          >
                            {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                          </button>
                          <button
                            onClick={() => {
                              onSetAutoProcess(true);
                              onStopRecording();
                            }}
                            className="group flex items-center justify-center w-20 h-20 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                            title="Stop and process"
                          >
                            <Square className="w-8 h-8 fill-current group-hover:scale-90 transition-transform duration-200" />
                          </button>
                          <button
                            onClick={onCancelRecording}
                            className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Cancel recording"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                      {isRecording ? (isPaused ? 'Recording paused' : 'Recording in progress...') : 'Tap microphone to start'}
                    </p>

                    {/* Additional Analysis for Recording */}
                    <div className="w-full max-w-2xl">
                      {renderAnalysisBox('record')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <DashboardProcessing processingProgress={processingProgress} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
