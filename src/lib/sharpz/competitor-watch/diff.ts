import { createHash } from "crypto";

export type CompetitorPlan = {
  name: string;
  price: string;
  period: string | null;
};

export type CompetitorSnapshotData = {
  title: string | null;
  description: string | null;
  hero: string | null;
  cta: string | null;
  pricingText: string | null;
  plans: CompetitorPlan[];
  homepageUrl: string | null;
  pricingUrl: string | null;
};

export type CompetitorChangeType =
  | "pricing_changed"
  | "plan_added"
  | "plan_removed"
  | "hero_changed"
  | "cta_changed"
  | "positioning_changed"
  | "page_unavailable";

export type DetectedCompetitorChange = {
  changeType: CompetitorChangeType;
  title: string;
  description: string;
  beforeValue: string | null;
  afterValue: string | null;
  sourceUrl: string | null;
  confidence: "high" | "medium" | "low";
  importance: "low" | "medium" | "high";
  whyItMatters: string | null;
};

export function normalizeComparable(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s./€$£+-]/gu, "")
    .trim();
}

export function significantTextChange(before: string | null, after: string | null, minLen = 12): boolean {
  const a = normalizeComparable(before);
  const b = normalizeComparable(after);
  if (!a && !b) return false;
  if (!a || !b) return Boolean(a || b) && (a.length >= minLen || b.length >= minLen);
  if (a === b) return false;
  // Ignore tiny diffs (typos / whitespace already stripped)
  if (Math.abs(a.length - b.length) < 8 && (a.includes(b) || b.includes(a))) return false;
  return true;
}

export function hashSnapshot(data: CompetitorSnapshotData): string {
  const payload = {
    title: normalizeComparable(data.title),
    description: normalizeComparable(data.description),
    hero: normalizeComparable(data.hero),
    cta: normalizeComparable(data.cta),
    pricingText: normalizeComparable(data.pricingText),
    plans: data.plans
      .map((p) => ({
        name: normalizeComparable(p.name),
        price: normalizeComparable(p.price),
        period: normalizeComparable(p.period),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 40);
}

export function buildChangeDedupKey(input: {
  competitorId: string;
  changeType: string;
  beforeValue: string | null;
  afterValue: string | null;
}): string {
  const compact = (v: string | null) => normalizeComparable(v).replace(/\s+/g, "");
  const raw = [input.competitorId, input.changeType, compact(input.beforeValue), compact(input.afterValue)].join("|");
  return createHash("sha256").update(raw).digest("hex").slice(0, 48);
}

/**
 * Diff déterministe entre deux snapshots utiles.
 * Pas d'événement sur premier snapshot (previous === null).
 */
export function diffCompetitorSnapshots(
  previous: CompetitorSnapshotData | null,
  next: CompetitorSnapshotData,
  opts?: { fetchStatus?: "ok" | "unavailable" | "error"; previousFetchStatus?: string | null },
): DetectedCompetitorChange[] {
  const changes: DetectedCompetitorChange[] = [];
  const sourceUrl = next.pricingUrl || next.homepageUrl;

  if (opts?.fetchStatus === "unavailable" || opts?.fetchStatus === "error") {
    if (opts.previousFetchStatus === "ok" || previous) {
      changes.push({
        changeType: "page_unavailable",
        title: "Page concurrent inaccessible",
        description: "Impossible de vérifier ce concurrent (site inaccessible ou erreur HTTP).",
        beforeValue: previous?.homepageUrl ?? null,
        afterValue: null,
        sourceUrl: next.homepageUrl,
        confidence: "high",
        importance: "medium",
        whyItMatters: "La veille ne peut plus confirmer l’état public du concurrent.",
      });
    }
    return changes;
  }

  if (!previous) return [];

  const prevPlans = new Map(
    previous.plans.map((p) => [normalizeComparable(p.name) || normalizeComparable(p.price), p]),
  );
  const nextPlans = new Map(
    next.plans.map((p) => [normalizeComparable(p.name) || normalizeComparable(p.price), p]),
  );

  for (const [key, plan] of nextPlans) {
    if (!key) continue;
    const prev = prevPlans.get(key);
    if (!prev) {
      changes.push({
        changeType: "plan_added",
        title: "Plan ajouté",
        description: `Nouveau plan public détecté : ${plan.name || "sans nom"} (${plan.price}).`,
        beforeValue: null,
        afterValue: `${plan.name}|${plan.price}|${plan.period ?? ""}`,
        sourceUrl,
        confidence: "high",
        importance: "medium",
        whyItMatters: "Offre concurrente élargie — à comparer à ton packaging.",
      });
      continue;
    }
    if (normalizeComparable(prev.price) !== normalizeComparable(plan.price)) {
      changes.push({
        changeType: "pricing_changed",
        title: "Pricing modifié",
        description: `Le plan « ${plan.name || prev.name || "Plan"} » est passé de ${prev.price} à ${plan.price}.`,
        beforeValue: prev.price,
        afterValue: plan.price,
        sourceUrl,
        confidence: "high",
        importance: "high",
        whyItMatters: "Changement de prix public — impact potentiel sur ta grille.",
      });
    }
  }

  for (const [key, plan] of prevPlans) {
    if (!key) continue;
    if (!nextPlans.has(key)) {
      changes.push({
        changeType: "plan_removed",
        title: "Plan retiré",
        description: `Le plan public « ${plan.name || plan.price} » n’apparaît plus.`,
        beforeValue: `${plan.name}|${plan.price}|${plan.period ?? ""}`,
        afterValue: null,
        sourceUrl,
        confidence: "medium",
        importance: "medium",
        whyItMatters: "Packaging concurrent simplifié ou renommé.",
      });
    }
  }

  // Fallback pricing text if no structured plans
  if (
    previous.plans.length === 0 &&
    next.plans.length === 0 &&
    significantTextChange(previous.pricingText, next.pricingText, 20)
  ) {
    changes.push({
      changeType: "pricing_changed",
      title: "Page pricing modifiée",
      description: "Le texte pricing public a changé de façon significative.",
      beforeValue: previous.pricingText?.slice(0, 180) ?? null,
      afterValue: next.pricingText?.slice(0, 180) ?? null,
      sourceUrl,
      confidence: "medium",
      importance: "medium",
      whyItMatters: "Variation observée sur la page pricing — vérifier manuellement si besoin.",
    });
  }

  if (significantTextChange(previous.hero, next.hero, 16)) {
    changes.push({
      changeType: "hero_changed",
      title: "Hero modifié",
      description: "Le message principal (hero) de la homepage a changé.",
      beforeValue: previous.hero?.slice(0, 200) ?? null,
      afterValue: next.hero?.slice(0, 200) ?? null,
      sourceUrl: next.homepageUrl,
      confidence: "medium",
      importance: "low",
      whyItMatters: "Possible repositionnement du message d’accueil.",
    });
  }

  if (significantTextChange(previous.cta, next.cta, 4)) {
    changes.push({
      changeType: "cta_changed",
      title: "CTA modifié",
      description: "Le CTA principal extractible a changé.",
      beforeValue: previous.cta,
      afterValue: next.cta,
      sourceUrl: next.homepageUrl,
      confidence: "medium",
      importance: "low",
      whyItMatters: null,
    });
  }

  if (significantTextChange(previous.description, next.description, 24)) {
    changes.push({
      changeType: "positioning_changed",
      title: "Positionnement modifié",
      description: "La description / proposition de valeur publique semble avoir changé.",
      beforeValue: previous.description?.slice(0, 200) ?? null,
      afterValue: next.description?.slice(0, 200) ?? null,
      sourceUrl: next.homepageUrl,
      confidence: "low",
      importance: "low",
      whyItMatters: "Signal faible — à confirmer avant d’agir.",
    });
  }

  return changes;
}
