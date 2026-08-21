import { describe, expect, it } from "vitest";
import { toPreview, previewLeaksResult, parseStoredResult } from "@/src/lib/style-analysis/serialize";
import type { StyleAnalysisRow } from "@/src/lib/fitme/routing";
import { resolveFitmePath } from "@/src/lib/fitme/routing";
import { styleAnalysisResultSchema, stylePreferencesSchema } from "@/src/lib/style-analysis/schemas";

const result = styleAnalysisResultSchema.parse({
  primaryStyle: { name: "Clean Minimal", score: 94, reason: "Met particulièrement en valeur vos lignes." },
  secondaryStyle: { name: "Smart Casual", score: 88, reason: "Fonctionne bien visuellement au quotidien." },
  bestColors: [
    { name: "Cream", hex: "#E8DFD0", reason: "Éclaire." },
    { name: "Navy", hex: "#1F3347", reason: "Profondeur." },
    { name: "Olive", hex: "#6B6A43", reason: "Chaleur." },
  ],
  lessFlatteringColors: [
    { name: "Fuchsia", hex: "#E23CA0", reason: "Trop vif." },
    { name: "Ice blue", hex: "#9BB7D4", reason: "Trop froid." },
  ],
  notes: ["Privilégiez les neutres chauds.", "Gardez vos tenues peu chargées.", "Le contraste moyen fonctionne bien."],
});

function row(overrides: Partial<StyleAnalysisRow> = {}): StyleAnalysisRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    user_id: "user",
    status: "preview_ready",
    payment_status: "unpaid",
    is_unlocked: false,
    primary_style: "Clean Minimal",
    primary_style_score: 94,
    secondary_style: "Smart Casual",
    secondary_style_score: 88,
    color_profile: null,
    style_notes: { result, notes: result.notes },
    preferences: {},
    preview_data: {},
    error_message: null,
    looks_job_started_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    ...overrides,
  };
}

describe("FITME preview serialization", () => {
  it("does not leak style names or full palette payload", () => {
    const preview = toPreview(row());
    expect(preview.revealedColors).toHaveLength(2);
    expect(preview.revealedColors[0]?.hex).toBe("#E8DFD0");
    expect(previewLeaksResult(preview)).toBe(false);
    expect(JSON.stringify(preview)).not.toContain("Clean Minimal");
    expect(JSON.stringify(preview)).not.toContain("Smart Casual");
  });

  it("parses stored analysis result", () => {
    expect(parseStoredResult(row())?.primaryStyle.name).toBe("Clean Minimal");
  });
});

describe("FITME routing", () => {
  it("sends unpaid users with no analysis to onboarding", () => {
    expect(resolveFitmePath(null)).toBe("/onboarding");
  });

  it("resumes draft onboarding", () => {
    expect(resolveFitmePath(row({ status: "draft" }))).toBe("/onboarding");
  });

  it("routes analyzing to analysis page", () => {
    expect(resolveFitmePath(row({ status: "analyzing" }))).toBe(
      "/analysis/11111111-1111-1111-1111-111111111111",
    );
  });

  it("routes paywall statuses to preview", () => {
    expect(resolveFitmePath(row({ status: "preview_ready" }))).toContain("/preview");
  });

  it("routes paid generation to payment success", () => {
    expect(resolveFitmePath(row({ status: "paid", payment_status: "paid", is_unlocked: true }))).toContain(
      "/payment/success",
    );
  });

  it("routes completed profiles to style-profile id", () => {
    expect(
      resolveFitmePath(row({ status: "completed", payment_status: "paid", is_unlocked: true })),
    ).toBe("/style-profile/11111111-1111-1111-1111-111111111111");
  });
});

describe("FITME schemas", () => {
  it("caps universes at 3", () => {
    const parsed = stylePreferencesSchema.safeParse({
      universes: ["clean-minimal", "old-money", "streetwear", "workwear"],
    });
    expect(parsed.success).toBe(false);
  });
});
