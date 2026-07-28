'use client';

import { useEffect, useRef } from 'react';

export interface UseAutoProcessOnceParams {
  autoProcess: boolean;
  audioBlob: Blob | null;
  isRecording: boolean;
  setAutoProcess: (value: boolean) => void;
  uploadRecording: () => void | Promise<void>;
}

// Guards against uploading the same recording twice. The naive version of
// this effect (if (autoProcess && audioBlob && !isRecording) { upload();
// setAutoProcess(false); }) has a window where setAutoProcess(false) hasn't
// landed yet by the time the effect re-runs for the same blob — React 18
// StrictMode's dev double-invoke is the most reliable trigger, but any
// re-render with the flag still true does the same. Two uploads means two
// job ids and two completion watchers racing each other, which is exactly
// the kind of duplicate-navigation hazard this whole fix pass is about
// eliminating. Tracking the blob reference itself (not just the boolean
// flag) makes a given recording upload exactly once.
export function useAutoProcessOnce({
  autoProcess,
  audioBlob,
  isRecording,
  setAutoProcess,
  uploadRecording,
}: UseAutoProcessOnceParams): void {
  const processedBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (!autoProcess || !audioBlob || isRecording) return;
    if (processedBlobRef.current === audioBlob) return;

    processedBlobRef.current = audioBlob;
    setAutoProcess(false);
    uploadRecording();
  }, [autoProcess, audioBlob, isRecording, setAutoProcess, uploadRecording]);
}
