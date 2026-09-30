/**
 * Single place for future Free / Pro limits.
 * V1 does not lock core learning features, so the first users can test the full loop.
 */
export type LearnEntitlements = {
  plan: "free" | "pro";
  maxItems: number | null;
  apiEnabled: boolean;
};

export function entitlementsFor(isPro: boolean): LearnEntitlements {
  return {
    plan: isPro ? "pro" : "free",
    maxItems: null,
    apiEnabled: true,
  };
}
