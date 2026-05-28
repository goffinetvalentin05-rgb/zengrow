export type AIFeature =
  | "google_review_reply"
  | "campaign"
  | "private_feedback_analysis"
  | "improve_review_email";

export type AIPlanTier = "trial" | "basic" | "pro" | "premium";

export type PrivateFeedbackAIAnalysis = {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  mainIssue?: string;
  urgency: "low" | "medium" | "high";
  suggestedReply: string;
  recommendedAction: string;
  analyzedAt?: string;
};

export type CampaignAIResult = {
  emailSubject?: string;
  emailBody?: string;
  sms?: string;
  whatsapp?: string;
  instagramPost?: string;
  cta?: string;
};

export type ImproveReviewEmailAIResult = {
  subject: string;
  body: string;
};
