import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRecording,
  appendChunk,
  updateRecording,
  getRecording,
  listRecordings,
  getChunks,
  assembleBlob,
  deleteChunks,
  deleteRecording,
} from '@/lib/recording-vault';

beforeEach(async () => {
  // Clear all recordings between tests
  const all = await listRecordings();
  await Promise.all(all.map((r) => deleteRecording(r.id)));
});

describe('createRecording', () => {
  it('creates an entry with status recording', async () => {
    await createRecording('id-1', 'test.webm', 'audio/webm');
    const entry = await getRecording('id-1');
    expect(entry).toBeDefined();
    expect(entry!.status).toBe('recording');
    expect(entry!.fileName).toBe('test.webm');
    expect(entry!.duration).toBe(0);
    expect(entry!.size).toBe(0);
  });
});

describe('appendChunk', () => {
  it('stores chunks and accumulates size', async () => {
    await createRecording('id-2', 'test.webm', 'audio/webm');
    const chunk1 = new Blob(['hello'], { type: 'audio/webm' });
    const chunk2 = new Blob([' world'], { type: 'audio/webm' });
    await appendChunk('id-2', 0, chunk1);
    await appendChunk('id-2', 1, chunk2);

    const entry = await getRecording('id-2');
    expect(entry!.size).toBe(chunk1.size + chunk2.size);

    const chunks = await getChunks('id-2');
    expect(chunks).toHaveLength(2);
    expect(chunks[0].size).toBe(chunk1.size);
    expect(chunks[1].size).toBe(chunk2.size);
  });

  it('returns chunks in index order regardless of insertion order', async () => {
    await createRecording('id-order', 'test.webm', 'audio/webm');
    await appendChunk('id-order', 1, new Blob(['second']));
    await appendChunk('id-order', 0, new Blob(['first']));
    const chunks = await getChunks('id-order');
    const texts = await Promise.all(chunks.map((c) => c.text()));
    expect(texts).toEqual(['first', 'second']);
  });
});

describe('updateRecording', () => {
  it('patches only the provided fields', async () => {
    await createRecording('id-3', 'test.webm', 'audio/webm');
    await updateRecording('id-3', { status: 'stopped', duration: 42 });
    const entry = await getRecording('id-3');
    expect(entry!.status).toBe('stopped');
    expect(entry!.duration).toBe(42);
    expect(entry!.fileName).toBe('test.webm');
  });
});

describe('assembleBlob', () => {
  it('assembles chunks into a single blob with correct mime type', async () => {
    await createRecording('id-4', 'test.webm', 'audio/webm');
    await appendChunk('id-4', 0, new Blob(['part1'], { type: 'audio/webm' }));
    await appendChunk('id-4', 1, new Blob(['part2'], { type: 'audio/webm' }));
    const blob = await assembleBlob('id-4');
    expect(blob.type).toBe('audio/webm');
    expect(await blob.text()).toBe('part1part2');
  });
});

describe('deleteChunks', () => {
  it('removes chunks but keeps the recording entry', async () => {
    await createRecording('id-5', 'test.webm', 'audio/webm');
    await appendChunk('id-5', 0, new Blob(['data']));
    await deleteChunks('id-5');
    const chunks = await getChunks('id-5');
    expect(chunks).toHaveLength(0);
    const entry = await getRecording('id-5');
    expect(entry).toBeDefined();
  });
});

describe('deleteRecording', () => {
  it('removes the entry and all chunks', async () => {
    await createRecording('id-6', 'test.webm', 'audio/webm');
    await appendChunk('id-6', 0, new Blob(['data']));
    await deleteRecording('id-6');
    expect(await getRecording('id-6')).toBeUndefined();
    expect(await getChunks('id-6')).toHaveLength(0);
  });
});

describe('listRecordings', () => {
  it('returns all entries sorted newest first', async () => {
    await createRecording('id-a', 'a.webm', 'audio/webm');
    await createRecording('id-b', 'b.webm', 'audio/webm');
    const list = await listRecordings();
    expect(list.length).toBeGreaterThanOrEqual(2);
    const idx = (id: string) => list.findIndex((r) => r.id === id);
    expect(idx('id-b')).toBeLessThan(idx('id-a'));
  });
});
