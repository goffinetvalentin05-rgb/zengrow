import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEV_SITE_URL,
  getAuthCallbackUrl,
  getPasswordRecoveryRedirectUrl,
  getPublicSiteUrl,
  getSharpzBotUserAgent,
  getSharpzContactMailto,
  getSharpzLinkHost,
  PRODUCTION_SITE_HOST,
  PRODUCTION_SITE_URL,
} from "@/src/lib/site-url";

describe("site URL config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sharpz.me/");
    expect(getPublicSiteUrl()).toBe("https://sharpz.me");
    expect(getAuthCallbackUrl()).toBe("https://sharpz.me/auth/callback");
    expect(getPasswordRecoveryRedirectUrl()).toBe("https://sharpz.me/update-password");
  });

  it("accepts NEXT_PUBLIC_APP_URL as a legacy alias", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://sharpz.me");
    expect(getPublicSiteUrl()).toBe("https://sharpz.me");
  });

  it("defaults to localhost outside production when env is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "test");
    expect(getPublicSiteUrl()).toBe(DEV_SITE_URL);
  });

  it("falls back to sharpz.me in production", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");
    expect(getPublicSiteUrl()).toBe(PRODUCTION_SITE_URL);
  });

  it("uses Vercel preview URL when SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "sharpz-git-main.vercel.app");
    expect(getPublicSiteUrl()).toBe("https://sharpz-git-main.vercel.app");
  });

  it("keeps the branded link host configurable without scattering sharpz.me", () => {
    vi.stubEnv("NEXT_PUBLIC_SHARPZ_LINK_HOST", "");
    expect(getSharpzLinkHost()).toBe(PRODUCTION_SITE_HOST);
    expect(getSharpzContactMailto()).toBe("mailto:contact@sharpz.me");
    vi.stubEnv("NEXT_PUBLIC_SHARPZ_LINK_HOST", "https://sharpz.me");
    expect(getSharpzLinkHost()).toBe("sharpz.me");
  });

  it("builds the crawler user-agent from the public site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sharpz.me");
    expect(getSharpzBotUserAgent()).toBe("SharpzBot/1.0 (+https://sharpz.me)");
    expect(getSharpzBotUserAgent("competitor-watch")).toBe(
      "SharpzBot/1.0 (+https://sharpz.me; competitor-watch)",
    );
  });
});
