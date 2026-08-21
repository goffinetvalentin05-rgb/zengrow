import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseJson<T>(schema: z.ZodType<T>, payload: unknown) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false as const, error: "Requête invalide." };
  }
  return { ok: true as const, data: parsed.data };
}

export async function readJson(request: Request) {
  return request.json().catch(() => ({}));
}
