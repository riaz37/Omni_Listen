import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoProcessOnce } from '@/hooks/useAutoProcessOnce';

// Regression coverage for the auto-process effect in listen/page.tsx:
//   useEffect(() => {
//     if (autoProcess && audioBlob && !isRecording) {
//       uploadRecording();       // not awaited
//       setAutoProcess(false);   // only takes effect a render later
//     }
//   }, [autoProcess, audioBlob, isRecording]);
// Because setAutoProcess(false) doesn't land until the next render, any
// re-run of this effect for the same blob while autoProcess is still (or
// again) true — React 18 StrictMode's dev double-invoke is the most common
// trigger — uploads the same recording twice, producing two job ids and two
// completion watchers racing each other. The fix guards on the blob
// reference itself so a given recording is ever auto-processed once.

describe('useAutoProcessOnce', () => {
  it('uploads once when autoProcess flips on for a new blob', () => {
    const uploadRecording = vi.fn();
    const setAutoProcess = vi.fn();
    const blobA = new Blob(['a']);

    renderHook(
      (props: { autoProcess: boolean; audioBlob: Blob | null; isRecording: boolean }) =>
        useAutoProcessOnce({ ...props, setAutoProcess, uploadRecording }),
      { initialProps: { autoProcess: true, audioBlob: blobA, isRecording: false } },
    );

    expect(uploadRecording).toHaveBeenCalledTimes(1);
    expect(setAutoProcess).toHaveBeenCalledWith(false);
  });

  it('does not upload again for the SAME blob even if autoProcess is (still/again) true on a re-run', () => {
    const uploadRecording = vi.fn();
    const setAutoProcess = vi.fn();
    const blobA = new Blob(['a']);

    const { rerender } = renderHook(
      (props: { autoProcess: boolean; audioBlob: Blob | null; isRecording: boolean }) =>
        useAutoProcessOnce({ ...props, setAutoProcess, uploadRecording }),
      { initialProps: { autoProcess: true, audioBlob: blobA, isRecording: false } },
    );
    expect(uploadRecording).toHaveBeenCalledTimes(1);

    // Simulates setAutoProcess(false) not having landed yet (or a re-render
    // with autoProcess forced back true) — same blob object either way.
    rerender({ autoProcess: true, audioBlob: blobA, isRecording: false });

    expect(uploadRecording).toHaveBeenCalledTimes(1);
  });

  it('uploads again for a genuinely new blob (a second recording)', () => {
    const uploadRecording = vi.fn();
    const setAutoProcess = vi.fn();
    const blobA = new Blob(['a']);
    const blobB = new Blob(['b']);

    const { rerender } = renderHook(
      (props: { autoProcess: boolean; audioBlob: Blob | null; isRecording: boolean }) =>
        useAutoProcessOnce({ ...props, setAutoProcess, uploadRecording }),
      { initialProps: { autoProcess: true, audioBlob: blobA, isRecording: false } },
    );
    expect(uploadRecording).toHaveBeenCalledTimes(1);

    rerender({ autoProcess: true, audioBlob: blobB, isRecording: false });

    expect(uploadRecording).toHaveBeenCalledTimes(2);
  });

  it('does not upload while still recording', () => {
    const uploadRecording = vi.fn();
    const setAutoProcess = vi.fn();
    const blobA = new Blob(['a']);

    renderHook(
      (props: { autoProcess: boolean; audioBlob: Blob | null; isRecording: boolean }) =>
        useAutoProcessOnce({ ...props, setAutoProcess, uploadRecording }),
      { initialProps: { autoProcess: true, audioBlob: blobA, isRecording: true } },
    );

    expect(uploadRecording).not.toHaveBeenCalled();
  });
});
