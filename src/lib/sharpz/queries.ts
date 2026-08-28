import type { SupabaseClient } from "@supabase/supabase-js";
import { computeSharpzScore } from "@/src/lib/sharpz/scoring";
import { EMPTY_ICP, type IcpProfile, type UserSaas } from "@/src/lib/sharpz/types";
import type {
  AcquisitionChannel,
  ActionImpact,
  AuditFinding,
  AuditRecord,
  Competitor,
  CompetitorChange,
  ContentIdea,
  ContentOpportunity,
  Experiment,
  Integration,
  Prospect,
  ProspectEvent,
  SharpzAction,
  SharpzOpportunity,
  UserObjective,
} from "@/src/lib/sharpz/types";

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapIcp(value: unknown): IcpProfile {
  const raw = asRecord(value);
  return {
    clientType: typeof raw.clientType === "string" ? raw.clientType : null,
    companySize: typeof raw.companySize === "string" ? raw.companySize : null,
    industry: typeof raw.industry === "string" ? raw.industry : null,
    location: typeof raw.location === "string" ? raw.location : null,
    persona: typeof raw.persona === "string" ? raw.persona : null,
    mainProblem: typeof raw.mainProblem === "string" ? raw.mainProblem : null,
  };
}

export function mapUserSaas(row: Record<string, unknown>): UserSaas {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id),
    name: typeof row.name === "string" ? row.name : null,
    url: typeof row.url === "string" ? row.url : null,
    description: typeof row.description === "string" ? row.description : null,
    category: typeof row.category === "string" ? row.category : null,
    country: typeof row.country === "string" ? row.country : null,
    market: typeof row.market === "string" ? row.market : null,
    language: typeof row.language === "string" ? row.language : null,
    businessModel: (row.business_model as UserSaas["businessModel"]) ?? null,
    pricingDetected: Boolean(row.pricing_detected),
    pricingSummary: typeof row.pricing_summary === "string" ? row.pricing_summary : null,
    billingType: (row.billing_type as UserSaas["billingType"]) ?? null,
    mrr: typeof row.mrr === "number" ? row.mrr : null,
    mrrUnknown: row.mrr_unknown !== false,
    hasFreemium: typeof row.has_freemium === "boolean" ? row.has_freemium : null,
    hasTrial: typeof row.has_trial === "boolean" ? row.has_trial : null,
    icp: Object.keys(mapIcp(row.icp)).length ? mapIcp(row.icp) : EMPTY_ICP,
    stage: (row.stage as UserSaas["stage"]) ?? null,
    scanExtract: row.scan_extract ? asRecord(row.scan_extract) : null,
    unknownFields: asStringArray(row.unknown_fields),
    onboardingCompleted: Boolean(row.onboarding_completed),
    lastAuditAt: typeof row.last_audit_at === "string" ? row.last_audit_at : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function getUserSaas(supabase: SupabaseClient, restaurantId: string) {
  const { data, error } = await supabase.from("user_saas").select("*").eq("restaurant_id", restaurantId).maybeSingle();
  if (error || !data) return null;
  return mapUserSaas(data as Record<string, unknown>);
}

export async function getObjectives(supabase: SupabaseClient, restaurantId: string): Promise<UserObjective[]> {
  const { data } = await supabase
    .from("user_objectives")
    .select("id, key, is_primary, custom_label")
    .eq("restaurant_id", restaurantId)
    .order("is_primary", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id,
    key: row.key,
    isPrimary: Boolean(row.is_primary),
    customLabel: row.custom_label ?? null,
  }));
}

export async function getChannels(supabase: SupabaseClient, restaurantId: string): Promise<AcquisitionChannel[]> {
  const { data } = await supabase
    .from("acquisition_channels")
    .select("id, channel, custom_label")
    .eq("restaurant_id", restaurantId);
  return (data ?? []).map((row) => ({
    id: row.id,
    channel: row.channel,
    customLabel: row.custom_label ?? null,
  }));
}

export async function getActions(supabase: SupabaseClient, restaurantId: string): Promise<SharpzAction[]> {
  const { data } = await supabase
    .from("actions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("score", { ascending: false });
  return (data ?? []).map((row) => mapAction(row as Record<string, unknown>));
}

export function mapAction(row: Record<string, unknown>): SharpzAction {
  const impact = Number(row.impact ?? 5);
  const effort = Number(row.effort ?? 5);
  const confidence = Number(row.confidence ?? 50);
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    category: String(row.category ?? "acquisition"),
    status: (row.status as SharpzAction["status"]) ?? "todo",
    impact,
    effort,
    confidence,
    score: Number(row.score ?? computeSharpzScore(impact, effort, confidence)),
    why: typeof row.why === "string" ? row.why : null,
    howTo: typeof row.how_to === "string" ? row.how_to : null,
    microSteps: asStringArray(row.micro_steps),
    detectedAt: String(row.detected_at ?? row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
    objectiveKey: typeof row.objective_key === "string" ? row.objective_key : null,
    sourceType: typeof row.source_type === "string" ? row.source_type : null,
    sourceId: typeof row.source_id === "string" ? row.source_id : null,
    opportunityId: typeof row.opportunity_id === "string" ? row.opportunity_id : null,
  };
}

export async function getOpportunities(supabase: SupabaseClient, restaurantId: string): Promise<SharpzOpportunity[]> {
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapOpportunity(row as Record<string, unknown>));
}

export function mapOpportunity(row: Record<string, unknown>): SharpzOpportunity {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    category: String(row.category ?? "acquisition"),
    explanation: typeof row.explanation === "string" ? row.explanation : null,
    whyDetected: typeof row.why_detected === "string" ? row.why_detected : null,
    potential: typeof row.potential === "number" ? row.potential : null,
    effort: typeof row.effort === "number" ? row.effort : null,
    confidence: typeof row.confidence === "number" ? row.confidence : null,
    dataUsed: typeof row.data_used === "string" ? row.data_used : null,
    opportunityLevel: (row.opportunity_level as SharpzOpportunity["opportunityLevel"]) ?? "medium",
    convertedActionId: typeof row.converted_action_id === "string" ? row.converted_action_id : null,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function getLatestAudit(supabase: SupabaseClient, restaurantId: string) {
  const { data } = await supabase
    .from("audits")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .contains("raw_extract", { source: "openai" })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return mapAudit(data as Record<string, unknown>);
}

export function mapAudit(row: Record<string, unknown>): AuditRecord {
  return {
    id: String(row.id),
    status: String(row.status ?? "completed"),
    summary: typeof row.summary === "string" ? row.summary : null,
    globalScore: typeof row.global_score === "number" ? row.global_score : null,
    previousScore: typeof row.previous_score === "number" ? row.previous_score : null,
    subscores: asRecord(row.subscores) as AuditRecord["subscores"],
    sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
    createdAt: String(row.created_at ?? ""),
  };
}

export async function getAuditFindings(
  supabase: SupabaseClient,
  restaurantId: string,
  auditId?: string,
): Promise<AuditFinding[]> {
  let query = supabase.from("audit_findings").select("*").eq("restaurant_id", restaurantId);
  if (auditId) query = query.eq("audit_id", auditId);
  const { data } = await query.order("severity", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    auditId: String(row.audit_id),
    kind: row.kind === "opportunity" ? "opportunity" : "problem",
    area: String(row.area ?? ""),
    title: String(row.title ?? ""),
    detail: row.detail ?? null,
    severity: row.severity ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getCompetitors(supabase: SupabaseClient, restaurantId: string): Promise<Competitor[]> {
  const { data } = await supabase.from("competitors").select("*").eq("restaurant_id", restaurantId).order("created_at");
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ""),
    url: row.url ?? null,
    positioning: row.positioning ?? null,
    pricing: row.pricing ?? null,
    status: String(row.status ?? "watching"),
    lastCheckedAt: row.last_checked_at ?? null,
  }));
}

export async function getCompetitorChanges(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<CompetitorChange[]> {
  const { data } = await supabase
    .from("competitor_changes")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    competitorId: row.competitor_id ?? null,
    changeType: String(row.change_type ?? ""),
    whatChanged: String(row.what_changed ?? ""),
    importance: String(row.importance ?? "medium"),
    whyItMatters: row.why_it_matters ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getContentOpportunities(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<ContentOpportunity[]> {
  const { data } = await supabase
    .from("content_opportunities")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    topic: String(row.topic ?? ""),
    audience: row.audience ?? null,
    potential: row.potential ?? null,
    relevance: row.relevance ?? null,
    whyNow: row.why_now ?? null,
    recommendedAngle: row.recommended_angle ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getContentIdeas(supabase: SupabaseClient, restaurantId: string): Promise<ContentIdea[]> {
  const { data } = await supabase
    .from("content_ideas")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    opportunityId: row.opportunity_id ?? null,
    platform: String(row.platform ?? ""),
    hook: String(row.hook ?? ""),
    angle: row.angle ?? null,
    objective: row.objective ?? null,
    format: row.format ?? null,
    cta: row.cta ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getProspects(supabase: SupabaseClient, restaurantId: string): Promise<Prospect[]> {
  const { data } = await supabase
    .from("prospects")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    type: row.prospect_type === "individual" ? "individual" : "company",
    name: row.name ?? null,
    company: String(row.company ?? ""),
    email: row.email ?? null,
    phone: row.phone ?? null,
    url: row.url ?? null,
    contact: row.contact ?? null,
    source: row.source ?? null,
    whyFit: row.why_fit ?? null,
    fitScore: row.fit_score ?? null,
    status: row.status ?? "to_contact",
    lastAction: row.last_action ?? null,
    contactedAt: row.contacted_at ?? null,
    nextFollowUpAt: row.next_follow_up_at ?? null,
    notes: row.notes ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
  }));
}

export async function getProspectEvents(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<ProspectEvent[]> {
  const { data } = await supabase
    .from("prospect_events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(500);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    prospectId: String(row.prospect_id),
    eventType: row.event_type as ProspectEvent["eventType"],
    detail: row.detail ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getExperiments(supabase: SupabaseClient, restaurantId: string): Promise<Experiment[]> {
  const { data } = await supabase
    .from("experiments")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    hypothesis: String(row.hypothesis ?? ""),
    actionId: row.action_id ?? null,
    actionDescription: row.action_description ?? null,
    result: row.result ?? null,
    conclusion: row.conclusion ?? null,
    status: row.status ?? "running",
    startedAt: String(row.started_at ?? row.created_at ?? ""),
    createdAt: String(row.created_at ?? ""),
    completedAt: row.completed_at ?? null,
  }));
}

export async function getActionImpacts(supabase: SupabaseClient, restaurantId: string): Promise<ActionImpact[]> {
  const { data } = await supabase
    .from("action_impacts")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: String(row.id),
    actionId: String(row.action_id ?? ""),
    experimentId: row.experiment_id ?? null,
    metric: String(row.metric ?? ""),
    beforeValue: row.before_value != null ? Number(row.before_value) : null,
    afterValue: row.after_value != null ? Number(row.after_value) : null,
    deltaAbsolute: row.delta_absolute != null ? Number(row.delta_absolute) : null,
    deltaPercent: row.delta_percent != null ? Number(row.delta_percent) : null,
    observedFrom: row.observed_from ?? null,
    observedTo: row.observed_to ?? null,
    attributionType: row.attribution_type ?? "correlated",
    confidence: typeof row.confidence === "number" ? row.confidence : null,
    evidence: row.evidence ?? null,
    createdAt: String(row.created_at ?? ""),
  }));
}

export async function getIntegrations(supabase: SupabaseClient, restaurantId: string): Promise<Integration[]> {
  const { data } = await supabase.from("integrations").select("*").eq("restaurant_id", restaurantId);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    provider: String(row.provider ?? ""),
    status: String(row.status ?? "coming_soon"),
    connectedAt: row.connected_at ?? null,
  }));
}

export function hasConnectedIntegration(integrations: Integration[]) {
  return integrations.some((item) => item.status === "connected");
}
