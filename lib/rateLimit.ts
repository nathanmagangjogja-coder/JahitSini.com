/** Pembatas percobaan login sederhana (in-memory, per instance server). */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function isBlocked(key: string): boolean {
  const a = attempts.get(key);
  if (!a) return false;
  if (a.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return a.count >= MAX;
}

export function recordFailure(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.resetAt < now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else a.count += 1;
}

export function clearFailures(key: string) {
  attempts.delete(key);
}

export function clientKey(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
}
