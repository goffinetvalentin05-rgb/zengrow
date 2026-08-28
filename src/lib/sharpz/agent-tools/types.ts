import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { loadSharpzContext } from "@/src/lib/sharpz/context";
import type { ActionCategory } from "@/src/lib/sharpz/types";

export type SharpzAgentContext = Awaited<ReturnType<typeof loadSharpzContext>>;

export type AgentToolName =
  | "search_prospects"
  | "create_action"
  | "schedule_followup"
  | "analyze_traffic"
  | "create_experiment"
  | "search_competitors"
  | "analyze_competitor_changes"
  | "create_competitor"
  | "create_prospect";

export type AgentRestaurant = {
  id: string;
  name: string;
  subscription_plan: import("@/src/lib/subscription").SubscriptionPlan;
  subscription_status: import("@/src/lib/subscription").SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

export type AgentSession = {
  supabase: SupabaseClient;
  user: User;
  restaurant: AgentRestaurant;
};

export type AgentToolExecutionContext = {
  session: AgentSession;
  sharpzContext: SharpzAgentContext;
  userMessage: string;
};

export type ToolResultStatus =
  | "ok"
  | "error"
  | "missing_integration"
  | "not_configured"
  | "confirmation_required";

export type ProposedActionPayload = {
  title: string;
  category: ActionCategory;
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  why: string;
  howTo?: string;
  objectiveKey?: string | null;
};

export type ProposedFollowUpPayload = {
  prospectId: string;
  company: string;
  name: string | null;
  daysFromNow: number;
  nextFollowUpAt: string;
  note?: string;
};

export type ProposedExperimentPayload = {
  hypothesis: string;
  title?: string | null;
  actionId?: string | null;
  actionDescription?: string | null;
  metric?: string | null;
  plannedDays?: number | null;
};

export type ProposedProspectPayload = {
  company: string;
  name?: string | null;
  url?: string | null;
  email?: string | null;
  phone?: string | null;
  contact?: string | null;
  whyFit?: string | null;
  notes?: string | null;
};

export type ProposedCompetitorPayload = {
  name: string;
  url: string;
  whyCompetitor?: string | null;
  sourceUrl?: string | null;
};

export type AgentToolResult = {
  tool: AgentToolName;
  status: ToolResultStatus;
  message?: string;
  error?: string;
  retryable?: boolean;
  /** Prospects trouvés (search_prospects) */
  prospects?: Array<{
    company: string;
    name?: string | null;
    url?: string | null;
    sourceUrl?: string | null;
    location?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
    contact?: string | null;
    whyFit?: string | null;
    fitScore?: number | null;
    notes?: string | null;
  }>;
  /** Concurrents proposés (search_competitors) — validation avant insert */
  competitors?: Array<{
    companyName: string;
    website: string;
    whyCompetitor?: string | null;
    sourceUrl?: string | null;
    confidence?: number | null;
  }>;
  competitorChanges?: Array<{
    id: string;
    competitorId: string | null;
    competitorName?: string | null;
    changeType: string;
    whatChanged: string;
    importance: string;
    whyItMatters: string | null;
    beforeValue?: string | null;
    afterValue?: string | null;
    sourceUrl?: string | null;
    confidence?: string | null;
    createdAt: string;
  }>;
  meta?: Record<string, unknown>;
  proposedAction?: ProposedActionPayload;
  proposedFollowUp?: ProposedFollowUpPayload;
  proposedExperiment?: ProposedExperimentPayload;
  proposedProspect?: ProposedProspectPayload;
  proposedCompetitor?: ProposedCompetitorPayload;
  traffic?: Record<string, unknown>;
};

export type AgentOrchestratorResult = {
  reply: string;
  prospects: NonNullable<AgentToolResult["prospects"]>;
  competitors: NonNullable<AgentToolResult["competitors"]>;
  proposedActions: ProposedActionPayload[];
  proposedFollowUps: ProposedFollowUpPayload[];
  proposedExperiments: ProposedExperimentPayload[];
  proposedProspects: ProposedProspectPayload[];
  proposedCompetitors: ProposedCompetitorPayload[];
  meta: {
    model: string;
    toolsCalled: AgentToolName[];
    capability?: string;
  };
  searchError?: { message: string; retryable: boolean };
};
