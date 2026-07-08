import { describe, it, expect, afterEach, vi } from 'vitest';
import { getMaxUploadMb, isFileTooLarge, DEFAULT_MAX_UPLOAD_MB } from '@/lib/upload-limits';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getMaxUploadMb', () => {
  it('defaults to 250 MB when env var is unset', () => {
    expect(getMaxUploadMb()).toBe(DEFAULT_MAX_UPLOAD_MB);
    expect(DEFAULT_MAX_UPLOAD_MB).toBe(250);
  });
});

describe('isFileTooLarge', () => {
  it('accepts a file exactly at the cap', () => {
    expect(isFileTooLarge(250 * 1024 * 1024, 250)).toBe(false);
  });

  it('rejects a file one byte over the cap', () => {
    expect(isFileTooLarge(250 * 1024 * 1024 + 1, 250)).toBe(true);
  });

  it('accepts small files', () => {
    expect(isFileTooLarge(5 * 1024 * 1024, 250)).toBe(false);
  });

  it('uses the default cap when none is passed', () => {
    expect(isFileTooLarge(DEFAULT_MAX_UPLOAD_MB * 1024 * 1024 + 1)).toBe(true);
    expect(isFileTooLarge(1024)).toBe(false);
  });
});
