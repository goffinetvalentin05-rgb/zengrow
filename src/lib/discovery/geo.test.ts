import { describe, expect, it } from "vitest";
import { collectWorldPoints, geoMatchesFilter, resolveGeo } from "@/src/lib/discovery/geo";

describe("geo", () => {
  it("maps Suisse to Switzerland without inventing a country", () => {
    const entry = resolveGeo("Suisse");
    expect(entry?.filter).toBe("Switzerland");
    expect(entry?.id).toBe("switzerland");
  });

  it("returns null for unknown places instead of guessing", () => {
    expect(resolveGeo("Narnia")).toBeNull();
    expect(resolveGeo("")).toBeNull();
  });

  it("groups aliases onto one globe point", () => {
    const points = collectWorldPoints(
      [
        { country: "Suisse" },
        { country: "Switzerland" },
        { location: "Berlin", country: "Germany" },
      ],
      ["France"],
    );
    expect(points.find((point) => point.id === "switzerland")?.count).toBe(2);
    expect(points.map((point) => point.id).sort()).toEqual(["france", "germany", "switzerland"]);
  });

  it("matches an active location filter across aliases", () => {
    expect(geoMatchesFilter("Suisse", "Switzerland")).toBe(true);
    expect(geoMatchesFilter("Singapore", "Switzerland")).toBe(false);
  });
});
