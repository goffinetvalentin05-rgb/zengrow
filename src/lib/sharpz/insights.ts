import type { SupabaseClient } from "@supabase/supabase-js";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { INTEGRATION_PROVIDERS, OBJECTIVE_PRIORITY_CATEGORIES } from "@/src/lib/sharpz/constants";
import {
  clampConfidence,
  clampEffort,
  clampImpact,
  computeSharpzScore,
  opportunityLevelFromPotential,
} from "@/src/lib/sharpz/scoring";
import type {
  ActionCategory,
  ObjectiveKey,
  OpportunityCategory,
  ScanResult,
  UserSaas,
} from "@/src/lib/sharpz/types";
import { z } from "zod";

type InsightAction = {
  title: string;
  category: ActionCategory;
  impact: number;
  effort: number;
  confidence: number;
  why: string;
  howTo: string;
  microSteps: string[];
  objectiveKey: string | null;
};

type InsightOpportunity = {
  name: string;
  category: OpportunityCategory;
  explanation: string;
  whyDetected: string;
  potential: number;
  effort: number;
  confidence: number;
  dataUsed: string;
};

type InsightContent = {
  topic: string;
  audience: string;
  potential: number;
  relevance: number;
  whyNow: string;
  recommendedAngle: string;
  ideas: {
    platform: string;
    hook: string;
    angle: string;
    objective: string;
    format: string;
    cta: string;
  }[];
};

type InsightAudit = {
  summary: string;
  globalScore: number;
  subscores: Record<string, number>;
  findings: { kind: "problem" | "opportunity"; area: string; title: string; detail: string; severity: number }[];
};

export type WorkspaceInsightBundle = {
  audit: InsightAudit;
  actions: InsightAction[];
  opportunities: InsightOpportunity[];
  content: InsightContent[];
};

type InsightContext = {
  saasName: string;
  url: string | null;
  description: string | null;
  stage: string | null;
  primaryObjective: ObjectiveKey | string | null;
  extraObjectives: string[];
  channels: string[];
  scan: ScanResult | null;
  locale: "fr" | "en";
};

function productLabel(ctx: InsightContext) {
  return ctx.saasName.trim() || "votre SaaS";
}

function heuristicBundle(ctx: InsightContext): WorkspaceInsightBundle {
  const name = productLabel(ctx);
  const primary = (ctx.primaryObjective as ObjectiveKey) || "other";
  const fr = ctx.locale !== "en";
  const priority = OBJECTIVE_PRIORITY_CATEGORIES[primary] ?? OBJECTIVE_PRIORITY_CATEGORIES.other;

  const actions: InsightAction[] = [];
  const push = (action: InsightAction) => {
    if (!actions.some((item) => item.title === action.title)) actions.push(action);
  };

  if (priority.includes("landing") || priority.includes("conversion")) {
    push({
      title: fr ? `Clarifier le hero de ${name}` : `Clarify the ${name} hero`,
      category: "landing",
      impact: 9,
      effort: 3,
      confidence: ctx.scan?.detected.description ? 78 : 62,
      why: fr
        ? "Une landing claire convertit mieux. Le scan n’a pas confirmé une promesse unique assez nette."
        : "A clear landing converts better. The scan did not confirm a sharp unique promise.",
      howTo: fr
        ? "Réécrivez headline, sous-titre et CTA autour d’un seul résultat client."
        : "Rewrite headline, subcopy and CTA around one customer outcome.",
      microSteps: fr
        ? ["Lister le problème principal", "Écrire 3 headlines", "Tester le CTA principal"]
        : ["List the main problem", "Write 3 headlines", "Test the primary CTA"],
      objectiveKey: primary,
    });
  }

  if (priority.includes("prospection") || priority.includes("acquisition")) {
    push({
      title: fr ? "Figer un ICP actionnable" : "Lock an actionable ICP",
      category: "prospection",
      impact: 9,
      effort: 4,
      confidence: 84,
      why: fr
        ? "Sans ICP précis, Sharpz ne peut pas prioriser les bons prospects ni les bons canaux."
        : "Without a precise ICP, Sharpz cannot prioritize the right prospects or channels.",
      howTo: fr
        ? "Décrivez type d’entreprise, taille, persona et problème payant."
        : "Describe company type, size, persona and the paid problem.",
      microSteps: fr
        ? ["3 entreprises idéales", "1 persona", "1 problème chiffré"]
        : ["3 ideal companies", "1 persona", "1 quantified problem"],
      objectiveKey: primary,
    });
    push({
      title: fr ? "Construire une liste de 20 prospects" : "Build a list of 20 prospects",
      category: "prospection",
      impact: 8,
      effort: 5,
      confidence: 80,
      why: fr
        ? "Votre objectif actuel demande du volume qualifié, pas du contenu générique."
        : "Your current goal needs qualified volume, not generic content.",
      howTo: fr
        ? "Utilisez l’assistant Sharpz pour proposer des comptes, puis ajoutez-les au mini CRM."
        : "Use the Sharpz assistant to suggest accounts, then add them to the mini CRM.",
      microSteps: fr
        ? ["Demander 5 prospects à l’assistant", "Qualifier le fit", "Préparer un message"]
        : ["Ask the assistant for 5 prospects", "Qualify the fit", "Prepare a message"],
      objectiveKey: primary,
    });
  }

  if (priority.includes("pricing") || priority.includes("monetisation")) {
    push({
      title: fr ? "Rendre le pricing évident en 5 secondes" : "Make pricing obvious in 5 seconds",
      category: "pricing",
      impact: 8,
      effort: 4,
      confidence: ctx.scan?.detected.pricingSummary ? 70 : 58,
      why: fr
        ? "Le pricing n’est pas clairement détecté. L’ambiguïté tarifaire tue la conversion."
        : "Pricing was not clearly detected. Pricing ambiguity kills conversion.",
      howTo: fr
        ? "Une page pricing simple : offre, prix, qui c’est pour, CTA."
        : "A simple pricing page: offer, price, who it’s for, CTA.",
      microSteps: fr
        ? ["Lister les plans", "Supprimer les options floues", "Ajouter un CTA unique"]
        : ["List plans", "Remove fuzzy options", "Add a single CTA"],
      objectiveKey: primary,
    });
  }

  if (ctx.channels.includes("seo") || priority.includes("seo") || priority.includes("content")) {
    push({
      title: fr ? "Choisir 3 sujets où vous êtes légitime" : "Pick 3 topics you are legitimately good at",
      category: "content",
      impact: 7,
      effort: 4,
      confidence: 74,
      why: fr
        ? "Sharpz n’est pas un générateur de posts. Le levier est de parler des bons sujets, maintenant."
        : "Sharpz is not a post generator. The lever is talking about the right topics, now.",
      howTo: fr
        ? "Partez des problèmes ICP, pas des formats. Puis déclinez sur vos canaux."
        : "Start from ICP problems, not formats. Then adapt to your channels.",
      microSteps: fr
        ? ["3 questions clients", "1 angle différenciant", "1 format par canal"]
        : ["3 customer questions", "1 differentiating angle", "1 format per channel"],
      objectiveKey: primary,
    });
  }

  if (ctx.stage === "idea" || ctx.stage === "mvp") {
    push({
      title: fr ? "Preuve minimale : 5 conversations cibles" : "Minimum proof: 5 target conversations",
      category: "acquisition",
      impact: 9,
      effort: 3,
      confidence: 86,
      why: fr
        ? "Au stade actuel, le risque n’est pas le volume d’ads, c’est l’absence de preuve de demande."
        : "At this stage the risk is not ad volume, it is the lack of demand proof.",
      howTo: fr
        ? "Parlez à 5 personnes ICP cette semaine. Notez objections et willingness to pay."
        : "Talk to 5 ICP people this week. Capture objections and willingness to pay.",
      microSteps: fr
        ? ["Liste de 10 personnes", "Message court", "Compte-rendu des objections"]
        : ["List of 10 people", "Short message", "Objection notes"],
      objectiveKey: primary,
    });
  }

  if (priority.includes("positioning")) {
    push({
      title: fr ? `Serrer le positionnement de ${name}` : `Tighten ${name} positioning`,
      category: "positioning",
      impact: 8,
      effort: 4,
      confidence: 72,
      why: fr
        ? "Sans différenciation claire, les actions d’acquisition se diluent."
        : "Without clear differentiation, acquisition actions get diluted.",
      howTo: fr
        ? "Une phrase : pour qui, contre quel problème, contrairement à quoi."
        : "One sentence: for whom, against which problem, unlike what.",
      microSteps: fr
        ? ["Cible unique", "Promesse unique", "Anti-cible"]
        : ["Single target", "Single promise", "Anti-target"],
      objectiveKey: primary,
    });
  }

  while (actions.length < 3) {
    push({
      title: fr ? "Lancer une analyse complète du site" : "Run a full website analysis",
      category: "landing",
      impact: 7,
      effort: 2,
      confidence: 90,
      why: fr
        ? "Sans audit, Sharpz ne peut pas relier problèmes, opportunités et actions."
        : "Without an audit, Sharpz cannot connect problems, opportunities and actions.",
      howTo: fr ? "Utilisez la page Analyse." : "Use the Analysis page.",
      microSteps: fr ? ["Ouvrir Analyse", "Lancer l’audit", "Traiter le top 3"] : ["Open Analysis", "Run audit", "Process top 3"],
      objectiveKey: primary,
    });
  }

  const opportunities: InsightOpportunity[] = [
    {
      name: fr ? "Canal d’acquisition sous-exploité" : "Underused acquisition channel",
      category: "acquisition",
      explanation: fr
        ? "Vos canaux actuels et votre objectif ne sont pas encore alignés sur un système répétable."
        : "Your current channels and goal are not yet aligned into a repeatable system.",
      whyDetected: fr
        ? `Objectif principal : ${primary}. Canaux déclarés : ${ctx.channels.join(", ") || "aucun"}.`
        : `Primary goal: ${primary}. Declared channels: ${ctx.channels.join(", ") || "none"}.`,
      potential: 8,
      effort: 5,
      confidence: 70,
      dataUsed: fr ? "Objectifs + canaux onboarding" : "Onboarding goals + channels",
    },
    {
      name: fr ? "Friction de conversion probable" : "Likely conversion friction",
      category: "conversion",
      explanation: fr
        ? "Headline, preuve sociale et CTA ne sont pas tous clairement détectés."
        : "Headline, social proof and CTA were not all clearly detected.",
      whyDetected: fr
        ? "Extrait du site incomplet sur la preuve et le CTA."
        : "Website extract incomplete on proof and CTA.",
      potential: 8,
      effort: 4,
      confidence: ctx.scan ? 68 : 55,
      dataUsed: fr ? "Scan website (si disponible)" : "Website scan (if available)",
    },
  ];

  if (primary === "increase_mrr" || primary === "improve_conversion") {
    opportunities.push({
      name: fr ? "Packaging / offre à simplifier" : "Offer packaging to simplify",
      category: "monetisation",
      explanation: fr
        ? "Un pricing plus lisible accélère souvent la décision d’achat."
        : "More readable pricing often speeds up purchase decisions.",
      whyDetected: ctx.scan?.detected.pricingSummary
        ? fr
          ? "Un signal pricing existe mais reste peu structuré."
          : "A pricing signal exists but remains loosely structured."
        : fr
          ? "Aucun pricing clair n’a été détecté."
          : "No clear pricing was detected.",
      potential: 7,
      effort: 5,
      confidence: 64,
      dataUsed: fr ? "Scan + objectif" : "Scan + goal",
    });
  }

  const channels = ctx.channels.length ? ctx.channels : ["linkedin"];
  const content: InsightContent[] = [
    {
      topic: fr ? `Le problème que ${name} résout vraiment` : `The problem ${name} actually solves`,
      audience: ctx.scan?.detected.icp.persona || (fr ? "Fondateurs SaaS de la cible" : "Target SaaS founders"),
      potential: 82,
      relevance: 88,
      whyNow: fr
        ? "C’est le sujet le plus utile tant que le positionnement n’est pas encore évident."
        : "This is the most useful topic while positioning is still unclear.",
      recommendedAngle: fr
        ? "Montrer un avant/après concret, pas une liste de features."
        : "Show a concrete before/after, not a feature list.",
      ideas: channels.slice(0, 3).map((platform) => ({
        platform,
        hook: fr
          ? `La plupart des ${name}s manquent cette étape avant d’acquérir`
          : `Most ${name}s skip this step before acquiring`,
        angle: fr ? "Erreur fréquente + correction" : "Common mistake + fix",
        objective: fr ? "Autorité + prospects" : "Authority + prospects",
        format: platform === "tiktok" || platform === "youtube" ? (fr ? "Vidéo courte" : "Short video") : fr ? "Post" : "Post",
        cta: fr ? "Commentaire / DM" : "Comment / DM",
      })),
    },
  ];

  const audit: InsightAudit = {
    summary: fr
      ? `${name} est compris au stade « ${ctx.stage ?? "inconnu"} ». Sharpz a priorisé les actions liées à votre objectif, sans inventer de métriques.`
      : `${name} is understood at stage “${ctx.stage ?? "unknown"}”. Sharpz prioritized actions tied to your goal and did not invent metrics.`,
    globalScore: ctx.scan ? 62 : 48,
    subscores: {
      landing: ctx.scan?.detected.description ? 64 : 42,
      ux: 50,
      seo: ctx.channels.includes("seo") ? 55 : 40,
      positioning: ctx.scan?.detected.description ? 58 : 44,
      conversion: ctx.scan?.detected.pricingSummary ? 60 : 41,
      retention: 0,
    },
    findings: [
      {
        kind: "problem",
        area: "landing",
        title: fr ? "Promesse encore trop générique" : "Promise still too generic",
        detail: fr
          ? "La valeur unique n’est pas assez nette pour un visiteur de 5 secondes."
          : "Unique value is not sharp enough for a 5-second visitor.",
        severity: 7,
      },
      {
        kind: "opportunity",
        area: "acquisition",
        title: fr ? "Système d’acquisition à construire" : "Acquisition system to build",
        detail: fr
          ? "Les canaux existent, le rythme et le ciblage ICP ne sont pas encore un système."
          : "Channels exist, but ICP targeting and cadence are not a system yet.",
        severity: 8,
      },
    ],
  };

  return { audit, actions: actions.slice(0, 8), opportunities, content };
}

const aiBundleSchema = z.object({
  audit: z.object({
    summary: z.string(),
    globalScore: z.number(),
    subscores: z.record(z.string(), z.number()),
    findings: z.array(
      z.object({
        kind: z.enum(["problem", "opportunity"]),
        area: z.string(),
        title: z.string(),
        detail: z.string(),
        severity: z.number(),
      }),
    ),
  }),
  actions: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      impact: z.number(),
      effort: z.number(),
      confidence: z.number(),
      why: z.string(),
      howTo: z.string(),
      microSteps: z.array(z.string()),
      objectiveKey: z.string().nullable(),
    }),
  ),
  opportunities: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      explanation: z.string(),
      whyDetected: z.string(),
      potential: z.number(),
      effort: z.number(),
      confidence: z.number(),
      dataUsed: z.string(),
    }),
  ),
  content: z.array(
    z.object({
      topic: z.string(),
      audience: z.string(),
      potential: z.number(),
      relevance: z.number(),
      whyNow: z.string(),
      recommendedAngle: z.string(),
      ideas: z.array(
        z.object({
          platform: z.string(),
          hook: z.string(),
          angle: z.string(),
          objective: z.string(),
          format: z.string(),
          cta: z.string(),
        }),
      ),
    }),
  ),
});

function clampScore100(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function clampSeverity(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.min(10, Math.max(1, Math.round(value)));
}

function toTenScale(value: number) {
  if (!Number.isFinite(value)) return 5;
  if (value > 10) return Math.min(10, Math.max(1, Math.round(value / 10)));
  return Math.min(10, Math.max(1, Math.round(value)));
}

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export async function buildWorkspaceInsights(ctx: InsightContext): Promise<WorkspaceInsightBundle> {
  const fallback = heuristicBundle(ctx);
  try {
    const { data } = await generateStructuredAI({
      system: `Tu es Sharpz, Growth Operating System pour fondateurs SaaS.
Génère un bundle JSON d'audit + actions + opportunités + contenus.
Règles:
- N'invente aucune métrique (MRR, churn, trafic) non fournie.
- N'invente aucun concurrent.
- Priorise selon l'objectif principal.
- Actions concrètes, micro-étapes exécutables.
- Content = de quoi parler, pas une ferme à posts.`,
      user: JSON.stringify(ctx),
      maxTokens: 2500,
      timeoutMs: 12000,
      parse: (raw) => aiBundleSchema.parse(raw),
    });
    return {
      audit: {
        summary: data.audit.summary,
        globalScore: Math.round(data.audit.globalScore),
        subscores: data.audit.subscores,
        findings: data.audit.findings,
      },
      actions: data.actions.map((action) => ({
        ...action,
        category: action.category as ActionCategory,
      })),
      opportunities: data.opportunities.map((item) => ({
        ...item,
        category: item.category as OpportunityCategory,
      })),
      content: data.content,
    };
  } catch {
    return fallback;
  }
}

export async function persistInsights(
  supabase: SupabaseClient,
  restaurantId: string,
  bundle: WorkspaceInsightBundle,
  sourceUrl: string | null,
  previousScore: number | null,
) {
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .insert({
      restaurant_id: restaurantId,
      status: "completed",
      summary: bundle.audit.summary,
      global_score: clampScore100(bundle.audit.globalScore),
      previous_score: previousScore == null ? null : clampScore100(previousScore),
      subscores: Object.fromEntries(
        Object.entries(bundle.audit.subscores).map(([key, value]) => [key, clampScore100(value)]),
      ),
      source_url: sourceUrl,
    })
    .select("id")
    .single();

  throwIfError(auditError, "Impossible de créer l’audit.");
  if (!audit) throw new Error("Impossible de créer l’audit.");

  if (bundle.audit.findings.length) {
    const { error: findingsError } = await supabase.from("audit_findings").insert(
      bundle.audit.findings.map((finding) => ({
        restaurant_id: restaurantId,
        audit_id: audit.id,
        kind: finding.kind,
        area: finding.area,
        title: finding.title,
        detail: finding.detail,
        severity: clampSeverity(finding.severity),
      })),
    );
    throwIfError(findingsError, "Impossible d’enregistrer les findings.");
  }

  const opportunityIds: string[] = [];
  for (const item of bundle.opportunities) {
    const potential = toTenScale(item.potential);
    const { data, error } = await supabase
      .from("opportunities")
      .insert({
        restaurant_id: restaurantId,
        name: item.name,
        category: item.category,
        explanation: item.explanation,
        why_detected: item.whyDetected,
        potential,
        effort: toTenScale(item.effort),
        confidence: clampConfidence(item.confidence),
        data_used: item.dataUsed,
        opportunity_level: opportunityLevelFromPotential(potential),
        source_type: "audit",
        source_id: audit.id,
      })
      .select("id")
      .single();
    throwIfError(error, "Impossible d’enregistrer une opportunité.");
    if (data?.id) opportunityIds.push(data.id);
  }

  for (const [index, action] of bundle.actions.entries()) {
    const impact = clampImpact(action.impact);
    const effort = clampEffort(action.effort);
    const confidence = clampConfidence(action.confidence);
    const { error } = await supabase.from("actions").insert({
      restaurant_id: restaurantId,
      title: action.title,
      category: action.category,
      status: "todo",
      impact,
      effort,
      confidence,
      score: computeSharpzScore(impact, effort, confidence),
      why: action.why,
      how_to: action.howTo,
      micro_steps: action.microSteps,
      objective_key: action.objectiveKey,
      source_type: "audit",
      source_id: audit.id,
      opportunity_id: opportunityIds[index] ?? null,
    });
    throwIfError(error, "Impossible d’enregistrer une action.");
  }

  for (const item of bundle.content) {
    const { data: opportunity, error: contentError } = await supabase
      .from("content_opportunities")
      .insert({
        restaurant_id: restaurantId,
        topic: item.topic,
        audience: item.audience,
        potential: clampScore100(item.potential),
        relevance: clampScore100(item.relevance),
        why_now: item.whyNow,
        recommended_angle: item.recommendedAngle,
      })
      .select("id")
      .single();
    throwIfError(contentError, "Impossible d’enregistrer une opportunité contenu.");

    if (opportunity && item.ideas.length) {
      const { error: ideasError } = await supabase.from("content_ideas").insert(
        item.ideas.map((idea) => ({
          restaurant_id: restaurantId,
          opportunity_id: opportunity.id,
          platform: idea.platform,
          hook: idea.hook,
          angle: idea.angle,
          objective: idea.objective,
          format: idea.format,
          cta: idea.cta,
        })),
      );
      throwIfError(ideasError, "Impossible d’enregistrer les idées contenu.");
    }
  }

  const { error: saasError } = await supabase
    .from("user_saas")
    .update({ last_audit_at: new Date().toISOString() })
    .eq("restaurant_id", restaurantId);
  throwIfError(saasError, "Impossible de mettre à jour le SaaS.");

  return audit.id as string;
}

export async function ensureIntegrations(supabase: SupabaseClient, restaurantId: string) {
  const { data: existing, error: existingError } = await supabase
    .from("integrations")
    .select("provider")
    .eq("restaurant_id", restaurantId);
  throwIfError(existingError, "Impossible de lire les intégrations.");
  const present = new Set((existing ?? []).map((row) => row.provider));
  const missing = INTEGRATION_PROVIDERS.filter((item) => !present.has(item.provider));
  if (!missing.length) return;
  const { error } = await supabase.from("integrations").insert(
    missing.map((item) => ({
      restaurant_id: restaurantId,
      provider: item.provider,
      status: item.defaultStatus,
    })),
  );
  throwIfError(error, "Impossible de créer les intégrations.");
}

export async function upsertSaasFromOnboarding(
  supabase: SupabaseClient,
  restaurantId: string,
  input: {
    scan: ScanResult | null;
    name: string;
    url: string | null;
    pricingSummary: string | null;
    stage: string;
    icp?: UserSaas["icp"];
    onboardingCompleted?: boolean;
  },
) {
  const detected = input.scan?.detected;
  const payload = {
    restaurant_id: restaurantId,
    name: input.name || detected?.name || null,
    url: input.url,
    description: detected?.description ?? null,
    category: detected?.category ?? null,
    country: detected?.country ?? null,
    market: detected?.market ?? null,
    language: detected?.language ?? null,
    business_model: detected?.businessModel ?? null,
    pricing_detected: Boolean(detected?.pricingSummary || input.pricingSummary),
    pricing_summary: input.pricingSummary || detected?.pricingSummary || null,
    billing_type: detected?.billingType ?? null,
    mrr: null,
    mrr_unknown: true,
    has_freemium: detected?.hasFreemium ?? null,
    has_trial: detected?.hasTrial ?? null,
    icp: detected?.icp ?? input.icp ?? {},
    stage: input.stage,
    scan_extract: input.scan?.extract ?? null,
    unknown_fields: input.scan?.unknownFields ?? [],
    onboarding_completed: Boolean(input.onboardingCompleted),
    onboarding_step: input.onboardingCompleted ? "done" : "in_progress",
  };

  const { data: existing, error: existingError } = await supabase
    .from("user_saas")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  throwIfError(existingError, "Impossible de lire le profil SaaS.");

  if (existing?.id) {
    const { error } = await supabase.from("user_saas").update(payload).eq("id", existing.id);
    throwIfError(error, "Impossible de mettre à jour le profil SaaS.");
  } else {
    const { error } = await supabase.from("user_saas").insert(payload);
    throwIfError(error, "Impossible de créer le profil SaaS.");
  }

  if (payload.name) {
    await supabase.from("restaurants").update({ name: payload.name }).eq("id", restaurantId);
  }
}
