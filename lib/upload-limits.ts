// Client-side upload size guard. Mirrors the backend's per-file cap
// (MAX_UPLOAD_MB in backend/routers/processing.py, default 250 MB) so doomed
// uploads are rejected instantly instead of streaming for minutes and dying
// with a 413 the browser may never surface. Keep the two in sync via env:
// backend MAX_UPLOAD_MB <-> frontend NEXT_PUBLIC_MAX_UPLOAD_MB.
export const DEFAULT_MAX_UPLOAD_MB = 250;

export function getMaxUploadMb(): number {
  const raw = process.env.NEXT_PUBLIC_MAX_UPLOAD_MB;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_MB;
}

export function isFileTooLarge(sizeBytes: number, maxMb: number = getMaxUploadMb()): boolean {
  return sizeBytes > maxMb * 1024 * 1024;
}
