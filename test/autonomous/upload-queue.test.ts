import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UploadQueue } from '@/lib/autonomous/upload-queue';

const API_URL = 'http://localhost:8000';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function makeWav(): Blob {
  return new Blob([new Uint8Array(100)], { type: 'audio/wav' });
}

describe('UploadQueue.enqueue', () => {
  it('adds item and attempts upload immediately on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'job-1' }),
    });

    const q = new UploadQueue(API_URL);
    await q.enqueue(makeWav());

    // Let async queue processing run
    await vi.runAllTimersAsync();

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/process-audio`,
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('retries after 5 seconds on network failure', async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({ ok: true, json: async () => ({ job_id: 'job-2' }) });

    const q = new UploadQueue(API_URL);
    await q.enqueue(makeWav());
    // first attempt fires synchronously during enqueue and fails;
    // await enqueue() flushes microtasks so the catch block runs and
    // registers the 5-second retry timer before we continue
    expect(fetch).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    await vi.runAllTimersAsync(); // retry fires

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('UploadQueue.pendingCount', () => {
  it('reflects items waiting for upload', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    const q = new UploadQueue(API_URL);
    expect(q.pendingCount).toBe(0);
    await q.enqueue(makeWav());
    expect(q.pendingCount).toBeGreaterThan(0);
  });
});

describe('UploadQueue config payload', () => {
  it('includes summary_style from saved processing_config', async () => {
    localStorage.setItem('processing_config', JSON.stringify({ summary_style: 'executive' }));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'job-3' }),
    });

    const q = new UploadQueue(API_URL);
    await q.enqueue(makeWav());
    await vi.runAllTimersAsync();

    const body = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as FormData;
    const config = JSON.parse(body.get('config') as string);
    expect(config.summary_style).toBe('executive');
    localStorage.removeItem('processing_config');
  });

  it('defaults summary_style to detailed when the saved value is invalid', async () => {
    localStorage.setItem('processing_config', JSON.stringify({ summary_style: 'bogus' }));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'job-4' }),
    });

    const q = new UploadQueue(API_URL);
    await q.enqueue(makeWav());
    await vi.runAllTimersAsync();

    const body = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as FormData;
    const config = JSON.parse(body.get('config') as string);
    expect(config.summary_style).toBe('detailed');
    localStorage.removeItem('processing_config');
  });

  it('defaults summary_style to detailed when no config is saved', async () => {
    localStorage.removeItem('processing_config');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ job_id: 'job-5' }),
    });

    const q = new UploadQueue(API_URL);
    await q.enqueue(makeWav());
    await vi.runAllTimersAsync();

    const body = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as FormData;
    const config = JSON.parse(body.get('config') as string);
    expect(config.summary_style).toBe('detailed');
  });
});
