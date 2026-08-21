import { createAdminClient } from "@/src/lib/supabase/admin";
import { IN_PROGRESS_STATUSES, RESUMABLE_DRAFT_STATUSES } from "@/src/lib/fitme/constants";

export type StyleAnalysisRow = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  is_unlocked: boolean;
  primary_style: string | null;
  primary_style_score: number | null;
  secondary_style: string | null;
  secondary_style_score: number | null;
  color_profile: unknown;
  style_notes: unknown;
  preferences: unknown;
  preview_data: unknown;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export async function getLatestAnalysis(userId: string): Promise<StyleAnalysisRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("style_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as StyleAnalysisRow | null) ?? null;
}

export async function getAnalysisForUser(analysisId: string, userId: string): Promise<StyleAnalysisRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("style_analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as StyleAnalysisRow | null) ?? null;
}

export function resolveFitmePath(analysis: StyleAnalysisRow | null): string {
  if (!analysis) return "/onboarding";

  if ((RESUMABLE_DRAFT_STATUSES as readonly string[]).includes(analysis.status)) {
    return "/onboarding";
  }

  if ((IN_PROGRESS_STATUSES as readonly string[]).includes(analysis.status)) {
    return `/analysis/${analysis.id}`;
  }

  if (analysis.status === "failed") {
    return `/analysis/${analysis.id}`;
  }

  if (analysis.status === "completed" && analysis.is_unlocked && analysis.payment_status === "paid") {
    return "/style-profile";
  }

  if (analysis.status === "completed") {
    return `/analysis/${analysis.id}/preview`;
  }

  return "/onboarding";
}
