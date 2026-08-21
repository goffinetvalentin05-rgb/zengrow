"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
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
        <p className="fitme-eyebrow">Compte</p>
        <h1>Bonjour {hello}</h1>
        <p className="fitme-lead">{email}</p>

        {analyses.length ? (
          analyses.map((card) => {
            const action = actionFor(card);
            return (
              <article key={card.id} className="fitme-account-card">
                <p className="fitme-eyebrow">Style Profile</p>
                <p className="fitme-display" style={{ fontSize: "1.6rem", marginTop: "0.4rem" }}>
                  {card.primaryStyle ??
                    (["preview_ready", "awaiting_payment"].includes(card.status)
                      ? "Prêt à débloquer"
                      : "Analyse en cours")}
                </p>
                <p className="fitme-fine">
                  {new Date(card.createdAt).toLocaleDateString("fr-CH")}
                </p>
                <div style={{ marginTop: "1rem" }}>
                  <Link href={action.href} className="fitme-cta fitme-cta--block">
                    {action.label}
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <article className="fitme-account-card">
            <p className="fitme-lead">Aucun Style Profile pour le moment.</p>
            <Link href="/start" className="fitme-cta fitme-cta--block" style={{ marginTop: "1rem" }}>
              Découvrir mon style
            </Link>
          </article>
        )}

        <article className="fitme-account-card">
          <p className="fitme-eyebrow">Paramètres</p>
          <p className="fitme-lead">Vos photos restent privées. Vous pouvez les supprimer à tout moment.</p>
          <button type="button" className="fitme-cta fitme-cta--ghost" disabled={busy} onClick={() => void deletePhotos()}>
            {busy ? "Suppression…" : "Supprimer mes photos"}
          </button>
          <button
            type="button"
            className="fitme-cta fitme-cta--ghost"
            style={{ marginTop: "0.7rem" }}
            disabled={busy}
            onClick={() => void deleteAccount()}
          >
            Supprimer mon compte
          </button>
          {message ? <p className="fitme-note">{message}</p> : null}
        </article>
      </section>
    </FitmeAppShell>
  );
}
