import { describe, expect, it, vi } from "vitest";
import { executeAgentTool } from "@/src/lib/sharpz/agent-tools/execute";
import { handleSearchProspects } from "@/src/lib/sharpz/agent-tools/handlers/search-prospects";
import type { AgentToolExecutionContext } from "@/src/lib/sharpz/agent-tools/types";

vi.mock("@/src/lib/sharpz/prospect-search/search-prospects", () => ({
  searchProspects: vi.fn(async () => ({
    reply: "2 prospects trouvés.",
    prospects: [{ company: "Club Sportif Genève", url: "https://example.com" }],
    requested: 5,
    found: 2,
    duplicatesRemoved: 0,
    provider: "tavily",
  })),
}));

vi.mock("@/src/lib/sharpz/prospect-search/providers", () => ({
  isProspectSearchConfigured: () => true,
}));

const ctx = {
  session: {
    supabase: {} as AgentToolExecutionContext["session"]["supabase"],
    user: { id: "u1" } as AgentToolExecutionContext["session"]["user"],
    restaurant: {
      id: "r1",
      name: "SaaS",
      subscription_plan: "starter" as const,
      subscription_status: "active" as const,
      trial_end_date: null,
      stripe_subscription_id: null,
    },
  },
  sharpzContext: {} as AgentToolExecutionContext["sharpzContext"],
  userMessage: "Trouve-moi 5 prospects",
} as AgentToolExecutionContext;

describe("P0.1 scenario handlers", () => {
  it("search_prospects — Trouve-moi 5 prospects", async () => {
    const result = await executeAgentTool("search_prospects", ctx, {
      query: "clubs sportifs Genève ICP",
      count: 5,
    });
    expect(result.status).toBe("ok");
    expect(result.prospects?.length).toBeGreaterThan(0);
  });

  it("create_action — Ajoute une action pour revoir mon pricing", async () => {
    const result = await executeAgentTool(
      "create_action",
      {
        ...ctx,
        sharpzContext: { openActions: [], actions: [], primaryObjective: null } as unknown as AgentToolExecutionContext["sharpzContext"],
      },
      { title: "Revoir mon pricing", category: "pricing", why: "Optimiser conversion" },
    );
    expect(result.status).toBe("confirmation_required");
    expect(result.proposedAction?.title).toContain("pricing");
  });

  it("schedule_followup — Relance ce prospect dans 7 jours", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              limit: async () => ({
                data: [{ id: "p-uuid", company: "Acme", name: "Alice", status: "follow_up_1" }],
                error: null,
              }),
            }),
            ilike: () => ({
              limit: async () => ({
                data: [{ id: "p-uuid", company: "Acme", name: "Alice", status: "follow_up_1" }],
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
    const result = await executeAgentTool(
      "schedule_followup",
      { ...ctx, session: { ...ctx.session, supabase: supabase as unknown as AgentToolExecutionContext["session"]["supabase"] } },
      { company: "Acme", daysFromNow: 7 },
    );
    expect(result.status).toBe("confirmation_required");
    expect(result.proposedFollowUp?.daysFromNow).toBe(7);
  });

  it("analyze_traffic — Analyse mon trafic (missing_integration)", async () => {
    const result = await executeAgentTool(
      "analyze_traffic",
      {
        ...ctx,
        session: {
          ...ctx.session,
          supabase: {
            rpc: async () => ({ data: { visitors7d: 0, pageviews7d: 0 }, error: null }),
            from: () => ({
              select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { site_key: "k" } }) }) }),
            }),
          } as unknown as AgentToolExecutionContext["session"]["supabase"],
        },
      },
      { periodDays: 7 },
    );
    expect(result.status).toBe("missing_integration");
  });

  it("create_experiment — Crée une expérience pour tester mon pricing", async () => {
    const result = await executeAgentTool(
      "create_experiment",
      { ...ctx, sharpzContext: { actions: [] } as unknown as AgentToolExecutionContext["sharpzContext"] },
      { hypothesis: "Tester un pricing annuel vs mensuel sur la landing." },
    );
    expect(result.status).toBe("confirmation_required");
    expect(result.proposedExperiment?.hypothesis).toContain("pricing");
  });
});

describe("handleSearchProspects direct", () => {
  it("delegates to searchProspects engine", async () => {
    const result = await handleSearchProspects(ctx, { query: "prospects B2B", count: 5 });
    expect(result.status).toBe("ok");
  });
});
