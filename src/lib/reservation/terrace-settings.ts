export type SeatingZone = "interior" | "terrace";

export type TerraceSettings = {
  terraceEnabled: boolean;
  terraceCapacity: number;
  terraceLabel: string;
};

export const DEFAULT_TERRACE_LABEL = "Terrasse";

const TERRACE_LABEL_MAX_LENGTH = 40;
const TERRACE_CAPACITY_MIN = 0;
const TERRACE_CAPACITY_MAX = 500;

export function normalizeTerraceLabel(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return DEFAULT_TERRACE_LABEL;
  return trimmed.slice(0, TERRACE_LABEL_MAX_LENGTH);
}

export function clampTerraceCapacity(value: number): number {
  if (!Number.isFinite(value)) return TERRACE_CAPACITY_MIN;
  return Math.max(TERRACE_CAPACITY_MIN, Math.min(TERRACE_CAPACITY_MAX, Math.round(value)));
}

export function zoneDisplayLabel(zone: SeatingZone, terraceLabel: string): string {
  if (zone === "terrace") return normalizeTerraceLabel(terraceLabel);
  return "Salle";
}

export function terraceSettingsFromRow(row: {
  terrace_enabled?: boolean | null;
  terrace_capacity?: number | null;
  terrace_label?: string | null;
}): TerraceSettings {
  return {
    terraceEnabled: row.terrace_enabled === true,
    terraceCapacity: clampTerraceCapacity(row.terrace_capacity ?? 0),
    terraceLabel: normalizeTerraceLabel(row.terrace_label),
  };
}
