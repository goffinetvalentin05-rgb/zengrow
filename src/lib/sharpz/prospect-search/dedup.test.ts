import { describe, expect, it } from "vitest";
import {
  buildDedupIndex,
  isDuplicateCandidate,
  normalizeDomain,
  registerCandidate,
  shouldSkipSearchUrl,
} from "@/src/lib/sharpz/prospect-search/dedup";

describe("prospect-search dedup", () => {
  it("normalizes domains", () => {
    expect(normalizeDomain("https://www.fc-exemple.ch/contact")).toBe("fc-exemple.ch");
  });

  it("detects duplicate by domain", () => {
    const index = buildDedupIndex([
      {
        id: "1",
        type: "company",
        name: null,
        company: "FC Exemple",
        email: null,
        phone: null,
        url: "https://fc-exemple.ch",
        contact: null,
        source: null,
        sourceUrl: null,
        whyFit: null,
        fitScore: null,
        status: "to_contact",
        lastAction: null,
        contactedAt: null,
        nextFollowUpAt: null,
        notes: null,
        linkedinUrl: null,
        instagramUrl: null,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    expect(
      isDuplicateCandidate({ company: "Autre nom", url: "http://www.fc-exemple.ch", email: null, phone: null }, index),
    ).toBe(true);
  });

  it("registers candidates to avoid duplicates within the same batch", () => {
    const index = buildDedupIndex([]);
    registerCandidate({ company: "A", url: "https://a.ch", email: null, phone: null }, index);
    expect(isDuplicateCandidate({ company: "A copy", url: "https://a.ch", email: null, phone: null }, index)).toBe(true);
  });

  it("skips social hosts", () => {
    expect(shouldSkipSearchUrl("https://www.facebook.com/page")).toBe(true);
    expect(shouldSkipSearchUrl("https://fc-jura.ch")).toBe(false);
  });
});
