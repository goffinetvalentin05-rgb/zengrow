export type FloorPlanPublicSelectionMode = "automatic" | "area" | "table";

export function normalizeFloorPlanPublicSelectionMode(value: unknown): FloorPlanPublicSelectionMode {
  if (value === "automatic" || value === "area" || value === "table") return value;
  // Legacy DB value
  if (value === "zone") return "area";
  return "automatic";
}

