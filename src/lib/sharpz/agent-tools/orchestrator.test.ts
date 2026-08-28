import { describe, expect, it, vi, beforeEach } from "vitest";
import { runAgentOrchestrator } from "@/src/lib/sharpz/agent-tools/orchestrator";
import * as openai from "@/src/lib/ai/openai";
import * as execute from "@/src/lib/sharpz/agent-tools/execute";
import type { AgentToolExecutionContext } from "@/src/lib/sharpz/agent-tools/types";

const session = {
  supabase: {} as AgentToolExecutionContext["session"]["supabase"],
  user: { id: "user-1" } as AgentToolExecutionContext["session"]["user"],
  restaurant: {
    id: "rest-1",
    name: "Test SaaS",
    subscription_plan: "starter" as const,
    subscription_status: "active" as const,
    trial_end_date: null,
    stripe_subscription_id: null,
  },
};

const sharpzContext = {
  openActions: [],
  actions: [],
  prospects: [{ id: "p1", company: "Acme", name: "Bob", status: "follow_up_1", nextFollowUpAt: null }],
  followUpProspects: [],
  capabilities: { prospectSearch: true, competitorSearch: false, trafficAnalytics: false, revenueData: false },
} as unknown as AgentToolExecutionContext["sharpzContext"];

describe("runAgentOrchestrator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("aggregates create_action tool result into proposedActions", async () => {
    vi.spyOn(openai, "generateWithTools")
      .mockResolvedValueOnce({
        model: "test-model",
        message: {
          role: "assistant",
          content: null,
          refusal: null,
          tool_calls: [
            {
              id: "call_1",
              type: "function",
              function: { name: "create_action", arguments: JSON.stringify({ title: "Revoir mon pricing" }) },
            },
          ],
        },
        toolCalls: [{ id: "call_1", name: "create_action", arguments: JSON.stringify({ title: "Revoir mon pricing" }) }],
        finishReason: "tool_calls",
      })
      .mockResolvedValueOnce({
        model: "test-model",
        message: { role: "assistant", content: "Action proposée pour validation.", refusal: null },
        toolCalls: [],
        finishReason: "stop",
      });

    vi.spyOn(execute, "executeAgentTool").mockResolvedValue({
      tool: "create_action",
      status: "confirmation_required",
      proposedAction: {
        title: "Revoir mon pricing",
        category: "pricing",
        impact: 7,
        effort: 5,
        confidence: 70,
        score: 42,
        why: "Test",
      },
    });

    const result = await runAgentOrchestrator({
      session,
      sharpzContext,
      messages: [{ role: "user", content: "Ajoute une action pour revoir mon pricing" }],
    });

    expect(result.proposedActions).toHaveLength(1);
    expect(result.proposedActions[0]?.title).toBe("Revoir mon pricing");
    expect(result.meta.toolsCalled).toContain("create_action");
  });
});
