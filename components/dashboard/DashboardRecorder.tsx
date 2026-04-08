'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Mic,
  AudioLines,
  Square,
  Play,
  Pause,
  X,
  ChevronDown,
  ChevronUp,
  Landmark,
  ListChecks,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import DashboardProcessing from './DashboardProcessing';
import { Checkbox } from '@/components/ui/checkbox';

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
  onFileDrop: (file: File) => void;
  onClearFile: () => void;
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
  onFileDrop,
  onClearFile,
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
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      onFileDrop(droppedFile);
    }
  }, [onFileDrop]);

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

    const isChipActive = (query: string) => {
      return mode === 'upload' ? config.user_input.trim() === query : config.user_input === query;
    };

    return (
      <div className="rounded-lg text-left border border-border">
        <button
          onClick={() => setShowAnalysisBox(!showAnalysisBox)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {config.custom_field_only
                ? 'Custom Analysis (Required)'
                : 'Additional Analysis (Optional)'}
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
            ? 'bg-primary/5'
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
                <p className="text-xs font-medium text-muted-foreground mb-2">Quick Access</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    ? "Custom analysis active.\n\nDescribe what you want to extract from the meeting:\n• Focus on specific topics\n• Ask targeted questions\n• Request particular formats"
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
                    <span className="ml-2 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Approaching limit</span>
                  )}
                </p>
                {config.custom_field_only && config.user_input.length === 0 && (
                  <span className="text-sm text-amber-600 font-medium inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Analysis request required in this mode</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={checkboxId}
                  checked={config.custom_field_only}
                  onCheckedChange={(checked) =>
                    updateConfig({ custom_field_only: checked === true })
                  }
                />
                <label htmlFor={checkboxId} className="text-sm cursor-pointer">
                  Only process additional analysis (skip standard extraction)
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-2">
      <div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-1">
          {/* Segmented Control Tabs */}
          <div className="relative grid grid-cols-2 p-1 bg-muted/50 rounded-lg mb-6 border border-border">
            {/* Sliding indicator */}
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-card shadow-sm ring-1 ring-black/5 rounded-md"
              animate={{ x: inputMode === 'record' ? 4 : 'calc(100% + 4px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.8 }}
            />
            <button
              onClick={() => setInputMode('record')}
              className={`relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-md transition-colors duration-200 ${inputMode === 'record'
                ? 'text-red-500'
                : 'text-red-400/70 hover:text-red-500'
                }`}
            >
              <AudioLines className="w-4 h-4" />
              Voice
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-md transition-colors duration-200 ${inputMode === 'upload'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Upload className="w-4 h-4" />
              File Upload
            </button>
          </div>

          <div className="px-6 pb-8">
            {!isProcessing ? (
              <div className="space-y-6">
                {inputMode === 'upload' && (
                  <>
                    <label
                      htmlFor="file-upload"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`block cursor-pointer border border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                        isDragging
                          ? 'border-primary bg-primary/[0.03] scale-[1.01]'
                          : 'border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]'
                      }`}
                    >
                      <Upload className={`w-8 h-8 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={onFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <span className="text-primary hover:text-primary/80 font-medium">
                        Choose a file
                      </span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        MP3, WAV, M4A, WebM up to 500MB
                      </p>
                      {file && (
                        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                          <div className="text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-primary mt-0.5">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={onClearFile}
                            className="ml-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </label>

                    {/* Additional Analysis for Upload */}
                    {renderAnalysisBox('upload')}

                    {/* Process Button */}
                    <button
                      onClick={inputMode === 'upload' ? onUpload : onUploadRecording}
                      disabled={inputMode === 'upload' ? !file : !audioUrl}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:bg-primary/20 disabled:text-primary/40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-md"
                    >
                      {(inputMode === 'upload' && !file) ? 'Select a file to process' : 'Process Audio'}
                    </button>
                  </>
                )}

                {/* Record Mode */}
                {inputMode === 'record' && (
                  <div className="flex flex-col items-center justify-center py-4 space-y-5">
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
                      {[...Array(24)].map((_, i) => {
                        const baseHeight = Math.sin((i / 24) * Math.PI * 3) * 35 + 50;
                        return (
                          <motion.div
                            key={i}
                            className={`w-2.5 rounded-full ${isRecording ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                            animate={isRecording && !isPaused ? {
                              height: [`${baseHeight * 0.4}%`, `${baseHeight}%`, `${baseHeight * 0.6}%`],
                              opacity: 1,
                            } : {
                              height: '15%',
                              opacity: 0.5,
                            }}
                            transition={isRecording && !isPaused ? {
                              height: { duration: 0.8 + (i % 3) * 0.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: i * 0.04 },
                              opacity: { duration: 0.3 },
                            } : {
                              duration: 0.3,
                            }}
                          />
                        );
                      })}
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
