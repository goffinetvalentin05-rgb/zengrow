import { describe, expect, it } from "vitest";
import {
  parseCampaignResult,
  parseImproveReviewEmailResult,
  parsePrivateFeedbackAnalysis,
} from "@/src/lib/ai/prompts";

describe("parseCampaignResult", () => {
  it("extracts channel fields from JSON", () => {
    const result = parseCampaignResult({
      emailSubject: "Sujet",
      emailBody: "Corps",
      sms: "SMS court",
    });
    expect(result.emailSubject).toBe("Sujet");
    expect(result.sms).toBe("SMS court");
  });
});

describe("parsePrivateFeedbackAnalysis", () => {
  it("parses valid analysis", () => {
    const result = parsePrivateFeedbackAnalysis({
      summary: "Retard au service",
      sentiment: "negative",
      urgency: "high",
      suggestedReply: "Merci pour votre retour.",
      recommendedAction: "Briefing équipe salle",
    });
    expect(result.sentiment).toBe("negative");
    expect(result.urgency).toBe("high");
  });

  it("rejects invalid sentiment", () => {
    expect(() =>
      parsePrivateFeedbackAnalysis({
        summary: "x",
        sentiment: "angry",
        urgency: "low",
        suggestedReply: "y",
        recommendedAction: "z",
      }),
    ).toThrow();
  });
});

describe("parseImproveReviewEmailResult", () => {
  it("parses subject and body", () => {
    const result = parseImproveReviewEmailResult({
      subject: "Votre avis compte",
      body: "Bonjour {{client_name}}",
    });
    expect(result.subject).toBe("Votre avis compte");
    expect(result.body).toContain("{{client_name}}");
  });
});
