import { NextResponse } from "next/server";
import { aiErrorResponse } from "@/src/lib/ai/route-auth";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { isProspectSearchConfigured } from "@/src/lib/sharpz/prospect-search/providers";
import { searchProspects } from "@/src/lib/sharpz/prospect-search/search-prospects";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";
import { loadSharpzContext } from "@/src/lib/sharpz/context";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, user, restaurant } = session;

  if (!isProspectSearchConfigured()) {
    return NextResponse.json(
      {
        error: "La recherche de prospects n’est pas configurée.",
        code: "not_configured",
        retryable: false,
      },
      { status: 503 },
    );
  }

  const body = await parseJson<{ message?: string }>(request);
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message requis." }, { status: 400 });
  }

  try {
    const context = await loadSharpzContext(supabase, restaurant.id);
    const result = await searchProspects({
      supabase,
      user,
      restaurant,
      userMessage: message,
      context,
    });

    return NextResponse.json({
      reply: result.reply,
      prospects: result.prospects,
      meta: {
        requested: result.requested,
        found: result.found,
        duplicatesRemoved: result.duplicatesRemoved,
        provider: result.provider,
        queries: result.queries,
      },
    });
  } catch (error) {
    if (error instanceof ProspectSearchError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
        },
        { status: error.code === "not_configured" ? 503 : 502 },
      );
    }
    console.error("[prospect-search]", error);
    return aiErrorResponse(error);
  }
}
