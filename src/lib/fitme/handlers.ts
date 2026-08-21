import { after, NextResponse } from "next/server";
import { ensureProfile, requireFitmeApiUser } from "@/src/lib/fitme/auth";
import { createStyleProfileCheckout, unlockStyleAnalysisFromStripe } from "@/src/lib/fitme/checkout";
import { PAYWALL_STATUSES } from "@/src/lib/fitme/constants";
import { jsonError, parseJson, readJson } from "@/src/lib/fitme/http";
import { getAnalysisForUser, getLatestAnalysis } from "@/src/lib/fitme/routing";
import { countGeneratedLooks, createSignedResultUrl, removeAnalysisSourcePhotos, signedSourcePhotos } from "@/src/lib/fitme/storage";
import { isOwnerEmail } from "@/src/lib/access";
import { getStripeClient } from "@/src/lib/stripe";
import { createAdminClient } from "@/src/lib/supabase/admin";
import {
  checkoutSchema,
  confirmImagesSchema,
  createAnalysisSchema,
  startAnalysisSchema,
  stylePreferencesSchema,
} from "@/src/lib/style-analysis/schemas";
import { analyzeStyleProfileJob, generateStyleLooks, runClaimedLookGeneration } from "@/src/lib/style-analysis/pipeline";
import {
  isFullyUnlockedProfile,
  parseStoredResult,
  toPreview,
  toPublicStatus,
} from "@/src/lib/style-analysis/serialize";

function originFrom(request: Request) {
  return new URL(request.url).origin;
}

async function statusExtras(analysisId: string) {
  const photos = await signedSourcePhotos(analysisId);
  const portrait = photos.find((photo) => photo.type === "portrait") ?? photos[0] ?? null;
  const looksGeneratedCount = await countGeneratedLooks(analysisId);
  return {
    photos,
    portraitUrl: portrait?.url ?? null,
    looksGeneratedCount,
  };
}

export async function handleCreateAnalysis(request: Request) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  await ensureProfile(user.id, user.email);
  const parsed = parseJson(createAnalysisSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const latest = await getLatestAnalysis(user.id);
  if (latest && ["queued", "analyzing", "paid", "generating_looks"].includes(latest.status)) {
    return NextResponse.json({ analysisId: latest.id, resumed: true, status: latest.status });
  }
  if (latest && ["draft", "uploaded"].includes(latest.status)) {
    const admin = createAdminClient();
    if (parsed.data.preferences) {
      await admin
        .from("style_analyses")
        .update({ preferences: parsed.data.preferences })
        .eq("id", latest.id)
        .eq("user_id", user.id);
    }
    return NextResponse.json({ analysisId: latest.id, resumed: true, status: latest.status });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("style_analyses")
    .insert({
      user_id: user.id,
      status: "draft",
      preferences: parsed.data.preferences ?? {},
    })
    .select("id")
    .single();

  if (error || !data) return jsonError("Impossible de créer l’analyse.", 500);
  return NextResponse.json({ analysisId: data.id, resumed: false, status: "draft" });
}

export async function handleStartAnalysis(request: Request, analysisId?: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;

  let id = analysisId;
  if (!id) {
    const parsed = parseJson(startAnalysisSchema, await readJson(request));
    if (!parsed.ok) return jsonError(parsed.error);
    id = parsed.data.analysisId;
  }

  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (["analyzing", "queued"].includes(analysis.status)) {
    after(() => {
      void analyzeStyleProfileJob(id);
    });
    return NextResponse.json({ ok: true, status: analysis.status, alreadyStarted: true });
  }
  if (["preview_ready", "awaiting_payment", "paid", "generating_looks", "completed"].includes(analysis.status)) {
    return NextResponse.json({ ok: true, status: analysis.status, alreadyStarted: true });
  }
  if (analysis.status === "failed" && analysis.payment_status === "paid") {
    return jsonError("L’analyse est déjà payée. Reprenez la génération des looks.", 409);
  }
  if (!["uploaded", "failed"].includes(analysis.status)) {
    return jsonError("Ajoutez d’abord vos photos pour lancer l’analyse.", 409);
  }

  const admin = createAdminClient();
  await admin.from("style_analyses").update({ status: "queued" }).eq("id", id).eq("user_id", user.id);
  await admin.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);

  after(() => {
    void analyzeStyleProfileJob(id);
  });

  return NextResponse.json({ ok: true, status: "queued" });
}

export async function handleGetStatus(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const analysis = await getAnalysisForUser(analysisId, auth.user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  const extras = await statusExtras(analysisId);
  return NextResponse.json({ analysis: toPublicStatus(analysis, extras) });
}

export async function handleGetPreview(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const analysis = await getAnalysisForUser(analysisId, auth.user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!(PAYWALL_STATUSES as readonly string[]).includes(analysis.status) && analysis.status !== "failed") {
    return jsonError("L’aperçu n’est pas disponible.", 409);
  }
  const extras = await statusExtras(analysisId);
  return NextResponse.json({ preview: toPreview(analysis, extras) });
}

export async function handleGetResult(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!isFullyUnlockedProfile(analysis)) {
    return jsonError("Le Style Profile n’est pas encore débloqué.", 403);
  }
  const result = parseStoredResult(analysis);
  if (!result) return jsonError("Résultat incomplet.", 409);

  const extras = await statusExtras(analysisId);
  const admin = createAdminClient();
  const { data: looks } = await admin
    .from("style_analysis_images")
    .select("id, generated_style, storage_path")
    .eq("analysis_id", analysis.id)
    .eq("is_generated", true)
    .order("created_at", { ascending: true });

  const signedLooks = [];
  for (const look of looks ?? []) {
    const signed = await createSignedResultUrl(look.storage_path);
    if (signed) {
      signedLooks.push({
        id: look.id as string,
        style: (look.generated_style as string) ?? result.primaryStyle.name,
        url: signed,
      });
    }
  }

  const profile = await ensureProfile(user.id, user.email);

  return NextResponse.json({
    profile: {
      ...toPublicStatus(analysis, extras),
      firstName: profile.first_name,
      primaryStyle: result.primaryStyle,
      secondaryStyle: result.secondaryStyle,
      bestColors: result.bestColors,
      lessFlatteringColors: result.lessFlatteringColors,
      notes: result.notes.slice(0, 4),
      looks: signedLooks,
    },
  });
}

export async function handleConfirmPhotos(request: Request, analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!["draft", "uploaded", "failed"].includes(analysis.status)) {
    return jsonError("Les photos ne peuvent plus être modifiées.", 409);
  }

  const parsed = parseJson(confirmImagesSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const expectedPrefix = `${user.id}/${analysisId}/`;
  for (const image of parsed.data.images) {
    if (!image.storagePath.startsWith(expectedPrefix)) {
      return jsonError("Chemin de fichier invalide.");
    }
  }

  const hasPortrait = parsed.data.images.some((image) => image.type === "portrait");
  const hasFullBody = parsed.data.images.some((image) => image.type === "full_body");
  if (!hasPortrait || !hasFullBody) {
    return jsonError("Ajoutez un portrait et une photo plein pied.");
  }

  const admin = createAdminClient();
  await admin.from("style_analysis_images").delete().eq("analysis_id", analysisId).eq("is_generated", false);

  const { error } = await admin.from("style_analysis_images").insert(
    parsed.data.images.map((image) => ({
      analysis_id: analysisId,
      user_id: user.id,
      type: image.type,
      storage_path: image.storagePath,
      is_generated: false,
    })),
  );
  if (error) return jsonError("Impossible d’enregistrer les photos.", 500);

  await admin.from("style_analyses").update({ status: "uploaded" }).eq("id", analysisId).eq("user_id", user.id);
  return NextResponse.json({ ok: true, status: "uploaded" });
}

export async function handleDeletePhotos(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!["draft", "uploaded", "failed"].includes(analysis.status) || analysis.payment_status === "paid") {
    return jsonError("Ces photos ne peuvent plus être supprimées.", 409);
  }

  await removeAnalysisSourcePhotos(user.id, analysisId);
  const admin = createAdminClient();
  await admin.from("style_analyses").update({ status: "draft" }).eq("id", analysisId).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}

export async function handleSavePreferences(request: Request, analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);
  if (!["draft", "uploaded"].includes(analysis.status)) {
    return jsonError("Les préférences ne peuvent plus être modifiées.", 409);
  }

  const parsed = parseJson(stylePreferencesSchema, await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error);

  const admin = createAdminClient();
  await admin.from("style_analyses").update({ preferences: parsed.data }).eq("id", analysisId).eq("user_id", user.id);

  if (parsed.data.firstName) {
    await admin.from("profiles").update({ first_name: parsed.data.firstName }).eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
}

export async function handleCheckout(request: Request, analysisId?: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;

  let id = analysisId;
  if (!id) {
    const parsed = parseJson(checkoutSchema, await readJson(request));
    if (!parsed.ok) return jsonError(parsed.error);
    id = parsed.data.analysisId;
  }

  const analysis = await getAnalysisForUser(id, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (analysis.is_unlocked && analysis.payment_status === "paid") {
    const path =
      analysis.status === "completed"
        ? `/style-profile/${analysis.id}`
        : `/payment/success?analysis_id=${analysis.id}`;
    return NextResponse.json({ url: path, alreadyPaid: true });
  }

  if (!(PAYWALL_STATUSES as readonly string[]).includes(analysis.status)) {
    return jsonError("L’analyse n’est pas encore prête.", 409);
  }

  try {
    const checkout = await createStyleProfileCheckout({
      userId: user.id,
      email: user.email,
      analysisId: analysis.id,
      origin: originFrom(request),
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossible de démarrer le paiement.";
    return jsonError(message, 500);
  }
}

export async function handleGenerateLooks(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const analysis = await getAnalysisForUser(analysisId, auth.user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  if (analysis.payment_status !== "paid" || !analysis.is_unlocked) {
    return jsonError("Paiement non confirmé.", 403);
  }
  if (analysis.status === "completed") {
    return NextResponse.json({ ok: true, status: "completed" });
  }

  if (analysis.status === "generating_looks" || analysis.status === "paid" || analysis.status === "failed") {
    after(() => {
      void generateStyleLooks(analysisId);
    });
    return NextResponse.json({ ok: true, status: analysis.status });
  }

  after(() => {
    void generateStyleLooks(analysisId);
  });

  return NextResponse.json({ ok: true, status: "generating_looks" });
}

export async function handleConfirmPayment(analysisId: string) {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const analysis = await getAnalysisForUser(analysisId, user.id);
  if (!analysis) return jsonError("Analyse introuvable.", 404);

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("stripe_checkout_session_id, status, stripe_payment_intent_id")
    .eq("analysis_id", analysisId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.stripe_checkout_session_id) {
    return jsonError("Aucun paiement à confirmer.", 404);
  }

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(payment.stripe_checkout_session_id);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: true, status: analysis.status, paid: false });
  }

  const result = await unlockStyleAnalysisFromStripe({
    checkoutSessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : payment.stripe_payment_intent_id,
    userId: user.id,
    analysisId,
    amount: session.amount_total,
    currency: session.currency,
  });

  if (result.shouldGenerateLooks) {
    after(() => {
      void runClaimedLookGeneration(analysisId);
    });
  }

  return NextResponse.json({
    ok: true,
    paid: true,
    generating: result.shouldGenerateLooks || analysis.status === "generating_looks" || analysis.status === "paid",
  });
}

export async function handleAdminList() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  if (!isOwnerEmail(auth.user.email)) return jsonError("Non autorisé.", 403);

  const admin = createAdminClient();
  const [{ data: analyses }, { data: payments }] = await Promise.all([
    admin
      .from("style_analyses")
      .select(
        "id, user_id, status, payment_status, is_unlocked, error_message, created_at, completed_at, primary_style, ai_provider",
      )
      .order("created_at", { ascending: false })
      .limit(80),
    admin
      .from("payments")
      .select("id, user_id, analysis_id, amount, currency, status, created_at, stripe_checkout_session_id")
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  return NextResponse.json({
    provider: process.env.STYLE_AI_PROVIDER ?? "mock",
    analyses: analyses ?? [],
    payments: payments ?? [],
  });
}

export async function handleDeleteAccount() {
  const auth = await requireFitmeApiUser();
  if (auth.unauthorized) return auth.unauthorized;
  const user = auth.user;
  const admin = createAdminClient();

  const { removeUserStylePhotos } = await import("@/src/lib/fitme/storage");
  await removeUserStylePhotos(user.id);
  await admin.from("style_analyses").delete().eq("user_id", user.id);
  await admin.from("payments").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return jsonError("Impossible de supprimer le compte pour le moment.", 500);
  return NextResponse.json({ ok: true });
}
