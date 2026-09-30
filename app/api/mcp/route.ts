import { NextResponse } from "next/server";
import { authorizeLearnApi } from "@/src/lib/learn/api-auth";
import { executeLearnAction, toolDefinitions } from "@/src/lib/learn/tools/execute";

/**
 * Minimal stateless MCP-style JSON-RPC endpoint.
 * ChatGPT (or any client) sends Authorization: Bearer lg_...
 * Methods: initialize, tools/list, tools/call.
 * tools/call uses the same handlers as POST /api/v1/actions.
 */
export async function POST(request: Request) {
  const auth = await authorizeLearnApi(request);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  let body: { jsonrpc?: string; id?: unknown; method?: string; params?: { name?: string; arguments?: unknown } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  const id = body.id ?? null;
  if (body.method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "learn-english", version: "1.0.0" },
      },
    });
  }

  if (body.method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: toolDefinitions().map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: { type: "object", additionalProperties: true },
        })),
      },
    });
  }

  if (body.method === "tools/call") {
    const name = body.params?.name ?? "";
    const result = await executeLearnAction(auth.db, name, body.params?.arguments ?? {});
    console.info("[learn-mcp]", { action: name, userId: auth.db.userId, ok: result.ok });
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [{ type: "text", text: JSON.stringify(result) }],
        isError: !result.ok,
      },
    });
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: "Method not found" },
  });
}
