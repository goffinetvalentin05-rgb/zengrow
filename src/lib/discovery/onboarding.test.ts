import { describe, expect, it } from "vitest";
import {
  canLeaveOnboardingStep,
  emptyOnboardingDraft,
  isOptionalUrlOk,
  profileHasMinimumOnboarding,
} from "@/src/lib/discovery/onboarding";

const draft = emptyOnboardingDraft("p1");

describe("onboarding validation", () => {
  it("requires 1–5 niches on step 1", () => {
    expect(canLeaveOnboardingStep("interests", draft)).toBe(false);
    expect(canLeaveOnboardingStep("interests", { ...draft, niches: ["a"] })).toBe(true);
  });

  it("requires name, valid username and role on step 2", () => {
    const identity = { ...draft, displayName: "Maya", username: "maya", profileType: "founder" };
    expect(canLeaveOnboardingStep("identity", identity)).toBe(true);
    expect(canLeaveOnboardingStep("identity", { ...identity, username: "me" })).toBe(false);
    expect(canLeaveOnboardingStep("identity", { ...identity, profileType: "" })).toBe(false);
  });

  it("lets people skip the project, but validates a filled URL", () => {
    expect(canLeaveOnboardingStep("project", { ...draft, skipProject: true })).toBe(true);
    expect(canLeaveOnboardingStep("project", { ...draft, projectName: "" })).toBe(true);
    expect(canLeaveOnboardingStep("project", { ...draft, projectName: "Northloop" })).toBe(true);
    expect(canLeaveOnboardingStep("project", { ...draft, projectName: "Northloop", projectUrl: "not a url" })).toBe(
      false,
    );
  });

  it("accepts empty or http(s) social URLs", () => {
    expect(isOptionalUrlOk("")).toBe(true);
    expect(isOptionalUrlOk("instagram.com/maya")).toBe(true);
    expect(isOptionalUrlOk("nope")).toBe(false);
  });

  it("grandfathers complete existing profiles", () => {
    expect(profileHasMinimumOnboarding({ onboardingCompleted: true })).toBe(true);
    expect(profileHasMinimumOnboarding({ username: "maya", profileType: "founder", nicheCount: 2 })).toBe(true);
    expect(profileHasMinimumOnboarding({ username: "maya", profileType: "founder", nicheCount: 0 })).toBe(false);
    expect(profileHasMinimumOnboarding({ username: null, profileType: "founder", nicheCount: 1 })).toBe(false);
  });
});
