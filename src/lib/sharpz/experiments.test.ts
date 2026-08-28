import { describe, expect, it } from "vitest";
import {
  buildExperimentConclusion,
  buildExperimentResultSummary,
  computeMetricDeltas,
  selectExperimentsNeedingAttention,
} from "@/src/lib/sharpz/experiments";

describe("experiments P0.3", () => {
  it("CAS 4 — before = 0 → pas de % invalide", () => {
    const deltas = computeMetricDeltas(0, 5);
    expect(deltas.deltaAbsolute).toBe(5);
    expect(deltas.deltaPercent).toBeNull();
  });

  it("computeMetricDeltas with valid before", () => {
    const deltas = computeMetricDeltas(2.4, 2.7);
    expect(deltas.deltaAbsolute).toBeCloseTo(0.3, 5);
    expect(deltas.deltaPercent).toBe(12.5);
  });

  it("CAS 2 style — missing data → honest conclusion", () => {
    expect(
      buildExperimentConclusion({
        before: null,
        after: null,
        deltaPercent: null,
        metricAvailable: false,
      }),
    ).toContain("insuffisantes");
  });

  it("CAS 3 — positive observed variation without causal claim", () => {
    const conclusion = buildExperimentConclusion({
      before: 2.4,
      after: 2.7,
      deltaPercent: 12.5,
      metricAvailable: true,
    });
    expect(conclusion).toContain("12.5");
    expect(conclusion.toLowerCase()).not.toContain("a causé");
    expect(conclusion).toContain("observée");
  });

  it("result summary formats before/after/delta", () => {
    const summary = buildExperimentResultSummary({
      before: 100,
      after: 112,
      deltaAbsolute: 12,
      deltaPercent: 12,
    });
    expect(summary).toContain("Avant");
    expect(summary).toContain("Après");
    expect(summary).toContain("+12 %");
  });

  it("CAS 6 — only running experiments near planned end", () => {
    const now = new Date(2026, 7, 28, 12, 0, 0);
    const due = selectExperimentsNeedingAttention(
      [
        {
          id: "1",
          status: "running",
          plannedEndAt: new Date(2026, 7, 28, 18, 0, 0).toISOString(),
          hypothesis: "A",
          title: "A",
        },
        {
          id: "2",
          status: "running",
          plannedEndAt: new Date(2026, 8, 10, 12, 0, 0).toISOString(),
          hypothesis: "B",
          title: "B",
        },
        {
          id: "3",
          status: "completed",
          plannedEndAt: new Date(2026, 7, 28, 12, 0, 0).toISOString(),
          hypothesis: "C",
          title: "C",
        },
      ],
      now,
    );
    expect(due.map((item) => item.id)).toEqual(["1"]);
  });
});
