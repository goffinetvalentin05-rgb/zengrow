import { NextResponse } from "next/server";
import { z } from "zod";
import { runAIGeneration } from "@/src/lib/ai/route-auth";
import { runAgentOrchestrator } from "@/src/lib/sharpz/agent-tools/orchestrator";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { loadSharpzContext } from "@/src/lib/sharpz/context";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;
  const body = await parseJson<{ messages?: unknown }>(request);
  const parsed = z.array(messageSchema).safeParse(body?.messages);
  if (!parsed.success || parsed.data.length === 0) {
    return NextResponse.json({ error: "Message requis." }, { status: 400 });
  }

  const context = await loadSharpzContext(supabase, restaurant.id);

  try {
    const result = (await runAIGeneration({
      supabase,
      user,
      restaurant,
      feature: "sharpz_assistant",
      input: parsed.data[parsed.data.length - 1]?.content ?? "",
      generate: () =>
        runAgentOrchestrator({
          session: { supabase, user, restaurant },
          sharpzContext: context,
          messages: parsed.data,
        }),
    })) as Awaited<ReturnType<typeof runAgentOrchestrator>>;

    return NextResponse.json({
      reply: result.reply,
      prospects: result.prospects,
      competitors: result.competitors,
      proposedActions: result.proposedActions,
      proposedFollowUps: result.proposedFollowUps,
      proposedExperiments: result.proposedExperiments,
      proposedProspects: result.proposedProspects,
      proposedCompetitors: result.proposedCompetitors,
      meta: result.meta,
      searchError: result.searchError,
      capability: result.meta.capability,
    });
  } catch (error) {
    const { aiErrorResponse } = await import("@/src/lib/ai/route-auth");
    return aiErrorResponse(error);
  }
}
