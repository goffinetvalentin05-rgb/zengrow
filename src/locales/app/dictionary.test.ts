import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage } from "@/src/i18n/locale";
import { appEn } from "./en";
import { appFr } from "./fr";
import { getMessages, interpolate } from "./index";

function keysOf(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) return keysOf(child, path);
    return [path];
  });
}

describe("app dictionaries", () => {
  it("keeps FR and EN keys in sync", () => {
    expect(keysOf(appEn).sort()).toEqual(keysOf(appFr).sort());
  });

  it("interpolates placeholders", () => {
    expect(interpolate("Copier pour {platform}", { platform: "Instagram" })).toBe("Copier pour Instagram");
  });

  it("returns the requested locale messages", () => {
    expect(getMessages("fr").nav.explore).toBe("Explorer");
    expect(getMessages("en").nav.explore).toBe("Explore");
    expect(getMessages("fr").landing.lang.fr).toBe("FR");
  });
});

describe("locale detection", () => {
  it("prefers French when the browser language is French", () => {
    expect(localeFromAcceptLanguage("fr-CH,fr;q=0.9,en;q=0.8")).toBe("fr");
  });

  it("falls back to English otherwise", () => {
    expect(localeFromAcceptLanguage("de-DE,en-US;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage(null)).toBe("en");
  });
});
