import { NextResponse } from "next/server";
import { requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { jsonError } from "@/src/lib/fitme/http";
import { removeUserStylePhotos } from "@/src/lib/fitme/storage";

export async function POST() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  try {
    await removeUserStylePhotos(auth.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Impossible de supprimer les photos.", 500);
  }
}

export async function DELETE() {
  return POST();
}
