export type FitmeEventName =
  | "landing_cta_clicked"
  | "signup_completed"
  | "onboarding_started"
  | "photos_uploaded"
  | "analysis_started"
  | "analysis_completed"
  | "paywall_viewed"
  | "checkout_started"
  | "payment_completed"
  | "style_profile_viewed";

export function trackFitmeEvent(name: FitmeEventName, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fitme:analytics", { detail: { name, props } }));
}
