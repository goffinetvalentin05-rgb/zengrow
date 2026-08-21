"use client";

import { useEffect, useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";

type AnalysisRow = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  is_unlocked: boolean;
  error_message: string | null;
  created_at: string;
  primary_style: string | null;
  ai_provider?: string | null;
};

type PaymentRow = {
  id: string;
  analysis_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export function AdminStyleClient() {
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [provider, setProvider] = useState("mock");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/fitme").then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Accès refusé.");
        return;
      }
      setAnalyses(data.analyses ?? []);
      setPayments(data.payments ?? []);
      setProvider(data.provider ?? "mock");
    });
  }, []);

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ width: "min(52rem, calc(100% - 2rem))" }}>
        <p className="fitme-eyebrow">Admin FITME</p>
        <h1>Analyses</h1>
        <p className="fitme-fine">Provider: {provider}</p>
        {error ? <p className="fitme-error">{error}</p> : null}

        <article className="fitme-admin">
          {analyses.map((row) => (
            <p key={row.id} className="fitme-fine" style={{ marginTop: "0.7rem" }}>
              {row.id.slice(0, 8)} · {row.user_id.slice(0, 8)} · {row.status} · {row.payment_status} ·{" "}
              {row.ai_provider ?? provider} · {new Date(row.created_at).toLocaleString("fr-CH")} ·{" "}
              {row.error_message ?? "—"}
            </p>
          ))}
        </article>

        <article className="fitme-admin">
          <p className="fitme-eyebrow">Paiements</p>
          {payments.map((row) => (
            <p key={row.id} className="fitme-fine" style={{ marginTop: "0.55rem" }}>
              {row.status} · {(row.amount / 100).toFixed(2)} {row.currency} · {row.analysis_id}
            </p>
          ))}
        </article>
      </section>
    </FitmeAppShell>
  );
}
