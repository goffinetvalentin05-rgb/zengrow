import { describe, expect, it } from "vitest";
import { assertCronAuthorized } from "@/src/lib/cron-auth";
import { NextRequest } from "next/server";

describe("cron-auth P0.6", () => {
  it("refuse si CRON_SECRET absent", () => {
    const prev = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    const res = assertCronAuthorized(new NextRequest("https://example.com/api/cron/x"));
    expect(res?.status).toBe(503);
    if (prev === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prev;
  });

  it("refuse si secret incorrect", () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "expected-secret";
    const res = assertCronAuthorized(
      new NextRequest("https://example.com/api/cron/x", {
        headers: { authorization: "Bearer wrong" },
      }),
    );
    expect(res?.status).toBe(401);
    if (prev === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prev;
  });

  it("autorise Bearer correct", () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "expected-secret";
    const res = assertCronAuthorized(
      new NextRequest("https://example.com/api/cron/x", {
        headers: { authorization: "Bearer expected-secret" },
      }),
    );
    expect(res).toBeNull();
    if (prev === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prev;
  });
});
