import type { ConnectionUiStatus } from "@/src/lib/discovery/types";

export function connectionStatusForViewer(
  viewerId: string,
  row: { requester_id: string; receiver_id: string; status: string } | null | undefined,
): ConnectionUiStatus {
  if (!row) return "none";
  if (row.status === "accepted") return "accepted";
  if (row.status !== "pending") return "none";
  if (row.requester_id === viewerId) return "pending_out";
  if (row.receiver_id === viewerId) return "pending_in";
  return "none";
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
