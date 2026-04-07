import { NextRequest, NextResponse } from "next/server";
import { executePublicReservation } from "@/src/lib/reservation/execute-public-reservation";
import { publicReservationPostSchema } from "@/src/lib/reservation/schemas";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = publicReservationPostSchema.safeParse(json);

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] ??
      parsed.error.issues[0]?.message ??
      "Données invalides.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = await createClient();
  const result = await executePublicReservation(supabase, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, status: result.status });
}
