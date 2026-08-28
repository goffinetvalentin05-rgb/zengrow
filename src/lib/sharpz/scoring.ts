const IMPACT_MIN = 1;
const IMPACT_MAX = 10;
const EFFORT_MIN = 1;
const EFFORT_MAX = 10;
const CONFIDENCE_MIN = 0;
const CONFIDENCE_MAX = 100;

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampImpact(value: number) {
  return clamp(value, IMPACT_MIN, IMPACT_MAX);
}

export function clampEffort(value: number) {
  return clamp(value, EFFORT_MIN, EFFORT_MAX);
}

export function clampConfidence(value: number) {
  return clamp(value, CONFIDENCE_MIN, CONFIDENCE_MAX);
}

/**
 * Score de priorité Sharpz (1–100).
 * Formule unique : impact × confiance × facilité.
 * impact 10, effort 1, confiance 100% → 100
 * impact 10, effort 10, confiance 100% → 10
 */
export function computeSharpzScore(impact: number, effort: number, confidence: number): number {
  const i = clampImpact(impact);
  const e = clampEffort(effort);
  const c = clampConfidence(confidence) / 100;
  const raw = i * c * (11 - e);
  return clamp(raw, 1, 100);
}

export function opportunityLevelFromPotential(potential: number): "low" | "medium" | "high" {
  if (potential >= 8) return "high";
  if (potential >= 5) return "medium";
  return "low";
}
