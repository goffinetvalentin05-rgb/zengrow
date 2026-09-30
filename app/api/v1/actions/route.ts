import { NextResponse } from "next/server";
import { authorizeLearnApi } from "@/src/lib/learn/api-auth";
import { executeLearnAction } from "@/src/lib/learn/tools/execute";

export async function POST(request: Request) {
  const auth = await authorizeLearnApi(request);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const action = typeof body === "object" && body && "action" in body ? String((body as { action: unknown }).action) : "";
  const input = typeof body === "object" && body && "input" in body ? (body as { input: unknown }).input : {};
  const result = await executeLearnAction(auth.db, action, input);
  console.info("[learn-api]", { action, userId: auth.db.userId, ok: result.ok });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
