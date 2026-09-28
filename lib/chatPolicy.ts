export const CHAT_GRACE_MS = 60 * 60 * 1000; // 1 jam

export interface ChatState {
  open: boolean;
  /** ISO waktu chat ditutup; null kalau pesanan belum selesai. */
  closesAt: string | null;
}

export function getChatState(
  order: {
    status: string;
    timeline?: { status: string; timestamp: string }[] | null;
    /** Dipakai kalau timeline tidak punya catatan "done" (mis. updated_at dari database). */
    fallbackDoneAt?: string | null;
  },
  nowMs: number = Date.now()
): ChatState {
  if (order.status !== "done") return { open: true, closesAt: null };

  const doneTimes = (order.timeline || [])
    .filter((t) => t.status === "done")
    .map((t) => Date.parse(t.timestamp))
    .filter((n) => !Number.isNaN(n));
  let doneAt = doneTimes.length ? Math.max(...doneTimes) : NaN;
  if (Number.isNaN(doneAt) && order.fallbackDoneAt) doneAt = Date.parse(order.fallbackDoneAt);

  // Waktu selesai tidak diketahui -> anggap sudah ditutup (aman).
  if (Number.isNaN(doneAt)) return { open: false, closesAt: null };

  const closesAt = doneAt + CHAT_GRACE_MS;
  return { open: nowMs < closesAt, closesAt: new Date(closesAt).toISOString() };
}
