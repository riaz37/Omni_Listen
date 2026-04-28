import type { RecordingEntry } from '@/app/(app)/settings/types';

const DB_NAME = 'esap-recording-vault';
const DB_VERSION = 1;

/** Monotonically increasing counter used to break ties when two recordings
 *  share the same millisecond timestamp (common in tests / fast machines). */
let _seq = 0;

interface ChunkRow {
  id: string;
  recordingId: string;
  index: number;
  buffer: ArrayBuffer;
  mimeType: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const store = db.createObjectStore('chunks', { keyPath: 'id' });
        store.createIndex('byRecording', 'recordingId', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(
  db: IDBDatabase,
  stores: string | string[],
  mode: IDBTransactionMode,
): IDBTransaction {
  return db.transaction(stores, mode);
}

function put<T>(store: IDBObjectStore, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function getAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function getAllByIndex<T>(
  store: IDBObjectStore,
  indexName: string,
  key: IDBValidKey,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = store.index(indexName).getAll(key);
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function deleteKey(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function createRecording(
  id: string,
  fileName: string,
  mimeType: string,
): Promise<void> {
  const db = await openDB();
  const entry: RecordingEntry & { _seq: number } = {
    id,
    fileName,
    mimeType,
    status: 'recording',
    startedAt: new Date().toISOString(),
    stoppedAt: null,
    duration: 0,
    size: 0,
    _seq: ++_seq,
  };
  const t = tx(db, 'recordings', 'readwrite');
  await put(t.objectStore('recordings'), entry);
}

export async function appendChunk(
  recordingId: string,
  index: number,
  blob: Blob,
): Promise<void> {
  const buffer = await blob.arrayBuffer();
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(['recordings', 'chunks'], 'readwrite');

    const chunkReq = t.objectStore('chunks').put({
      id: `${recordingId}_${index}`,
      recordingId,
      index,
      buffer,
      mimeType: blob.type,
    });

    chunkReq.onsuccess = () => {
      const recReq = t.objectStore('recordings').get(recordingId);
      recReq.onsuccess = () => {
        const entry: RecordingEntry & { _seq?: number } = recReq.result;
        if (!entry) { resolve(); return; }
        entry.size += blob.size;
        const updateReq = t.objectStore('recordings').put(entry);
        updateReq.onsuccess = () => resolve();
        updateReq.onerror = () => reject(updateReq.error);
      };
      recReq.onerror = () => reject(recReq.error);
    };
    chunkReq.onerror = () => reject(chunkReq.error);
  });
}

export async function updateRecording(
  id: string,
  patch: Partial<Omit<RecordingEntry, 'id'>>,
): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction('recordings', 'readwrite');
    const store = t.objectStore('recordings');
    const req = store.get(id);
    req.onsuccess = () => {
      const entry: RecordingEntry = req.result;
      if (!entry) { resolve(); return; }
      const updateReq = store.put({ ...entry, ...patch });
      updateReq.onsuccess = () => resolve();
      updateReq.onerror = () => reject(updateReq.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getRecording(id: string): Promise<RecordingEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'recordings', 'readonly').objectStore('recordings').get(id);
    req.onsuccess = () => resolve(req.result as RecordingEntry | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function listRecordings(): Promise<RecordingEntry[]> {
  const db = await openDB();
  const t = tx(db, 'recordings', 'readonly');
  const all = await getAll<RecordingEntry & { _seq?: number }>(t.objectStore('recordings'));
  return all
    .sort((a, b) => {
      const timeDiff = new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      if (timeDiff !== 0) return timeDiff;
      // Break millisecond ties using the insertion sequence counter.
      return (b._seq ?? 0) - (a._seq ?? 0);
    })
    .map(({ _seq: _ignored, ...entry }) => entry as RecordingEntry);
}

export async function getChunks(recordingId: string): Promise<Blob[]> {
  const db = await openDB();
  const t = tx(db, 'chunks', 'readonly');
  const rows = await getAllByIndex<ChunkRow>(
    t.objectStore('chunks'),
    'byRecording',
    recordingId,
  );
  return rows
    .sort((a, b) => a.index - b.index)
    .map((r) => new Blob([r.buffer], { type: r.mimeType }));
}

export async function assembleBlob(recordingId: string): Promise<Blob> {
  const entry = await getRecording(recordingId);
  const chunks = await getChunks(recordingId);
  return new Blob(chunks, { type: entry?.mimeType ?? 'audio/webm' });
}

export async function deleteChunks(recordingId: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction('chunks', 'readwrite');
    const req = t.objectStore('chunks').index('byRecording').openCursor(IDBKeyRange.only(recordingId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) { resolve(); return; }
      cursor.delete();
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(['recordings', 'chunks'], 'readwrite');
    const chunkReq = t.objectStore('chunks').index('byRecording').openCursor(IDBKeyRange.only(id));
    chunkReq.onsuccess = () => {
      const cursor = chunkReq.result;
      if (cursor) { cursor.delete(); cursor.continue(); return; }
      const delReq = t.objectStore('recordings').delete(id);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    };
    chunkReq.onerror = () => reject(chunkReq.error);
  });
}
