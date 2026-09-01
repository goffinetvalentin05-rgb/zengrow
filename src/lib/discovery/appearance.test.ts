import { describe, expect, it } from "vitest";
import {
  profileSectionOrder,
  resolveProfileLayout,
  sanitizeAccentColor,
} from "@/src/lib/discovery/appearance";

describe("profile personal page appearance", () => {
  it("maps featured_first to content_first when layout is missing", () => {
    expect(resolveProfileLayout(null, true)).toBe("content_first");
    expect(resolveProfileLayout(undefined, false)).toBe("default");
    expect(resolveProfileLayout("project_first", true)).toBe("project_first");
  });

  it("orders sections for default / content first / project first", () => {
    expect(profileSectionOrder("default", true, true)).toEqual(["building", "featured"]);
    expect(profileSectionOrder("content_first", true, true)).toEqual(["featured", "building"]);
    expect(profileSectionOrder("project_first", true, true)).toEqual(["building", "featured"]);
    expect(profileSectionOrder("content_first", false, true)).toEqual(["featured"]);
    expect(profileSectionOrder("default", true, false)).toEqual(["building"]);
  });

  it("accepts optional hex accents only", () => {
    expect(sanitizeAccentColor("#7dd3fc")).toBe("#7dd3fc");
    expect(sanitizeAccentColor("AABBCC")).toBe("#aabbcc");
    expect(sanitizeAccentColor("#fff")).toBeNull();
    expect(sanitizeAccentColor("red")).toBeNull();
    expect(sanitizeAccentColor("")).toBeNull();
  });
});
