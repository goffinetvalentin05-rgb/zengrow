"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { FitmeReveal } from "@/components/fitme-app/FitmeReveal";
import { createClient } from "@/src/lib/supabase/client";
import { resolveFitmePath } from "@/src/lib/fitme/routing";

export type AccountAnalysisCard = {
  id: string;
  status: string;
  isUnlocked: boolean;
  createdAt: string;
  primaryStyle: string | null;
  paymentStatus: string;
};

type Props = {
  firstName: string | null;
  email: string | null;
  analyses: AccountAnalysisCard[];
};

function actionFor(card: AccountAnalysisCard) {
  const path = resolveFitmePath({
    id: card.id,
    user_id: "",
    status: card.status,
    payment_status: card.paymentStatus,
    is_unlocked: card.isUnlocked,
    primary_style: card.primaryStyle,
    primary_style_score: null,
    secondary_style: null,
    secondary_style_score: null,
    color_profile: null,
    style_notes: null,
    preferences: null,
    preview_data: null,
    error_message: null,
    looks_job_started_at: null,
    created_at: card.createdAt,
    updated_at: card.createdAt,
    completed_at: null,
  });
  if (["draft", "uploaded"].includes(card.status)) return { href: path, label: "Continuer" };
  if (card.status === "completed" && card.isUnlocked) return { href: path, label: "Voir mon Style Profile" };
  return { href: path, label: "Continuer" };
}

function statusLabel(card: AccountAnalysisCard) {
  if (card.primaryStyle) return card.primaryStyle;
  if (["preview_ready", "awaiting_payment"].includes(card.status)) return "Prêt à débloquer";
  if (["paid", "generating_looks"].includes(card.status)) return "Looks en cours";
  if (["queued", "analyzing"].includes(card.status)) return "Analyse en cours";
  if (["draft", "uploaded"].includes(card.status)) return "À reprendre";
  if (card.status === "failed") return "À relancer";
  return "Analyse en cours";
}

export function AccountClient({ firstName, email, analyses }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hello = firstName?.trim() || "vous";

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function deletePhotos() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/style/account/photos", { method: "POST" });
    setBusy(false);
    if (!response.ok) {
      setMessage("Impossible de supprimer les photos pour le moment.");
      return;
    }
    setMessage("Vos photos ont été supprimées.");
  }

  async function deleteAccount() {
    if (!window.confirm("Supprimer définitivement votre compte FITME ?")) return;
    setBusy(true);
    const response = await fetch("/api/account", { method: "DELETE" });
    setBusy(false);
    if (!response.ok) {
      setMessage("Impossible de supprimer le compte pour le moment.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <FitmeAppShell
      right={
        <button type="button" className="fitme-app-bar__link" onClick={() => void logout()}>
          Déconnexion
        </button>
      }
    >
      <section className="fitme-flow">
        <FitmeReveal>
          <p className="fitme-eyebrow">Compte</p>
          <h1>Bonjour {hello}</h1>
          <p className="fitme-lead">{email}</p>
        </FitmeReveal>

        <FitmeReveal delay={0.08}>
          <p className="fitme-eyebrow" style={{ marginTop: "1.8rem" }}>
            Analyses
          </p>
          {analyses.length ? (
            <div className="fitme-account-grid">
              {analyses.map((card) => {
                const action = actionFor(card);
                return (
                  <article key={card.id} className="fitme-account-card">
                    <p className="fitme-eyebrow">Style Profile</p>
                    <p className="fitme-display" style={{ fontSize: "1.55rem", marginTop: "0.4rem" }}>
                      {statusLabel(card)}
                    </p>
                    <p className="fitme-fine">{new Date(card.createdAt).toLocaleDateString("fr-CH")}</p>
                    <div style={{ marginTop: "1rem" }}>
                      <Link href={action.href} className="fitme-cta fitme-cta--block">
                        {action.label}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="fitme-account-card">
              <p className="fitme-lead">Aucun Style Profile pour le moment. Quelques photos suffisent pour commencer.</p>
              <Link href="/start" className="fitme-cta fitme-cta--block" style={{ marginTop: "1rem" }}>
                Découvrir mon style
              </Link>
            </article>
          )}
        </FitmeReveal>

        <FitmeReveal delay={0.14}>
          <article className="fitme-account-card">
            <p className="fitme-eyebrow">Confidentialité</p>
            <p className="fitme-lead">Vos photos restent privées. Vous pouvez les supprimer à tout moment.</p>
            <button type="button" className="fitme-cta fitme-cta--ghost" disabled={busy} onClick={() => void deletePhotos()}>
              {busy ? "Suppression…" : "Supprimer mes photos"}
            </button>
            {message ? <p className="fitme-success">{message}</p> : null}
          </article>
        </FitmeReveal>

        <FitmeReveal delay={0.18}>
          <article className="fitme-account-card">
            <p className="fitme-eyebrow fitme-danger">Zone sensible</p>
            <p className="fitme-lead">La suppression du compte est définitive.</p>
            <button
              type="button"
              className="fitme-cta fitme-cta--ghost"
              disabled={busy}
              onClick={() => void deleteAccount()}
            >
              Supprimer mon compte
            </button>
          </article>
        </FitmeReveal>
      </section>
    </FitmeAppShell>
  );
}
