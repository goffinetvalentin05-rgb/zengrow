import { NextResponse } from "next/server";
import { handleCreateAnalysis } from "@/src/lib/fitme/handlers";
import { requireFitmeApiUser, ensureProfile } from "@/src/lib/fitme/auth";
import { getLatestAnalysis } from "@/src/lib/fitme/routing";

export async function GET() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  await ensureProfile(user.id, user.email);
  const analysis = await getLatestAnalysis(user.id);
  if (!analysis) return NextResponse.json({ analysis: null });
  return NextResponse.json({
    analysis: {
      id: analysis.id,
      status: analysis.status,
      paymentStatus: analysis.payment_status,
      isUnlocked: analysis.is_unlocked && analysis.payment_status === "paid",
      createdAt: analysis.created_at,
    },
  });
}

export async function POST(request: Request) {
  return handleCreateAnalysis(request);
}
