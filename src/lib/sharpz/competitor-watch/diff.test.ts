import { describe, expect, it } from "vitest";
import {
  buildChangeDedupKey,
  diffCompetitorSnapshots,
  hashSnapshot,
  type CompetitorSnapshotData,
} from "@/src/lib/sharpz/competitor-watch/diff";
import { extractPlansFromPricingText, discoverPricingUrl } from "@/src/lib/sharpz/competitor-watch/extract";

function snap(partial: Partial<CompetitorSnapshotData>): CompetitorSnapshotData {
  return {
    title: "Acme",
    description: "Productivity for teams",
    hero: "Ship faster with Acme",
    cta: "Start free",
    pricingText: null,
    plans: [],
    homepageUrl: "https://acme.test",
    pricingUrl: "https://acme.test/pricing",
    ...partial,
  };
}

describe("competitor-watch P0.5", () => {
  it("CAS 1 — snapshot initial → aucun change", () => {
    const next = snap({
      plans: [{ name: "Pro", price: "29€", period: "mois" }],
    });
    expect(diffCompetitorSnapshots(null, next)).toEqual([]);
  });

  it("CAS 2 — prix 29 → 39 → pricing_changed", () => {
    const prev = snap({
      plans: [{ name: "Pro", price: "29€", period: "mois" }],
    });
    const next = snap({
      plans: [{ name: "Pro", price: "39€", period: "mois" }],
    });
    const changes = diffCompetitorSnapshots(prev, next);
    expect(changes.some((c) => c.changeType === "pricing_changed")).toBe(true);
    expect(changes.find((c) => c.changeType === "pricing_changed")?.beforeValue).toBe("29€");
    expect(changes.find((c) => c.changeType === "pricing_changed")?.afterValue).toBe("39€");
  });

  it("CAS 3 — même hero/pricing → aucun event business", () => {
    const prev = snap({
      hero: "Ship faster with Acme",
      description: "Productivity for teams building products",
      plans: [{ name: "Pro", price: "29€", period: "mois" }],
    });
    const next = snap({
      hero: "Ship faster with Acme",
      description: "Productivity for teams building products",
      plans: [{ name: "Pro", price: "29€", period: "mois" }],
      title: "Acme | Home",
    });
    expect(diffCompetitorSnapshots(prev, next)).toEqual([]);
  });

  it("CAS 3b — hash stable hors whitespace", () => {
    const a = snap({ hero: "Hello   world" });
    const b = snap({ hero: "hello world" });
    expect(hashSnapshot(a)).toBe(hashSnapshot(b));
  });

  it("CAS 4 — hero réellement modifié → hero_changed", () => {
    const prev = snap({ hero: "Productivity suite for startups everywhere" });
    const next = snap({ hero: "Growth operating system for SaaS founders worldwide" });
    const changes = diffCompetitorSnapshots(prev, next);
    expect(changes.some((c) => c.changeType === "hero_changed")).toBe(true);
  });

  it("CAS 5 — page unavailable après ok → page_unavailable", () => {
    const prev = snap({});
    const next = snap({});
    const changes = diffCompetitorSnapshots(prev, next, {
      fetchStatus: "unavailable",
      previousFetchStatus: "ok",
    });
    expect(changes.some((c) => c.changeType === "page_unavailable")).toBe(true);
  });

  it("CAS 6 — même before/after → même dedup_key", () => {
    const a = buildChangeDedupKey({
      competitorId: "c1",
      changeType: "pricing_changed",
      beforeValue: "29€",
      afterValue: "39€",
    });
    const b = buildChangeDedupKey({
      competitorId: "c1",
      changeType: "pricing_changed",
      beforeValue: "29 €",
      afterValue: "39€",
    });
    expect(a).toBe(b);
  });

  it("extrait plans / découvre pricing URL sans invention", () => {
    const plans = extractPlansFromPricingText("Starter 19€/mois Pro 49€/mois Enterprise 99€/mois");
    expect(plans.length).toBeGreaterThanOrEqual(2);
    const html = `<a href="/pricing">Pricing</a><a href="https://other.test/x">x</a>`;
    expect(discoverPricingUrl(html, "https://acme.test")).toBe("https://acme.test/pricing");
    expect(discoverPricingUrl("<p>no links</p>", "https://acme.test")).toBeNull();
  });
});
