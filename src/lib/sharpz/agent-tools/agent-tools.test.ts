import { describe, expect, it } from "vitest";
import {
  parseToolInput,
  stripServerOnlyFields,
  createActionInputSchema,
} from "@/src/lib/sharpz/agent-tools/schemas";
import { handleCreateAction } from "@/src/lib/sharpz/agent-tools/handlers/create-action";
import { handleAnalyzeTraffic } from "@/src/lib/sharpz/agent-tools/handlers/analyze-traffic";
import { handleCreateExperiment } from "@/src/lib/sharpz/agent-tools/handlers/create-experiment";
import type { AgentToolExecutionContext } from "@/src/lib/sharpz/agent-tools/types";

const baseContext: AgentToolExecutionContext = {
  session: {
    supabase: {} as AgentToolExecutionContext["session"]["supabase"],
    user: { id: "user-1" } as AgentToolExecutionContext["session"]["user"],
    restaurant: {
      id: "rest-1",
      name: "Test",
      subscription_plan: "starter",
      subscription_status: "active",
      trial_end_date: null,
      stripe_subscription_id: null,
    },
  },
  sharpzContext: {
    openActions: [],
    actions: [],
    prospects: [],
    primaryObjective: null,
    capabilities: {
      prospectSearch: false,
      competitorSearch: false,
      trafficAnalytics: false,
      revenueData: false,
    },
  } as unknown as AgentToolExecutionContext["sharpzContext"],
  userMessage: "test",
};

describe("agent-tools schemas", () => {
  it("stripServerOnlyFields removes restaurant_id from model args", () => {
    expect(stripServerOnlyFields({ title: "x", restaurant_id: "evil" })).toEqual({ title: "x" });
  });

  it("createActionInputSchema rejects empty title", () => {
    const parsed = parseToolInput(createActionInputSchema, { title: "" });
    expect(parsed.ok).toBe(false);
  });
});

describe("handleCreateAction", () => {
  it("returns confirmation_required with score", async () => {
    const result = await handleCreateAction(baseContext, {
      title: "Revoir mon pricing",
      category: "pricing",
      impact: 8,
      effort: 4,
      confidence: 75,
      why: "Aligner offre et ICP",
    });
    expect(result.status).toBe("confirmation_required");
    expect(result.proposedAction?.title).toBe("Revoir mon pricing");
    expect(result.proposedAction?.score).toBeGreaterThan(0);
  });

  it("rejects duplicate action titles", async () => {
    const ctx = {
      ...baseContext,
      sharpzContext: {
        ...baseContext.sharpzContext,
        openActions: [{ id: "1", title: "Revoir mon pricing", status: "todo", score: 50, category: "pricing" }],
      },
    } as AgentToolExecutionContext;
    const result = await handleCreateAction(ctx, {
      title: "Revoir mon pricing",
      category: "pricing",
      impact: 7,
      effort: 5,
      confidence: 70,
    });
    expect(result.status).toBe("error");
  });
});

describe("handleAnalyzeTraffic", () => {
  it("returns missing_integration when no traffic data", async () => {
    const result = await handleAnalyzeTraffic(
      {
        ...baseContext,
        session: {
          ...baseContext.session,
          supabase: {
            rpc: async () => ({ data: { visitors7d: 0, pageviews7d: 0 }, error: null }),
            from: () => ({
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { site_key: "abc" } }),
                }),
              }),
            }),
          } as unknown as AgentToolExecutionContext["session"]["supabase"],
        },
      },
      { periodDays: 7 },
    );
    expect(result.status).toBe("missing_integration");
  });
});

describe("handleCreateExperiment", () => {
  it("returns confirmation_required for hypothesis", async () => {
    const result = await handleCreateExperiment(baseContext, {
      hypothesis: "Baisser le prix de 10% augmente les conversions landing.",
    });
    expect(result.status).toBe("confirmation_required");
    expect(result.proposedExperiment?.hypothesis).toContain("prix");
  });
});
