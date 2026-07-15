// @vitest-environment node
//
// Real-axios integration for the stall-aware upload: the unit tests exercise
// the orchestration with fakes; these prove the two wiring assumptions that
// actually fix the production bug — a per-request `timeout: 0` overrides the
// instance-level default (the flat cap that killed slow uploads), and the
// AbortSignal from the stall guard terminates a genuinely hung request.
import { describe, it, expect, afterEach } from 'vitest';
import http from 'http';
import type { AddressInfo } from 'net';
import axios from 'axios';
import { uploadWithStallRetry } from '@/lib/upload-stall';

let server: http.Server | null = null;

function listen(handler: http.RequestListener): Promise<string> {
  server = http.createServer(handler);
  return new Promise((resolve) => {
    server!.listen(0, '127.0.0.1', () => {
      const { port } = server!.address() as AddressInfo;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

afterEach(() => {
  server?.close();
  server?.closeAllConnections?.();
  server = null;
});

describe('uploadWithStallRetry with real axios', () => {
  it('timeout: 0 lets an upload outlive the instance default timeout', async () => {
    const url = await listen((req, res) => {
      req.resume();
      // Respond only after the instance default below would have fired.
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ job_id: 'slow-but-fine' }));
      }, 2500);
    });

    // Mirrors production: instance default would kill this request...
    const client = axios.create({ baseURL: url, timeout: 1000 });

    const result = await uploadWithStallRetry(async (signal, onUploadProgress) => {
      // ...but the per-request override (as used by uploadAudio) must win.
      const response = await client.post('/api/process-audio', 'x'.repeat(1024), {
        timeout: 0,
        signal,
        onUploadProgress,
      });
      return response.data;
    }, { stallMs: 10_000, retries: 0 });

    expect(result).toEqual({ job_id: 'slow-but-fine' });
  }, 15_000);

  it('the stall guard aborts a server that never responds, and retries once', async () => {
    let requests = 0;
    const url = await listen((req) => {
      requests++;
      req.resume(); // swallow the body, never answer
    });

    const client = axios.create({ baseURL: url });

    await expect(
      uploadWithStallRetry(async (signal, onUploadProgress) => {
        const response = await client.post('/api/process-audio', 'x'.repeat(1024), {
          timeout: 0,
          signal,
          onUploadProgress,
        });
        return response.data;
      }, { stallMs: 800 }),
    ).rejects.toThrow(/stalled/i);

    expect(requests).toBe(2); // original attempt + exactly one retry
  }, 15_000);
});
