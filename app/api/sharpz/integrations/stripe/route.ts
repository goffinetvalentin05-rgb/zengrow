import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { connectStripeAccount, disconnectStripeAccount } from "@/src/lib/sharpz/stripe-revenue";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const body = await parseJson<{ secretKey?: string }>(request);
  const secretKey = body?.secretKey?.trim() ?? "";
  if (!secretKey) {
    return NextResponse.json({ error: "Clé Stripe requise." }, { status: 400 });
  }

  try {
    const summary = await connectStripeAccount(session.supabase, session.restaurant.id, secretKey);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de connecter Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  try {
    await disconnectStripeAccount(session.supabase, session.restaurant.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de déconnecter Stripe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
