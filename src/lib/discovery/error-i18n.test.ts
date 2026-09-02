import { describe, expect, it } from "vitest";
import { appEn } from "@/src/locales/app/en";
import { appFr } from "@/src/locales/app/fr";
import { translateDiscoveryError } from "./error-i18n";

describe("translateDiscoveryError", () => {
  it("maps known API errors in both languages", () => {
    expect(translateDiscoveryError("Already taken.", appFr)).toBe(appFr.errors.usernameTaken);
    expect(translateDiscoveryError("Already taken.", appEn)).toBe(appEn.errors.usernameTaken);
    expect(translateDiscoveryError("This link is reserved.", appFr)).toBe(appFr.slug.reserved);
    expect(translateDiscoveryError("Name is required.", appFr)).toBe(appFr.errors.required);
  });

  it("falls back to the generic error", () => {
    expect(translateDiscoveryError("Something obscure", appFr)).toBe(appFr.errors.generic);
    expect(translateDiscoveryError(null, appEn)).toBe(appEn.errors.generic);
  });
});
