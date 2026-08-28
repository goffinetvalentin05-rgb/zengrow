import { describe, expect, it, vi, beforeEach } from "vitest";

const insertMock = vi.fn();
const maybeSingleMock = vi.fn();

vi.mock("@/src/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: maybeSingleMock,
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: insertMock,
        }),
      }),
    }),
  }),
}));

describe("createNotification dedup", () => {
  beforeEach(() => {
    vi.resetModules();
    maybeSingleMock.mockReset();
    insertMock.mockReset();
  });

  it("CAS 2 — skip si dedup_key existe déjà", async () => {
    maybeSingleMock.mockResolvedValue({ data: { id: "existing-id" }, error: null });
    const { createNotification } = await import("@/src/lib/notifications/create");
    const result = await createNotification({
      restaurantId: "r1",
      type: "growth_follow_up_due",
      title: "5 prospects à relancer",
      message: "Relances dues.",
      dedupKey: "growth_follow_up_due:2026-08-29:r1",
      severity: "attention",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.skipped).toBe(true);
      expect(result.id).toBe("existing-id");
    }
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("CAS 7 style — insert quand dedup absent", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    insertMock.mockResolvedValue({ data: { id: "new-id" }, error: null });
    const { createNotification } = await import("@/src/lib/notifications/create");
    const result = await createNotification({
      restaurantId: "r1",
      type: "growth_follow_up_due",
      title: "1 prospect à relancer",
      message: "Relance due.",
      dedupKey: "growth_follow_up_due:2026-08-29:r1",
      severity: "attention",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.skipped).toBeUndefined();
      expect(result.id).toBe("new-id");
    }
  });
});
