import { openDB, type IDBPDatabase } from 'idb';
import type { SummaryStyle } from '@/lib/config-context';

const DB_NAME = 'autonomous-upload-queue';
const DB_VERSION = 1;
const RETRY_DELAYS_MS = [5_000, 15_000, 60_000, 300_000, 900_000];
const MAX_ATTEMPTS = 8;
const CONCURRENCY = 2;
const NON_RETRIABLE_STATUSES = new Set([401, 403, 413]);

class UploadError extends Error {
  constructor(message: string, public readonly nonRetriable: boolean) {
    super(message);
  }
}

interface QueueItem {
  id: string;
  wavBlob: Blob;
  userInput: string;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  attempts: number;
  nextRetryAt: number;
  createdAt: number;
}

function readSavedSummaryStyle(): SummaryStyle {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem('processing_config')
      : null;
    if (raw) {
      const style = JSON.parse(raw).summary_style;
      if (style === 'concise' || style === 'detailed' || style === 'executive') return style;
    }
  } catch {
    // Corrupt localStorage — fall through to default
  }
  return 'concise';
}

export class UploadQueue {
  private _apiUrl: string;
  private _active = 0;
  /** In-memory map for fast access and pendingCount tracking */
  private _items = new Map<string, QueueItem>();
  private _dbPromise: Promise<IDBPDatabase> | null = null;

  /** Called with the live pending count whenever it changes. */
  onCountChange: ((count: number) => void) | null = null;

  constructor(apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  get pendingCount(): number {
    let count = 0;
    for (const item of this._items.values()) {
      if (item.status === 'pending' || item.status === 'uploading') count++;
    }
    return count;
  }

  private _notifyCount(): void {
    this.onCountChange?.(this.pendingCount);
  }

  async enqueue(wavBlob: Blob, userInput = ''): Promise<void> {
    const item: QueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      wavBlob,
      userInput,
      status: 'pending',
      attempts: 0,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
    };
    this._items.set(item.id, item);
    this._notifyCount();
    this._persistItem(item).catch(() => {/* ignore persistence errors */});
    this._drain();
  }

  async restorePending(): Promise<void> {
    try {
      const db = await this._getDB();
      const all = await db.getAll('queue');
      for (const item of all) {
        if (item.status === 'pending' || item.status === 'uploading') {
          // Reset uploading → pending in case we crashed mid-upload
          item.status = 'pending';
          // Normalise field added after some items were already persisted
          item.userInput = item.userInput ?? '';
          this._items.set(item.id, item);
        }
      }
      if (this.pendingCount > 0) {
        this._notifyCount();
        this._drain();
      }
    } catch {
      // DB not available, skip restore
    }
  }

  private _getDB(): Promise<IDBPDatabase> {
    if (!this._dbPromise) {
      this._dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('queue')) {
            db.createObjectStore('queue', { keyPath: 'id' });
          }
        },
      });
    }
    return this._dbPromise;
  }

  private async _persistItem(item: QueueItem): Promise<void> {
    try {
      const db = await this._getDB();
      await db.put('queue', item);
    } catch {
      // Ignore persistence errors — in-memory state is authoritative
    }
  }

  private async _deleteItem(id: string): Promise<void> {
    try {
      const db = await this._getDB();
      await db.delete('queue', id);
    } catch {
      // Ignore deletion errors
    }
  }

  private _drain(): void {
    if (this._active >= CONCURRENCY) return;
    void this._scheduleNext();
  }

  private async _scheduleNext(): Promise<void> {
    if (this._active >= CONCURRENCY) return;

    const now = Date.now();
    const next = Array.from(this._items.values())
      .filter((i) => i.status === 'pending' && i.nextRetryAt <= now)
      .sort((a, b) => a.createdAt - b.createdAt)[0];

    if (!next) return;

    this._active++;
    next.status = 'uploading';
    this._persistItem(next).catch(() => {/* ignore */});

    try {
      const form = new FormData();
      form.append('file', next.wavBlob, `autonomous_${next.id}.wav`);
      const config: Record<string, unknown> = {
        custom_field_only: false,
        summary_style: readSavedSummaryStyle(),
      };
      const userInput = (next.userInput ?? '').trim();
      if (userInput) config.user_input = userInput;
      form.append('config', JSON.stringify(config));

      const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
      const res = await fetch(`${this._apiUrl}/api/process-audio`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        throw new UploadError(`HTTP ${res.status}`, NON_RETRIABLE_STATUSES.has(res.status));
      }

      next.status = 'done';
      this._items.delete(next.id);
      this._notifyCount();
      this._deleteItem(next.id).catch(() => {/* ignore */});
    } catch (err) {
      next.attempts++;
      const exhausted = next.attempts >= MAX_ATTEMPTS;
      const nonRetriable = err instanceof UploadError && err.nonRetriable;
      if (exhausted || nonRetriable) {
        next.status = 'failed';
        this._items.delete(next.id);
        this._notifyCount();
        this._deleteItem(next.id).catch(() => {/* ignore */});
      } else {
        const delay =
          RETRY_DELAYS_MS[Math.min(next.attempts - 1, RETRY_DELAYS_MS.length - 1)];
        next.status = 'pending';
        next.nextRetryAt = Date.now() + delay;
        this._persistItem(next).catch(() => {/* ignore */});
        setTimeout(() => this._drain(), delay);
      }
    } finally {
      this._active--;
      this._drain();
    }
  }
}
