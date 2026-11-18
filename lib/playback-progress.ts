/** Optional, device-local progress. Never blocks reading or playback. */
const prefix = 'reservas:progress:v1:';

export function readProgress(key: string): number {
  try {
    const raw = localStorage.getItem(prefix + key);
    if (!raw) return 0;
    const record: unknown = JSON.parse(raw);
    if (!record || typeof record !== 'object' || !('position' in record)) return 0;
    const value = record.position;
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}

export function writeProgress(key: string, position: number): void {
  if (!Number.isFinite(position) || position < 0) return;
  try { localStorage.setItem(prefix + key, JSON.stringify({ position })); } catch { /* Storage is optional. */ }
}
