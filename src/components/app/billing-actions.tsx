"use client";

import { useState } from "react";
import Button from "@/src/components/ui/button";

export default function BillingActions({ hasCustomer }: { hasCustomer: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"checkout" | "portal" | null>(null);

  async function open(path: string, kind: "checkout" | "portal") {
    setError(null);
    setPending(kind);
    try {
      const response = await fetch(path, { method: "POST" });
      const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Billing is unavailable right now.");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setError("Billing is unavailable right now.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button type="button" disabled={pending !== null} onClick={() => void open("/api/billing/checkout", "checkout")}>
        {pending === "checkout" ? "Opening…" : "Upgrade to Pro"}
      </Button>
      {hasCustomer ? (
        <Button
          type="button"
          variant="secondary"
          disabled={pending !== null}
          onClick={() => void open("/api/billing/portal", "portal")}
        >
          {pending === "portal" ? "Opening…" : "Manage billing"}
        </Button>
      ) : null}
      {error ? <p className="w-full text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
