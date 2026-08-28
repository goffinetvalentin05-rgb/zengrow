export type SaasStage = "idea" | "mvp" | "launch" | "first_customers" | "growth";

export type BusinessModel = "b2b" | "b2c" | "both";

export type BillingType = "subscription" | "one_shot" | "both";

export type ObjectiveKey =
  | "first_customers"
  | "more_prospects"
  | "increase_mrr"
  | "improve_conversion"
  | "reduce_churn"
  | "find_acquisition_channel"
  | "improve_positioning"
  | "other";

export type ChannelKey =
  | "linkedin"
  | "x"
  | "tiktok"
  | "instagram"
  | "youtube"
  | "reddit"
  | "seo"
  | "cold_email"
  | "cold_call"
  | "paid_ads"
  | "partnerships"
  | "other";

export type ActionCategory =
  | "acquisition"
  | "conversion"
  | "landing"
  | "pricing"
  | "content"
  | "seo"
  | "retention"
  | "market"
  | "prospection"
  | "monetisation"
  | "positioning";

export type ActionStatus = "todo" | "in_progress" | "done" | "ignored";

export type OpportunityCategory =
  | "acquisition"
  | "conversion"
  | "monetisation"
  | "retention"
  | "positioning"
  | "market_trend"
  | "new_product"
  | "market_shift";

export type OpportunityLevel = "low" | "medium" | "high";

export type ProspectStatus =
  | "to_contact"
  | "follow_up_1"
  | "follow_up_2"
  | "in_discussion"
  | "qualified"
  | "customer"
  | "closed";

export type ProspectType = "company" | "individual";

export type IntegrationProvider =
  | "stripe"
  | "paddle"
  | "google_analytics"
  | "posthog"
  | "supabase"
  | "search_console"
  | "sharpz_analytics";

export type IntegrationStatus = "connected" | "available" | "coming_soon";

export type IcpProfile = {
  clientType: string | null;
  companySize: string | null;
  industry: string | null;
  location: string | null;
  persona: string | null;
  mainProblem: string | null;
};

export type UserSaas = {
  id: string;
  restaurantId: string;
  name: string | null;
  url: string | null;
  description: string | null;
  category: string | null;
  country: string | null;
  market: string | null;
  language: string | null;
  businessModel: BusinessModel | null;
  pricingDetected: boolean;
  pricingSummary: string | null;
  billingType: BillingType | null;
  mrr: number | null;
  mrrUnknown: boolean;
  hasFreemium: boolean | null;
  hasTrial: boolean | null;
  icp: IcpProfile;
  stage: SaasStage | null;
  scanExtract: Record<string, unknown> | null;
  unknownFields: string[];
  onboardingCompleted: boolean;
  onboardingStep: string | null;
  onboardingDraft: Record<string, unknown> | null;
  lastAuditAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserObjective = {
  id: string;
  key: ObjectiveKey | string;
  isPrimary: boolean;
  customLabel: string | null;
};

export type AcquisitionChannel = {
  id: string;
  channel: ChannelKey | string;
  customLabel: string | null;
};

export type AuditSubscoreKey = "landing" | "ux" | "seo" | "positioning" | "conversion" | "retention";

export type AuditRecord = {
  id: string;
  status: string;
  summary: string | null;
  globalScore: number | null;
  previousScore: number | null;
  subscores: Partial<Record<AuditSubscoreKey, number>>;
  sourceUrl: string | null;
  createdAt: string;
};

export type AuditFinding = {
  id: string;
  auditId: string;
  kind: "problem" | "opportunity";
  area: AuditSubscoreKey | string;
  title: string;
  detail: string | null;
  severity: number | null;
  createdAt: string;
};

export type SharpzAction = {
  id: string;
  title: string;
  category: ActionCategory | string;
  status: ActionStatus;
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  why: string | null;
  howTo: string | null;
  microSteps: string[];
  detectedAt: string;
  updatedAt?: string;
  objectiveKey: string | null;
  sourceType: string | null;
  sourceId: string | null;
  opportunityId: string | null;
};

export type SharpzOpportunity = {
  id: string;
  name: string;
  category: OpportunityCategory | string;
  explanation: string | null;
  whyDetected: string | null;
  potential: number | null;
  effort: number | null;
  confidence: number | null;
  dataUsed: string | null;
  opportunityLevel: OpportunityLevel;
  convertedActionId: string | null;
  createdAt: string;
};

export type Competitor = {
  id: string;
  name: string;
  url: string | null;
  positioning: string | null;
  pricing: string | null;
  status: string;
  lastCheckedAt: string | null;
};

export type CompetitorChange = {
  id: string;
  competitorId: string | null;
  competitorName?: string | null;
  changeType: string;
  whatChanged: string;
  importance: string;
  whyItMatters: string | null;
  createdAt: string;
};

export type ContentOpportunity = {
  id: string;
  topic: string;
  audience: string | null;
  potential: number | null;
  relevance: number | null;
  whyNow: string | null;
  recommendedAngle: string | null;
  createdAt: string;
};

export type ContentIdea = {
  id: string;
  opportunityId: string | null;
  platform: string;
  hook: string;
  angle: string | null;
  objective: string | null;
  format: string | null;
  cta: string | null;
  createdAt: string;
};

export type Prospect = {
  id: string;
  type: ProspectType;
  name: string | null;
  company: string;
  email: string | null;
  phone: string | null;
  url: string | null;
  contact: string | null;
  source: string | null;
  whyFit: string | null;
  fitScore: number | null;
  status: ProspectStatus | string;
  lastAction: string | null;
  contactedAt: string | null;
  nextFollowUpAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProspectEvent = {
  id: string;
  prospectId: string;
  eventType: "created" | "status_change" | "note" | "contact";
  detail: string | null;
  createdAt: string;
};

export type Experiment = {
  id: string;
  hypothesis: string;
  actionId: string | null;
  actionDescription: string | null;
  result: string | null;
  conclusion: string | null;
  status: "running" | "completed" | string;
  startedAt: string;
  createdAt: string;
  completedAt: string | null;
};

export type ActionImpactAttribution = "observed_after" | "correlated" | "experiment";

export type ActionImpact = {
  id: string;
  actionId: string;
  experimentId: string | null;
  metric: string;
  beforeValue: number | null;
  afterValue: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
  observedFrom: string | null;
  observedTo: string | null;
  attributionType: ActionImpactAttribution | string;
  confidence: number | null;
  evidence: string | null;
  createdAt: string;
};

export type Integration = {
  id: string;
  provider: IntegrationProvider | string;
  status: IntegrationStatus | string;
  connectedAt: string | null;
};

export type WebsiteExtract = {
  url: string;
  finalUrl: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  language: string | null;
  headings: string[];
  textSample: string;
  hasPricingSignals: boolean;
  hasTrialSignals: boolean;
  hasFreemiumSignals: boolean;
};

export type ScanResult = {
  enrichmentSource: "openai" | "extract_only";
  extract: WebsiteExtract;
  detected: {
    name: string | null;
    description: string | null;
    category: string | null;
    country: string | null;
    market: string | null;
    language: string | null;
    businessModel: BusinessModel | null;
    pricingSummary: string | null;
    billingType: BillingType | null;
    hasFreemium: boolean | null;
    hasTrial: boolean | null;
    icp: IcpProfile;
  };
  unknownFields: string[];
};

export type EmptyIcp = IcpProfile;

export const EMPTY_ICP: EmptyIcp = {
  clientType: null,
  companySize: null,
  industry: null,
  location: null,
  persona: null,
  mainProblem: null,
};
