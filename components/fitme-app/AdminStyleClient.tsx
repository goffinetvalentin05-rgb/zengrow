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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/style/admin").then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Accès refusé.");
        return;
      }
      setAnalyses(data.analyses ?? []);
      setPayments(data.payments ?? []);
    });
  }, []);

  return (
    <FitmeAppShell>
      <section className="fitme-flow" style={{ width: "min(52rem, calc(100% - 2rem))" }}>
        <p className="fitme-eyebrow">Admin</p>
        <h1>Analyses & paiements</h1>
        {error ? <p className="fitme-error">{error}</p> : null}

        <article className="fitme-admin">
          <p className="fitme-eyebrow">Analyses</p>
          {analyses.map((row) => (
            <p key={row.id} className="fitme-fine" style={{ marginTop: "0.55rem" }}>
              {row.status} · {row.payment_status} · {row.primary_style ?? "—"} · {row.error_message ?? ""} · {row.id}
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
