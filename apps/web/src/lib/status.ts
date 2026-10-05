/** A bot only counts as online while the runtime keeps reporting. If it goes quiet, it is offline. */
export const HEARTBEAT_STALE_MS = 45_000;

export function effectiveStatus(status: string, seenAt: Date | null, now = Date.now()): string {
  if (status !== "online") return status;
  return seenAt && now - seenAt.getTime() <= HEARTBEAT_STALE_MS ? "online" : "offline";
}
